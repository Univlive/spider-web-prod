import type { VercelRequest, VercelResponse } from "@vercel/node";
import nodemailer from "nodemailer";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { name, coaching, phone, email, exam, date } = req.body ?? {};
  if (!name || !coaching || !phone || !exam) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const body = [
    `Name: ${name}`,
    `Coaching: ${coaching}`,
    `Phone: ${phone}`,
    email ? `Email: ${email}` : null,
    `Exam Focus: ${exam}`,
    date ? `Preferred Date: ${date}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  await Promise.allSettled([
    transporter.sendMail({
      from: process.env.SMTP_USER,
      to: "support@univ.live",
      subject: `Demo Request — ${coaching}`,
      text: body,
    }),
    fetch(
      "https://discord.com/api/webhooks/1503100318580478134/SpG-_TAk08MrcJgpEeP3NX7vxPWyIEdpsZ3HMkihme2HwadPlEiBAr5wSacR1yDEWVLz",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          embeds: [
            {
              title: `🎯 New Demo Request — ${coaching}`,
              color: 0x6c47ff,
              fields: [
                { name: "Name", value: name, inline: true },
                { name: "Coaching", value: coaching, inline: true },
                { name: "Phone", value: phone, inline: true },
                { name: "Exam Focus", value: exam, inline: true },
                email ? { name: "Email", value: email, inline: true } : null,
                date ? { name: "Preferred Date", value: date, inline: true } : null,
              ].filter(Boolean),
              timestamp: new Date().toISOString(),
            },
          ],
        }),
      }
    ),
  ]);

  res.status(200).json({ ok: true });
}
