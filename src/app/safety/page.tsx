import Link from "next/link";
import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/auth";
import { Nav, Footer } from "@/components/ui";

export const metadata: Metadata = {
  title: "Safety Center — Stay safe on PawsPair",
  description:
    "How PawsPair keeps you safe: trust badges & verification, spotting pet/puppy scams, safe playdate meetups, ethical family planning, reporting and blocking, and your privacy controls.",
  alternates: { canonical: "/safety" },
};

function Card({ icon, title, children }: { icon: string; title: string; children: React.ReactNode }) {
  return (
    <div className="card" style={{ marginBottom: 16 }}>
      <h3 style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
        <span style={{ fontSize: "1.4rem" }} aria-hidden>{icon}</span>{title}
      </h3>
      {children}
    </div>
  );
}

function UL({ items }: { items: React.ReactNode[] }) {
  return (
    <ul style={{ listStyle: "disc", paddingLeft: 20, color: "var(--text)", display: "grid", gap: 8 }}>
      {items.map((it, i) => <li key={i}>{it}</li>)}
    </ul>
  );
}

export default async function Safety() {
  const user = await getCurrentUser();
  return (
    <>
      <Nav user={user} />
      <section className="section" style={{ paddingTop: 28 }}>
        <div className="container narrow" style={{ maxWidth: 820 }}>
          <span className="eyebrow">Trust &amp; safety</span>
          <h1 className="h-sec" style={{ margin: "10px 0 6px" }}>Safety Center</h1>
          <p className="lead" style={{ marginBottom: 22 }}>
            PawsPair is built for safe, kind, real-world connections between pet parents. Here&apos;s how we
            protect you — and how to protect yourself.
          </p>

          <Card icon="🛡" title="Look for trust badges">
            <p style={{ marginBottom: 10 }}>
              Every member can earn badges that confirm who they are — <b>Email</b>, <b>Phone</b>,
              <b> Government ID</b>, a live <b>Selfie</b>, <b>Location</b>, <b>Social</b>, plus pet
              <b> Health</b> and <b>Microchip</b> badges. Documents stay private; you only see the badge.
            </p>
            <UL items={[
              <>Prefer members with an <b>ID</b> and <b>Selfie</b> badge — they&apos;ve proven they&apos;re a real, single person.</>,
              <>A <b>Prime</b> trust tier means ID + selfie + phone + a verified pet.</>,
              <>You can raise your own trust anytime in the <Link href="/verify" className="text-acc" style={{ fontWeight: 700 }}>Verification Center</Link>.</>,
            ]} />
          </Card>

          <Card icon="🚩" title="Spotting pet & 'puppy' scams">
            <p style={{ marginBottom: 10 }}>The single biggest risk in online pet circles is the advance-payment scam. Real pet parents never rush money.</p>
            <UL items={[
              <><b>Never pay in advance</b> — no deposit, booking amount, token money, courier/transport or "registration" fee for a pet you haven&apos;t met in person.</>,
              <><b>Keep it on PawsPair.</b> Be cautious if someone quickly pushes you to WhatsApp/Telegram or asks for your number — our scanner flags this in chat.</>,
              <><b>No UPI/bank transfers</b> to someone you haven&apos;t met. Genuine adoptions and family-planning arrangements happen face-to-face.</>,
              <>Watch for stock-photo profiles, urgency ("leaving the city today"), and stories that don&apos;t add up. Reverse-image-search a photo if unsure.</>,
            ]} />
          </Card>

          <Card icon="📍" title="Meeting safely for a playdate">
            <UL items={[
              <><b>First meet in a public place</b> — a busy park or pet café, in daylight.</>,
              <><b>Tell a friend</b> where you&apos;re going and share your live location with them.</>,
              <><b>Both pets vaccinated.</b> Confirm the other pet&apos;s <b>Health</b> badge before they meet, to prevent disease.</>,
              <>Keep dogs leashed for the first introduction on neutral ground; watch body language and end early if either pet is stressed.</>,
              <>Trust your instincts — you&apos;re never obliged to meet. Block and report anyone who makes you uncomfortable.</>,
            ]} />
          </Card>

          <Card icon="🐾" title="Ethical family planning (litters)">
            <p style={{ marginBottom: 10 }}>
              PawsPair supports <b>responsible</b> family planning only, in line with the Prevention of Cruelty
              to Animals Act, 1960 and Animal Welfare Board of India (AWBI) guidelines.
            </p>
            <UL items={[
              "Both pets should be health-screened and vaccinated, of appropriate age, and not over-bred.",
              "No puppy-mill or commercial mass-breeding activity — accounts found doing this are removed.",
              "Always involve a veterinarian; never breed pets with known hereditary health risks.",
            ]} />
          </Card>

          <Card icon="🚫" title="Reporting & blocking">
            <p style={{ marginBottom: 10 }}>You&apos;re in control. From any profile you can <b>report</b> or <b>block</b> a member instantly.</p>
            <UL items={[
              "Report fake/suspicious profiles, harassment, animal-welfare concerns, or spam/scams — our safety team reviews every report.",
              "Blocking is mutual and immediate: you disappear from each other's discovery and can no longer message.",
              <>Urgent welfare or safety emergencies should also be reported to local authorities. Reach our grievance officer via the <Link href="/legal/grievance" className="text-acc" style={{ fontWeight: 700 }}>Grievance Redressal</Link> page.</>,
            ]} />
          </Card>

          <Card icon="🔒" title="Your privacy & data">
            <p style={{ marginBottom: 10 }}>
              You decide what others see. In <Link href="/account" className="text-acc" style={{ fontWeight: 700 }}>My account</Link> you can:
            </p>
            <UL items={[
              "Blur your pet's photo until you actually match with someone.",
              "Hide your exact location — show only your city and an approximate distance.",
              <>Export or permanently delete your data anytime, under the <Link href="/legal/privacy" className="text-acc" style={{ fontWeight: 700 }}>DPDP Act 2023</Link>.</>,
            ]} />
          </Card>

          <div className="card center" style={{ background: "linear-gradient(135deg,var(--secondary),var(--primary))", color: "#fff" }}>
            <h3 style={{ color: "#fff", marginBottom: 6 }}>See something wrong?</h3>
            <p style={{ color: "#fff", opacity: .92, marginBottom: 14 }}>Report it from the member&apos;s profile, or reach our team directly.</p>
            <Link href="/legal/grievance" className="btn" style={{ background: "#fff", color: "var(--primary-600)", fontWeight: 800 }}>Contact the safety team</Link>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}
