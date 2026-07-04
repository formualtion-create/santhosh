import Link from "next/link";
import { LegalLayout, H, P, UL } from "@/components/Legal";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Community Guidelines",
  description: "PawsPair's Community Guidelines — the kindness-first, animal-welfare-first rules of conduct every member agrees to, aligned with Indian law and the IT Rules, 2021.",
  alternates: { canonical: "/legal/community" },
};

export default function Community() {
  return (
    <LegalLayout
      title="Community Guidelines"
      intro="PawsPair is a kind, safe, verified community for pet parents. These guidelines apply to every member and are part of our Terms. Published in line with the Information Technology (Intermediary Guidelines) Rules, 2021."
    >
      <P>Our promise is simple: <b>every pet deserves a best friend, and every member deserves respect.</b> By using PawsPair you agree to uphold these values. Breaking them can lead to warnings, content removal, suspension or a permanent ban.</P>

      <H>1. Be kind &amp; respectful</H>
      <UL items={[
        "Treat every member and every animal with kindness. No harassment, hate speech, bullying, threats or discrimination of any kind.",
        "No sexual content, nudity, or unwanted advances. PawsPair is about pets — not a place for romantic or sexual solicitation.",
        "Assume good faith, communicate honestly, and respect a “no”.",
      ]} />

      <H>2. Put animal welfare first</H>
      <UL items={[
        "Treat all animals humanely, in keeping with the Prevention of Cruelty to Animals Act, 1960 and AWBI guidelines.",
        "No animal cruelty, neglect, fighting, or content that depicts or promotes harm to animals.",
        "Any family-planning (litter) arrangement must be responsible, health-screened, age-appropriate and never commercial mass-breeding / puppy-mill activity.",
        "Ensure pets are vaccinated and healthy before any real-world meeting.",
      ]} />

      <H>3. Be real &amp; honest</H>
      <UL items={[
        "One genuine account per person. No fake, impersonating, or bot profiles.",
        "Use real, accurate information and your own photos. No stolen or stock images passed off as your pet.",
        "Complete verification honestly — it keeps everyone safe.",
      ]} />

      <H>4. Prohibited content &amp; conduct</H>
      <P>In line with the IT Rules, 2021, you must not post, share or transmit anything that:</P>
      <UL items={[
        "Is unlawful, defamatory, obscene, harmful to children, or invasive of another's privacy;",
        "Is a scam or fraud — including the sale of animals for money, advance-payment/“courier the puppy” schemes, or moving members off-platform to defraud them;",
        "Infringes intellectual property, or impersonates any person or organisation;",
        "Contains malware, spam, or solicits money, donations or personal/financial information;",
        "Threatens the unity, integrity, defence, security or sovereignty of India, public order, or incites any offence.",
      ]} />

      <H>5. Keep it on PawsPair &amp; stay safe</H>
      <UL items={[
        "Keep chats and any payments on PawsPair. Never pay an advance or deposit for a pet you haven't met.",
        "Meet first in a public place, in daylight, and tell a trusted contact — use our Safety check-in.",
        "Read the full Safety Center for detailed guidance.",
      ]} />

      <H>6. Reporting &amp; enforcement</H>
      <P>You can report or block any member from their profile. Our safety team reviews every report. We may remove content and suspend or ban accounts that break these guidelines, and — where the law requires — cooperate with authorities.</P>
      <P>Grievances are handled under our published <Link href="/legal/grievance" className="text-acc" style={{ fontWeight: 700 }}>Grievance Redressal</Link> mechanism, with acknowledgement within 24 hours and resolution within 15 days as required by the IT Rules, 2021.</P>

      <H>7. Your data &amp; consent</H>
      <P>We collect and process your data transparently and only to run and improve PawsPair, under the Digital Personal Data Protection (DPDP) Act, 2023. You can access, export or permanently delete your data anytime from <Link href="/account" className="text-acc" style={{ fontWeight: 700 }}>My account</Link>. See our <Link href="/legal/privacy" className="text-acc" style={{ fontWeight: 700 }}>Privacy Policy</Link>.</P>

      <P><b>Thank you for helping keep PawsPair kind, safe and joyful for pets and their people. 🐾</b></P>
    </LegalLayout>
  );
}
