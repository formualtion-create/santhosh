import { LegalLayout, H, P, UL } from "@/components/Legal";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Grievance Redressal",
  description: "Contact the PawsPair Grievance & Data Protection Officer. Complaint process and timelines under the IT Rules, 2021 and DPDP Act, 2023.",
  alternates: { canonical: "/legal/grievance" },
};

export default function Grievance() {
  return (
    <LegalLayout title="Grievance Redressal" intro="As required by the IT Rules, 2021 and the DPDP Act, 2023 · Last updated: 25 June 2026.">
      <H>Grievance Officer</H>
      <P>In accordance with the Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021 and the DPDP Act, 2023, the contact details of our Grievance &amp; Data Protection Officer are below.</P>
      <UL items={[
        <><b>Name:</b> Grievance Officer, PawsPair Technologies Pvt. Ltd.</>,
        <><b>Email:</b> grievance@pawspair.in</>,
        <><b>Address:</b> PawsPair Technologies Pvt. Ltd., Bengaluru, Karnataka, India</>,
        <><b>Hours:</b> Monday–Friday, 10:00–18:00 IST</>,
      ]} />

      <H>How to raise a complaint</H>
      <UL items={[
        "Email the Grievance Officer with your registered email, a description of the issue, and any evidence.",
        "We acknowledge every complaint within 24 hours of receipt.",
        "We aim to resolve complaints within 15 days, and time-sensitive safety issues much sooner.",
      ]} />

      <H>Safety &amp; abuse</H>
      <P>To report unsafe behaviour, fake profiles, or animal-welfare concerns, use the in-app report option or email <b>safety@pawspair.in</b>. Urgent safety reports are prioritised and may lead to immediate suspension pending review.</P>

      <H>Escalation</H>
      <P>If you are not satisfied with the resolution, you may escalate to the relevant authority, including the Data Protection Board of India under the DPDP Act, 2023.</P>
    </LegalLayout>
  );
}
