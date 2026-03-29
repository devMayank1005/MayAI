import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

// Create transporter with Brevo SMTP credentials.
function createTransporter() {
  const smtpUser = process.env.BREVO_SMTP_USER;
  const smtpPass = process.env.BREVO_SMTP_PASS;

  if (!smtpUser || !smtpPass) {
    throw new Error("BREVO_SMTP_USER and BREVO_SMTP_PASS are required");
  }

  return nodemailer.createTransport({
    host: "smtp-relay.brevo.com",
    port: 587,
    secure: false,
    requireTLS: true,
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });
}

// Send Email
export async function sendEmail({ to, subject, html, text }) {
  try {
    const transporter = createTransporter();
    const fromEmail = process.env.BREVO_SENDER_EMAIL || process.env.BREVO_SMTP_USER;

    const info = await transporter.sendMail({
      from: fromEmail,
      to,
      subject,
      html,
      text,
    });

    const accepted = Array.isArray(info.accepted) ? info.accepted : [];
    const rejected = Array.isArray(info.rejected) ? info.rejected : [];
    const pending = Array.isArray(info.pending) ? info.pending : [];

    console.log("Email send response:", info.response);
    console.log("Email delivery diagnostics:", {
      subject,
      to,
      from: fromEmail,
      accepted,
      rejected,
      pending,
      messageId: info.messageId,
    });

    return info;
  } catch (error) {
    console.error("Email sending failed:", error.message);
    throw error;
  }
}