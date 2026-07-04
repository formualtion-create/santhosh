import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { Nav, Footer } from "@/components/ui";
import LocationPicker from "@/components/LocationPicker";
import { betaInviteRequired } from "@/lib/beta";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create your pet's profile — Join PawsPair",
  description:
    "Sign up free to PawsPair, India's verified pet matchmaking app. Add your dog or cat, get identity-verified, and find safe playdates, friends and family planning matches near you.",
  alternates: { canonical: "/signup" },
};

export default async function Signup(props: { searchParams: Promise<{ error?: string }> }) {
  const searchParams = await props.searchParams;
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");

  return (
    <>
      <Nav user={null} />
      <section className="pageform">
        <div className="container narrow" style={{ maxWidth: 720 }}>
          <div className="center" style={{ marginBottom: 24 }}>
            <span className="eyebrow">Create your profile</span>
            <h1 className="h-sec">Introduce us to your companion</h1>
            <p className="lead">It takes a few minutes. Every field helps us verify you and find finer matches.</p>
          </div>

          {searchParams.error && <div className="err">{searchParams.error}</div>}

          <form action="/api/auth/signup" method="post" className="card">
            {betaInviteRequired() && (
              <div className="invite-box">
                <div className="invite-box__head">🎟️ Invite-only beta</div>
                <p className="invite-box__sub">PawsPair is in private beta. Enter the invite code you were given to join.</p>
                <div className="field" style={{ margin: 0 }}>
                  <label htmlFor="betaCode">Beta invite code *</label>
                  <input id="betaCode" name="betaCode" required autoComplete="off" placeholder="Enter your code" />
                </div>
              </div>
            )}
            <h3 style={{ marginBottom: 14 }}>1 · Account</h3>
            <div className="fg2">
              <div className="field"><label htmlFor="email">Email *</label><input id="email" name="email" type="email" autoComplete="email" required placeholder="you@example.com" /></div>
              <div className="field"><label htmlFor="password">Password *</label><input id="password" name="password" type="password" minLength={8} required placeholder="At least 8 characters" /></div>
            </div>

            <h3 style={{ margin: "20px 0 14px" }}>2 · About you</h3>
            <div className="fg2">
              <div className="field"><label htmlFor="ownerName">Full name *</label><input id="ownerName" name="ownerName" required placeholder="e.g. Ananya Rao" /></div>
              <div className="field"><label htmlFor="phone">Mobile number *</label><input id="phone" name="phone" type="tel" autoComplete="tel" required placeholder="+91 XXXXX XXXXX" /></div>
            </div>
            <LocationPicker />

            <h3 style={{ margin: "20px 0 14px" }}>3 · Identity verification</h3>
            <p className="hint" style={{ marginTop: -6, marginBottom: 12 }}>
              We verify every member for everyone&apos;s safety. We store only a masked reference — never your full ID number.
            </p>
            <div className="fg2">
              <div className="field">
                <label htmlFor="kycDocType">Document type *</label>
                <select id="kycDocType" name="kycDocType" required defaultValue="AADHAAR">
                  <option value="AADHAAR">Aadhaar</option>
                  <option value="PASSPORT">Passport</option>
                  <option value="DL">Driving licence</option>
                  <option value="VOTER">Voter ID</option>
                </select>
              </div>
              <div className="field"><label htmlFor="kycDocLast4">Last 4 digits *</label><input id="kycDocLast4" name="kycDocLast4" inputMode="numeric" pattern="\d{4}" maxLength={4} required placeholder="••••" /></div>
            </div>

            <h3 style={{ margin: "20px 0 14px" }}>4 · Your pet</h3>
            <div className="fg2">
              <div className="field"><label htmlFor="petName">Pet&apos;s name *</label><input id="petName" name="petName" required placeholder="e.g. Simba" /></div>
              <div className="field"><label htmlFor="species">Species *</label><select id="species" name="species" required defaultValue="DOG"><option value="DOG">Dog</option><option value="CAT">Cat</option><option value="RABBIT">Rabbit</option><option value="BIRD">Bird</option><option value="OTHER">Other</option></select></div>
              <div className="field"><label htmlFor="breed">Breed</label><input id="breed" name="breed" placeholder="e.g. Golden Retriever" /></div>
              <div className="field"><label htmlFor="ageBand">Age *</label><select id="ageBand" name="ageBand" required defaultValue="ADULT"><option value="PUPPY">Under 1 year</option><option value="YOUNG">1–3 years</option><option value="ADULT">4–7 years</option><option value="SENIOR">8+ years</option></select></div>
              <div className="field"><label htmlFor="gender">Gender *</label><select id="gender" name="gender" required defaultValue="MALE"><option value="MALE">Male</option><option value="FEMALE">Female</option></select></div>
              <div className="field"><label htmlFor="size">Size</label><select id="size" name="size" defaultValue="MEDIUM"><option value="SMALL">Small</option><option value="MEDIUM">Medium</option><option value="LARGE">Large</option></select></div>
              <div className="field"><label htmlFor="energy">Energy *</label><select id="energy" name="energy" required defaultValue="MEDIUM"><option value="LOW">Calm</option><option value="MEDIUM">Balanced</option><option value="HIGH">High energy</option></select></div>
              <div className="field"><label htmlFor="intent">Looking for *</label><select id="intent" name="intent" required defaultValue="PLAYDATE"><option value="PLAYDATE">Playdates</option><option value="FRIENDSHIP">Friendship</option><option value="BREEDING">Family planning</option><option value="ALL">Open to all</option></select></div>
            </div>
            <div className="field"><label htmlFor="bio">A little about them</label><textarea id="bio" name="bio" rows={2} maxLength={500} placeholder="Temperament, favourite play, anything special…"></textarea></div>
            <div className="fg2">
              <div className="field"><label htmlFor="interests">Their vibe / interests</label><input id="interests" name="interests" maxLength={200} placeholder="Fetch, Beach days, Cuddles, Treats" /><p className="hint">Comma-separated — shows as fun tags on their profile.</p></div>
              <div className="field"><label htmlFor="favActivity">Favourite thing</label><input id="favActivity" name="favActivity" maxLength={80} placeholder="e.g. Chasing frisbees 🥏" /></div>
            </div>
            <label className="check"><input type="checkbox" name="vaccinated" /> My pet&apos;s vaccinations are up to date</label>
            <label className="check"><input type="checkbox" name="neutered" /> My pet is spayed / neutered</label>

            <h3 style={{ margin: "20px 0 14px" }}>5 · Consent</h3>
            <label className="check">
              <input type="checkbox" name="consentDPDP" required />
              I consent to PawsPair processing my personal data to provide this service, in accordance with the{" "}
              <Link href="/legal/privacy" className="text-acc" style={{ fontWeight: 700 }}>Privacy Policy</Link> under the DPDP Act 2023. *
            </label>
            <label className="check">
              <input type="checkbox" name="acceptTerms" required />
              I accept the <Link href="/legal/terms" className="text-acc" style={{ fontWeight: 700 }}>Terms &amp; Conditions</Link>. *
            </label>
            <label className="check">
              <input type="checkbox" name="acceptDeclaration" required />
              I have read and agree to the <Link href="/legal/declaration" className="text-acc" style={{ fontWeight: 700 }}>User Declaration &amp; Acceptance</Link>, and I declare that all information I have provided is true and correct. *
            </label>
            <label className="check">
              <input type="checkbox" name="consentMarketing" />
              Send me occasional updates and offers (optional).
            </label>

            <button type="submit" className="btn btn-primary btn-block btn-lg" style={{ marginTop: 10 }}>
              Create account &amp; verify
            </button>
            <p className="center muted" style={{ marginTop: 12, fontSize: ".9rem" }}>
              Already a member? <Link href="/login" className="text-acc" style={{ fontWeight: 700 }}>Log in</Link>
            </p>
          </form>
        </div>
      </section>
      <Footer />
    </>
  );
}
