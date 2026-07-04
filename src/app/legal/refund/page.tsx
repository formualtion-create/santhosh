import { LegalLayout, H, P, UL } from "@/components/Legal";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cancellation & Refund Policy",
  description: "PawsPair cancellation and refund policy for memberships, aligned with the Consumer Protection Act, 2019 and RBI e-mandate rules.",
  alternates: { canonical: "/legal/refund" },
};

export default function Refund() {
  return (
    <LegalLayout title="Cancellation & Refund Policy" intro="Aligned with the Consumer Protection Act, 2019 · Last updated: 25 June 2026.">
      <H>1. Free plan</H>
      <P>The Sniff plan is free. No payment is taken, so no refund applies.</P>

      <H>2. Cancelling a paid plan</H>
      <UL items={[
        "You can cancel a paid membership anytime from the Membership page.",
        "On cancellation, paid features remain active until the end of your current billing cycle; the plan then reverts to Sniff.",
        "Auto-renewal stops immediately on cancellation. You receive a pre-debit notice before each renewal under RBI e-mandate rules.",
      ]} />

      <H>3. Refunds</H>
      <UL items={[
        "If you were charged in error or experienced a verified service failure, contact us within 7 days for a full or pro-rata refund.",
        "Approved refunds are returned to the original payment method, typically within 5–7 business days.",
        "Subscription fees for a cycle already used are generally non-refundable, except as required by law or in case of our error.",
      ]} />

      <H>4. How to request</H>
      <P>Email <b>billing@pawspair.in</b> with your registered email and transaction reference, or raise a request via the Grievance Redressal page. We acknowledge within 48 hours.</P>

      <H>5. Demo notice</H>
      <P>This application is a demonstration. No real payments are processed, so no real charges or refunds occur.</P>
    </LegalLayout>
  );
}
