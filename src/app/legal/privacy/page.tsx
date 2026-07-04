import { LegalLayout, H, P, UL } from "@/components/Legal";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy (DPDP Act 2023)",
  description: "How PawsPair collects, uses and protects your personal data, your rights, and our compliance with the Digital Personal Data Protection (DPDP) Act, 2023.",
  alternates: { canonical: "/legal/privacy" },
};

export default function Privacy() {
  return (
    <LegalLayout title="Privacy Policy" intro="Compliant with the Digital Personal Data Protection (DPDP) Act, 2023 · Last updated: 25 June 2026.">
      <H>1. Data Fiduciary</H>
      <P>PawsPair Technologies Pvt. Ltd. is the Data Fiduciary for personal data processed on this platform. We process your data lawfully, for specified purposes, and only with your consent or as otherwise permitted by the DPDP Act, 2023.</P>

      <H>2. What we collect</H>
      <UL items={[
        "Account & contact: name, email, mobile number, city and approximate location.",
        "Verification: document type and a masked reference (never the full ID number).",
        "Pet details: species, breed, age, temperament, photos and intent.",
        "Usage & device data needed to run and secure the service.",
      ]} />

      <H>3. Why we use it (purpose)</H>
      <UL items={[
        "To create your profile and verify your identity for community safety.",
        "To show you relevant, nearby verified matches and enable consent-based connections.",
        "To process subscriptions and prevent fraud and abuse.",
        "To send service messages, and — only with your separate consent — marketing.",
      ]} />

      <H>4. Consent &amp; your rights</H>
      <P>We rely on your consent, which you may withdraw at any time. Under the DPDP Act you have the right to access, correct, and erase your data, to nominate a representative, and to grievance redressal. Use <b>Export my data</b> and <b>Delete my account</b> in My Account to exercise these rights directly.</P>

      <H>5. Storage, security &amp; localisation</H>
      <UL items={[
        "Data is encrypted in transit (TLS) and at rest; passwords are hashed.",
        "Indian users' data is stored on servers located in India.",
        "Access is restricted on a need-to-know basis with audit logging.",
        "We retain data only as long as necessary, or as required by law.",
      ]} />

      <H>6. Sharing</H>
      <P>We share data only with processors that help us run the service (e.g. verification and payment providers) under contract, and where required by law. We do not sell your personal data.</P>

      <H>7. Children</H>
      <P>The service is for adults (18+). We do not knowingly process the data of children.</P>

      <H>8. Grievances</H>
      <P>For any privacy concern, contact our Data Protection &amp; Grievance Officer (see the Grievance Redressal page). We acknowledge within 24 hours and resolve within the statutory timeline.</P>
    </LegalLayout>
  );
}
