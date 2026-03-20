import nodemailer from "nodemailer";
import { google } from "googleapis";

import dotenv from "dotenv";
dotenv.config();


// OAuth2 Client
const oAuth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  "https://developers.google.com/oauthplayground"
);

// Set refresh token
oAuth2Client.setCredentials({
  refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
});

// Generate access token
async function getAccessToken() {
  const accessTokenResponse = await oAuth2Client.getAccessToken();

  if (!accessTokenResponse || !accessTokenResponse.token) {
    throw new Error("Failed to generate access token");
  }

  return accessTokenResponse.token;
}

// Create transporter
async function createTransporter() {
  const accessToken = await getAccessToken();

  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      type: "OAuth2",
      user: process.env.GOOGLE_USER,
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
      accessToken: accessToken,
    },
  });
}

// Send Email
export async function sendEmail({ to, subject, html, text }) {
  try {
    const transporter = await createTransporter();

    const info = await transporter.sendMail({
      from: process.env.GOOGLE_USER,
      to,
      subject,
      html,
      text,
    });

    console.log("Email sent:", info.response);

  } catch (error) {
    console.error("Email sending failed:", error.message);
    throw error;
  }
}