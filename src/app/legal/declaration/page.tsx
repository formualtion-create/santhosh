import { LegalLayout, H, P, UL } from "@/components/Legal";
import DeclarationAccept from "@/components/DeclarationAccept";
import { getCurrentUser } from "@/lib/auth";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "User Declaration & Acceptance",
  description: "The PawsPair User Declaration & Acceptance — your binding confirmation that the information you provide is true, and your acceptance of our bylaws and policies.",
  alternates: { canonical: "/legal/declaration" },
};

export default async function Declaration() {
  const user = await getCurrentUser();
  const acceptedAt = user?.declarationAcceptedAt ? new Date(user.declarationAcceptedAt).toISOString() : null;
  return (
    <LegalLayout title="User Declaration & Acceptance" intro="To be accepted by every member at registration · PawsPair Technologies Pvt. Ltd., India.">
      <P>By creating an account and ticking the acceptance box at registration, I (the &quot;Member&quot;) make the following declaration to PawsPair Technologies Pvt. Ltd. (&quot;PawsPair&quot;). This declaration is an electronic record under the Information Technology Act, 2000 and does not require a physical signature.</P>

      <H>1. Truthfulness of information</H>
      <P>I solemnly declare that all information I have provided — including my name, contact details, location, identity-verification reference, and the details of my pet (name, species, breed, age, health and vaccination status) — is true, accurate, complete and current to the best of my knowledge and belief.</P>

      <H>2. Identity &amp; authority</H>
      <UL items={[
        "I am at least 18 years of age and legally competent to enter into this agreement under the Indian Contract Act, 1872.",
        "I am the lawful owner or authorised guardian of the pet I have listed, and I am entitled to share its information.",
        "The identity document I have referenced belongs to me and has been provided lawfully.",
      ]} />

      <H>3. Lawful &amp; responsible use</H>
      <UL items={[
        "I will use PawsPair only for lawful purposes and in good faith.",
        "I will treat all animals and members with kindness and respect, and will not engage in fraud, harassment, impersonation, cruelty or any unlawful activity.",
        "Any family-planning (litter) arrangement I pursue will comply with the Prevention of Cruelty to Animals Act, 1960 and Animal Welfare Board of India (AWBI) guidelines.",
        "I take full responsibility for my own conduct and safety during any meeting arranged through the platform.",
      ]} />

      <H>4. Acceptance of bylaws &amp; policies</H>
      <P>I confirm that I have read, understood and agree to be bound by PawsPair&apos;s bylaws and policies, namely the Terms &amp; Conditions, the Privacy Policy (DPDP Act, 2023), the Cancellation &amp; Refund Policy, the Grievance Redressal mechanism, and the Community &amp; Safety guidelines, each as amended from time to time.</P>

      <H>5. Consent to data processing</H>
      <P>I consent to PawsPair collecting, processing and storing my personal data for the purposes described in the Privacy Policy, in accordance with the Digital Personal Data Protection (DPDP) Act, 2023. I understand I may withdraw consent, and access, correct or erase my data, at any time.</P>

      <H>6. Acknowledgement of consequences</H>
      <P>I understand and accept that if any information I have provided is found to be false, misleading or incomplete, PawsPair may suspend or permanently terminate my account, withhold or revoke verification, and, where required, report the matter to the appropriate authorities. I agree to indemnify PawsPair against any loss arising from a breach of this declaration.</P>

      <H>7. Governing law</H>
      <P>This declaration is governed by the laws of India and is subject to the exclusive jurisdiction of the courts at Bengaluru, Karnataka, without prejudice to any applicable consumer-protection rights.</P>

      <P><b>Declared electronically and accepted at the time of registration, with the date and time recorded in PawsPair&apos;s systems.</b></P>

      <hr className="decl-rule" />
      <DeclarationAccept authed={!!user} acceptedAt={acceptedAt} />
    </LegalLayout>
  );
}
