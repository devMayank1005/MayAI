import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const SMTP_CONFIGS = [
  { port: 587, secure: false, requireTLS: true },
  { port: 2525, secure: false, requireTLS: true },
  { port: 465, secure: true, requireTLS: false },
];

const RETRYABLE_NETWORK_ERRORS = [
  "ETIMEDOUT",
  "ECONNECTION",
  "ECONNREFUSED",
  "ENETUNREACH",
  "EHOSTUNREACH",
  "ESOCKET",
];

function getAuth() {
  const smtpUser = process.env.BREVO_SMTP_USER;
  const smtpPass = process.env.BREVO_SMTP_PASS;
  const apiKey = process.env.BREVO_API_KEY;

  if (!smtpUser || !smtpPass) {
    throw new Error("BREVO_SMTP_USER and BREVO_SMTP_PASS are required");
  }

  return { smtpUser, smtpPass, apiKey };
}

function createTransporter(config) {
  const { smtpUser, smtpPass } = getAuth();

  return nodemailer.createTransport({
    host: "smtp-relay.brevo.com",
    port: config.port,
    secure: config.secure,
    requireTLS: config.requireTLS,
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });
}

function maskValue(value) {
  if (!value) {
    return "<missing>";
  }

  if (value.length <= 4) {
    return "****";
  }

  return `${value.slice(0, 2)}***${value.slice(-2)}`;
}

async function sendViaBrevoApi({ to, subject, html, text, fromEmail }) {
  const { apiKey } = getAuth();

  if (!apiKey) {
    throw new Error("BREVO_API_KEY is not configured");
  }

  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      "api-key": apiKey,
    },
    body: JSON.stringify({
      sender: {
        email: fromEmail,
        name: "MayAi",
      },
      to: [{ email: to }],
      subject,
      htmlContent: html,
      textContent: text,
    }),
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload?.message || `Brevo API failed with status ${response.status}`);
  }

  console.log("[mail] Brevo API email accepted", {
    to,
    subject,
    messageId: payload?.messageId || null,
  });

  return {
    messageId: payload?.messageId || null,
    response: "Brevo API accepted",
    accepted: [to],
    rejected: [],
    pending: [],
  };
}

export async function verifyMailTransport() {
  const { smtpUser, apiKey } = getAuth();
  const senderEmail = process.env.BREVO_SENDER_EMAIL || smtpUser;

  if (apiKey) {
    try {
      const accountRes = await fetch("https://api.brevo.com/v3/account", {
        headers: {
          accept: "application/json",
          "api-key": apiKey,
        },
      });

      if (accountRes.ok) {
        console.log("[mail] Brevo API verification passed", {
          smtpUser: maskValue(smtpUser),
          senderEmail,
          nodeEnv: process.env.NODE_ENV,
        });
        return;
      }
    } catch (error) {
      console.error("[mail] Brevo API verification failed", {
        message: error.message,
      });
    }
  }

  const failures = [];

  for (const config of SMTP_CONFIGS) {
    try {
      const transporter = createTransporter(config);
      await transporter.verify();

      console.log("[mail] SMTP transport verification passed", {
        host: "smtp-relay.brevo.com",
        port: config.port,
        smtpUser: maskValue(smtpUser),
        senderEmail,
        nodeEnv: process.env.NODE_ENV,
      });
      return;
    } catch (error) {
      failures.push({
        port: config.port,
        code: error.code || null,
        message: error.message,
      });
    }
  }

  console.error("[mail] SMTP transport verification failed", {
    failures,
    smtpUser: maskValue(smtpUser),
    senderEmail,
    nodeEnv: process.env.NODE_ENV,
  });
}

export async function sendEmail({ to, subject, html, text }) {
  const { smtpUser } = getAuth();
  const fromEmail = process.env.BREVO_SENDER_EMAIL || smtpUser;

  try {
    return await sendViaBrevoApi({ to, subject, html, text, fromEmail });
  } catch (apiError) {
    console.error("[mail] Brevo API send failed, falling back to SMTP", {
      message: apiError.message,
      to,
      subject,
    });
  }

  const failures = [];

  for (const config of SMTP_CONFIGS) {
    try {
      const transporter = createTransporter(config);
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
        port: config.port,
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
      if (RETRYABLE_NETWORK_ERRORS.includes(error.code)) {
        failures.push({
          port: config.port,
          code: error.code,
          message: error.message,
        });
        continue;
      }

      console.error("Email sending failed:", error.message);
      throw error;
    }
  }

  console.error("Email sending failed on all SMTP configs:", failures);
  throw new Error("All mail delivery methods failed");
}
