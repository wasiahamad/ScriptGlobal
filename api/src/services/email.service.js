import nodemailer from "nodemailer";
import { env } from "../config/env.js";

let transporter;
function getTransporter() {
  if (!env.email.host || !env.email.user || !env.email.pass || !env.email.notifyTo) return null;
  transporter ||= nodemailer.createTransport({
    host: env.email.host,
    port: env.email.port,
    secure: env.email.secure,
    auth: { user: env.email.user, pass: env.email.pass },
  });
  return transporter;
}

export async function sendContactNotification(inquiry) {
  const mailer = getTransporter();
  if (!mailer) {
    console.warn("Contact email notification skipped: SMTP configuration is incomplete");
    return false;
  }
  await mailer.sendMail({
    from: env.email.from,
    to: env.email.notifyTo,
    replyTo: inquiry.email,
    subject: `New contact inquiry from ${inquiry.name}`,
    text: [
      `Name: ${inquiry.name}`,
      `Email: ${inquiry.email}`,
      `Phone: ${inquiry.phone || "Not provided"}`,
      `Research area: ${inquiry.researchArea || "Not provided"}`,
      `Service: ${inquiry.serviceRequired || "Not provided"}`,
      "",
      inquiry.projectDescription,
    ].join("\n"),
  });
  return true;
}
