import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getAdmin } from "../_lib/firebaseAdmin.js";
import { requireUser } from "../_lib/requireUser.js";
import { notifyDiscord } from "../_lib/discordLogger.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

    const user = await requireUser(req, { roles: ["EDUCATOR", "ADMIN"] });
    const educatorId = user.uid;

    const studentId = String(req.body?.studentId || "").trim();
    if (!studentId) return res.status(400).json({ error: "Missing studentId" });

    const admin = getAdmin();
    const db = admin.firestore();

    const educatorSnap = await db.doc(`educators/${educatorId}`).get();
    const tenantSlug = educatorSnap.data()?.tenantSlug as string | undefined;

    const batch = db.batch();

    batch.delete(db.doc(`educators/${educatorId}/students/${studentId}`));

    batch.set(
      db.doc(`educators/${educatorId}/billingSeats/${studentId}`),
      {
        status: "inactive",
        revokedAt: admin.firestore.FieldValue.serverTimestamp(),
        revokedBy: educatorId,
      },
      { merge: true }
    );

    const userUpdate: Record<string, any> = {
      educatorId: admin.firestore.FieldValue.delete(),
      batchId: admin.firestore.FieldValue.delete(),
      courseId: admin.firestore.FieldValue.delete(),
      tenantSlug: admin.firestore.FieldValue.delete(),
    };
    if (tenantSlug) {
      userUpdate.enrolledTenants = admin.firestore.FieldValue.arrayRemove(tenantSlug);
    }
    batch.update(db.doc(`users/${studentId}`), userUpdate);

    await batch.commit();

    return res.json({ ok: true });
  } catch (e: any) {
    console.error(e);
    await notifyDiscord(e, req, "delete-student");
    return res.status(500).json({ error: e?.message || "Server error" });
  }
}
