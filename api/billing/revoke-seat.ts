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

    const seatDoc = await db.doc(`educators/${educatorId}/billingSeats/${studentId}`).get();
    const batchId = seatDoc.data()?.batchId as string | undefined;

    const batch = db.batch();

    batch.set(
      db.doc(`educators/${educatorId}/billingSeats/${studentId}`),
      {
        status: "inactive",
        revokedAt: admin.firestore.FieldValue.serverTimestamp(),
        revokedBy: educatorId,
        batchId: admin.firestore.FieldValue.delete(),
      },
      { merge: true }
    );

    batch.update(db.doc(`educators/${educatorId}/students/${studentId}`), {
      batchId: admin.firestore.FieldValue.delete(),
    });

    batch.update(db.doc(`users/${studentId}`), {
      batchId: admin.firestore.FieldValue.delete(),
    });

    if (batchId) {
      batch.update(db.doc(`educators/${educatorId}/batches/${batchId}`), {
        usedSeats: admin.firestore.FieldValue.increment(-1),
      });
    }

    await batch.commit();

    return res.json({ ok: true });
  } catch (e: any) {
    console.error(e);
    await notifyDiscord(e, req, "revoke-seat");
    return res.status(500).json({ error: e?.message || "Server error" });
  }
}
