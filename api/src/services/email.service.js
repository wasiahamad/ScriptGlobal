import nodemailer from "nodemailer";
import { env } from "../config/env.js";

let transporter;
function getTransporter() {
  if (!env.email.host || !env.email.user || !env.email.pass) return null;
  transporter ||= nodemailer.createTransport({
    host: env.email.host,
    port: env.email.port,
    secure: env.email.secure,
    auth: { user: env.email.user, pass: env.email.pass },
  });
  return transporter;
}

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export async function sendContactNotification(inquiry) {
  const mailer = getTransporter();
  if (!mailer || !env.email.notifyTo) {
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

export async function sendContactAutoReply(inquiry) {
  const mailer = getTransporter();
  if (!mailer) {
    console.warn("Contact auto-reply skipped: SMTP configuration is incomplete");
    return false;
  }

  const name = escapeHtml(inquiry.name || "there");
  const researchArea = escapeHtml(inquiry.researchArea || "Not provided");
  const service = escapeHtml(inquiry.serviceRequired || "Not provided");

  await mailer.sendMail({
    from: env.email.from,
    to: inquiry.email,
    replyTo: env.email.notifyTo,
    subject: "Thank you for contacting SciScript",
    text: [
      `Dear ${inquiry.name || "there"},`,
      "",
      "Thank you for contacting SciScript Global Scientific Writing Services.",
      "We have received your message and our team will review your requirements carefully.",
      "A member of our team will get back to you within 1–2 business days.",
      "",
      `Research area: ${inquiry.researchArea || "Not provided"}`,
      `Service requested: ${inquiry.serviceRequired || "Not provided"}`,
      "",
      "We appreciate your interest in working with us.",
      "",
      "Kind regards,",
      "SciScript Global Scientific Writing Services",
    ].join("\n"),
    html: `
      <div style="margin:0;background:#f5f7f7;padding:32px 16px;font-family:Arial,sans-serif;color:#172126">
        <div style="max-width:620px;margin:0 auto;background:#ffffff;border:1px solid #dce7e6;border-radius:16px;overflow:hidden">
          <div style="background:#082f2e;padding:28px 32px;color:#ffffff">
            <div style="font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#7dd3c7">SciScript</div>
            <h1 style="margin:10px 0 0;font-size:24px;line-height:1.3">Thank you for contacting us</h1>
          </div>
          <div style="padding:32px">
            <p style="font-size:16px;line-height:1.7;margin-top:0">Dear ${name},</p>
            <p style="font-size:15px;line-height:1.7">Thank you for contacting SciScript Global Scientific Writing Services. We have received your message and our team will review your requirements carefully.</p>
            <p style="font-size:15px;line-height:1.7">A member of our team will get back to you within <strong>1–2 business days</strong>.</p>
            <div style="margin:24px 0;padding:18px 20px;background:#f0fdfa;border-left:4px solid #0f766e;border-radius:8px;font-size:14px;line-height:1.8">
              <div><strong>Research area:</strong> ${researchArea}</div>
              <div><strong>Service requested:</strong> ${service}</div>
            </div>
            <p style="font-size:15px;line-height:1.7">We appreciate your interest in working with us.</p>
            <p style="font-size:15px;line-height:1.7;margin-bottom:0">Kind regards,<br><strong>SciScript Global Scientific Writing Services</strong></p>
          </div>
          <div style="padding:18px 32px;background:#f8fafc;color:#64748b;font-size:12px">This is an automated acknowledgement of your enquiry. Please reply to this email if you need to add information.</div>
        </div>
      </div>
    `,
  });
  return true;
}
