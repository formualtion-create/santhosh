import { LegalLayout, H, P, UL } from "@/components/Legal";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description: "PawsPair Terms & Conditions — eligibility, verification, acceptable use, animal-welfare rules and subscriptions, under Indian law.",
  alternates: { canonical: "/legal/terms" },
};

export default function Terms() {
  return (
    <LegalLayout title="Terms & Conditions" intro="Last updated: 25 June 2026 · Operated by PawsPair Technologies Pvt. Ltd., India.">
      <H>1. Who we are &amp; acceptance</H>
      <P>PawsPair is a pet matchmaking and social platform operated by PawsPair Technologies Pvt. Ltd. (&quot;PawsPair&quot;, &quot;we&quot;). By creating an account you confirm you have read and agree to these Terms, our Privacy Policy and our Community &amp; Safety guidelines. These Terms are an electronic record under the Information Technology Act, 2000 and the IT (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021.</P>

      <H>2. Eligibility</H>
      <UL items={[
        "You must be at least 18 years of age and competent to contract under the Indian Contract Act, 1872.",
        "You must be the lawful guardian of the pet you list, and provide accurate information.",
        "Accounts must complete identity verification before accessing other members' profiles.",
      ]} />

      <H>3. Verification</H>
      <P>To keep the community safe, members complete identity verification (e.g. Aadhaar/DigiLocker, passport, or driving licence) through a licensed verification provider. We retain only a masked reference, never your full document number. We may suspend or remove accounts that fail verification or provide false information.</P>

      <H>4. Acceptable use &amp; animal welfare</H>
      <UL items={[
        "No harassment, fraud, impersonation, or unlawful, obscene or harmful content.",
        "Family-planning (litter) listings must comply with the Prevention of Cruelty to Animals Act, 1960 and Animal Welfare Board of India (AWBI) guidelines, including health and age requirements.",
        "No sale of animals where prohibited, and no activity that endangers animal welfare.",
        "You are responsible for your conduct during any meeting arranged through the platform.",
      ]} />

      <H>5. Subscriptions &amp; payments</H>
      <P>Paid memberships are billed in INR inclusive of GST, auto-renew until cancelled, and are governed by our Cancellation &amp; Refund Policy. Payments are handled by a PCI-DSS-compliant gateway; we do not store card details. Renewals follow RBI e-mandate rules, including advance pre-debit notification.</P>

      <H>6. Content &amp; licence</H>
      <P>You retain ownership of the content you upload, and grant PawsPair a limited licence to host and display it to operate the service. You are responsible for ensuring you have the rights to any content (including pet photographs) you post.</P>

      <H>7. Intermediary status &amp; grievance redressal</H>
      <P>PawsPair acts as an intermediary. We will act on valid complaints in line with the IT Rules, 2021. Our Grievance Officer&apos;s details and timelines are on the Grievance Redressal page.</P>

      <H>8. Limitation of liability</H>
      <P>PawsPair facilitates introductions but does not guarantee outcomes, conduct of members, or the health/temperament of any animal. To the extent permitted by law, our liability is limited to the fees you paid in the preceding three months.</P>

      <H>9. Termination</H>
      <P>You may delete your account anytime from My Account. We may suspend accounts that breach these Terms. Certain records may be retained where required by law.</P>

      <H>10. Governing law</H>
      <P>These Terms are governed by the laws of India. Disputes are subject to the exclusive jurisdiction of the courts at Bengaluru, Karnataka, subject to applicable consumer-protection rights.</P>
    </LegalLayout>
  );
}
