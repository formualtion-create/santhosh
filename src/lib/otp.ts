import { randomInt } from "crypto";
import { prisma } from "./db";
import { sendEmail, otpEmail, emailEnabled } from "./email";

export function genOtp() {
  return String(randomInt(0, 1_000_000)).padStart(6, "0"); // CSPRNG 6-digit code
}

// Issues a fresh OTP for the user, stores it (10-min expiry) and emails it.
// Returns the code only when email isn't configured (so the demo stays testable).
export async function issueAndSendOtp(user: { id: string; email: string; ownerName: string }) {
  const code = genOtp();
  await prisma.user.update({
    where: { id: user.id },
    data: { emailOtp: code, emailOtpExp: new Date(Date.now() + 10 * 60 * 1000) },
  });
  void sendEmail({ to: user.email, subject: "Your PawsPair verification code", html: otpEmail(code, user.ownerName.split(" ")[0]) });
  return { code, emailed: emailEnabled() };
}
