import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getAdmin } from "../_lib/firebaseAdmin.js";
import { requireUser } from "../_lib/requireUser.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const user = await requireUser(req, { roles: ["EDUCATOR"] });

    // Employees cannot invite other employees — only org head can
    if (user.profile?.isEmployee) {
      return res.status(403).json({ error: "Only the org head can invite employees" });
    }

    const { email, name, roleId, branchIds = [] } = req.body || {};

    if (!email || !name || !roleId) {
      return res.status(400).json({ error: "email, name, and roleId are required" });
    }

    const admin = getAdmin();
    const db = admin.firestore();
    const auth = admin.auth();

    // Validate role exists and is active
    const roleDoc = await db.doc(`roles/${roleId}`).get();
    if (!roleDoc.exists) return res.status(400).json({ error: "Role not found" });
    if (roleDoc.data()?.status === "archived") {
      return res.status(400).json({ error: "Role is archived" });
    }

    // Get educator's tenantSlug for the employee's users doc
    const educatorDoc = await db.doc(`educators/${user.uid}`).get();
    const tenantSlug = educatorDoc.data()?.tenantSlug || "";

    // Create or find Firebase Auth user
    let firebaseUid: string;
    try {
      const existing = await auth.getUserByEmail(email);
      firebaseUid = existing.uid;
    } catch {
      const newUser = await auth.createUser({ email, displayName: name });
      firebaseUid = newUser.uid;
    }

    const now = admin.firestore.Timestamp.now();
    const inviteExpiresAt = admin.firestore.Timestamp.fromDate(
      new Date(Date.now() + 72 * 60 * 60 * 1000)
    );

    // Upsert employee doc
    const employeesRef = db.collection(`educators/${user.uid}/employees`);
    const existingEmp = await employeesRef.where("uid", "==", firebaseUid).limit(1).get();

    let employeeDocId: string;
    if (!existingEmp.empty) {
      employeeDocId = existingEmp.docs[0].id;
      await existingEmp.docs[0].ref.update({
        name,
        roleId,
        scope: { branchIds },
        status: "PENDING",
        invitedAt: now,
        inviteExpiresAt,
      });
    } else {
      const newDoc = await employeesRef.add({
        uid: firebaseUid,
        email,
        name,
        roleId,
        status: "PENDING",
        scope: { branchIds },
        invitedAt: now,
        activatedAt: null,
        lastLoginAt: null,
        inviteExpiresAt,
      });
      employeeDocId = newDoc.id;
    }

    // Write users/{uid} so employee can log in as EDUCATOR tied to this org
    await db.doc(`users/${firebaseUid}`).set(
      {
        role: "EDUCATOR",
        isEmployee: true,
        orgUid: user.uid,
        employeeDocId,
        tenantSlug,
        email,
        displayName: name,
      },
      { merge: true }
    );

    return res.status(200).json({ employeeDocId, firebaseUid });
  } catch (e: any) {
    console.error("[invite-employee]", e);
    return res.status(500).json({ error: e.message || "Internal server error" });
  }
}
