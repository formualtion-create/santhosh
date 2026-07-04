import nodemailer from "nodemailer";
import { escapeHtml } from "./security";

// Transactional email. Two providers, both env-gated (no-op until configured):
//  • Gmail SMTP  — set GMAIL_USER (e.g. pawspair@gmail.com) + GMAIL_APP_PASSWORD (16-char Google App Password)
//  • Resend      — set RESEND_API_KEY
// EMAIL_FROM controls the visible sender (defaults to the Gmail address).
const GMAIL_USER = process.env.GMAIL_USER;
const GMAIL_PASS = process.env.GMAIL_APP_PASSWORD;
const RESEND_KEY = process.env.RESEND_API_KEY;
const FROM = process.env.EMAIL_FROM || (GMAIL_USER ? `PawsPair <${GMAIL_USER}>` : "PawsPair <hello@pawspair.in>");

export function emailEnabled() {
  return !!((GMAIL_USER && GMAIL_PASS) || RESEND_KEY);
}

let transporter: nodemailer.Transporter | null = null;
function gmailTransport() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: GMAIL_USER, pass: GMAIL_PASS },
    });
  }
  return transporter;
}

// Fire-and-forget; never throws into the request path.
export async function sendEmail(opts: { to: string; subject: string; html: string }) {
  try {
    if (GMAIL_USER && GMAIL_PASS) {
      await gmailTransport().sendMail({ from: FROM, to: opts.to, subject: opts.subject, html: opts.html });
      return { ok: true };
    }
    if (RESEND_KEY) {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${RESEND_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({ from: FROM, to: opts.to, subject: opts.subject, html: opts.html }),
      });
      return { ok: res.ok };
    }
    return { skipped: true };
  } catch {
    return { ok: false };
  }
}

export function brandEmail(heading: string, body: string, cta?: { label: string; url: string }) {
  return `<!doctype html><html><body style="margin:0;background:#F7F7FB;font-family:system-ui,Segoe UI,Arial,sans-serif;color:#3A3656">
  <div style="max-width:520px;margin:0 auto;padding:28px 18px">
    <div style="background:#fff;border-radius:22px;padding:32px;box-shadow:0 14px 32px rgba(40,36,79,.08)">
      <div style="width:54px;height:54px;border-radius:16px;background:linear-gradient(135deg,#818CF8,#6366F1);margin:0 auto 16px"></div>
      <h1 style="font-size:1.4rem;color:#28244F;text-align:center;margin:0 0 12px">${heading}</h1>
      <div style="font-size:1rem;line-height:1.6;text-align:center;margin:0 0 18px">${body}</div>
      ${cta ? `<p style="text-align:center;margin:0"><a href="${cta.url}" style="display:inline-block;background:linear-gradient(135deg,#818CF8,#6366F1);color:#fff;font-weight:700;text-decoration:none;padding:12px 26px;border-radius:999px">${cta.label}</a></p>` : ""}
    </div>
    <p style="text-align:center;color:#8b82a8;font-size:.78rem;margin-top:16px">PawsPair · Made with 🐾 in India</p>
  </div></body></html>`;
}

export function otpEmail(code: string, name?: string) {
  const safeCode = escapeHtml(code);
  return brandEmail(
    "Verify your email 🐾",
    `${name ? `Hi ${escapeHtml(name)}, ` : ""}your PawsPair verification code is:<br>
     <span style="display:inline-block;font-size:2rem;font-weight:800;letter-spacing:8px;color:#6366F1;margin:14px 0;font-family:monospace">${safeCode}</span><br>
     This code expires in 10 minutes. If you didn't request it, you can ignore this email.`
  );
}

export function resetEmail(link: string, name?: string) {
  return brandEmail(
    "Reset your password 🔐",
    `${name ? `Hi ${escapeHtml(name)}, ` : ""}we received a request to reset your PawsPair password.
     Tap the button below to choose a new one. This link expires in 30 minutes.<br><br>
     If you didn't request this, you can safely ignore this email — your password won't change.`,
    { label: "Reset my password", url: link }
  );
}
