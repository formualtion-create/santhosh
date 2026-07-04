import Link from "next/link";
import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Nav, Footer } from "@/components/ui";
import Map from "@/components/Map";

export const metadata: Metadata = {
  title: "Pet services near you — vets, groomers, walkers & daycares",
  description: "Find trusted vets, groomers, dog walkers, daycares and pet stores near you on PawsPair's curated pet-services map across India.",
  alternates: { canonical: "/services" },
};

export const dynamic = "force-dynamic";

const TYPE_LABEL: Record<string, string> = { VET: "Vet", GROOMER: "Groomer", WALKER: "Walker", DAYCARE: "Daycare", STORE: "Store" };
const TYPE_ICON: Record<string, string> = { VET: "🩺", GROOMER: "✂️", WALKER: "🐕", DAYCARE: "🏠", STORE: "🛍️" };
const CITY_CENTER: Record<string, [number, number]> = {
  Bengaluru: [12.9716, 77.5946], Mumbai: [19.076, 72.8777], Delhi: [28.6139, 77.209],
  Chennai: [13.0827, 80.2707], Hyderabad: [17.385, 78.4867], Pune: [18.5204, 73.8567],
};

export default async function Services(props: { searchParams: Promise<{ type?: string; city?: string }> }) {
  const sp = await props.searchParams;
  const user = await getCurrentUser();
  const city = sp.city || user?.city || "Bengaluru";
  const type = sp.type && TYPE_LABEL[sp.type] ? sp.type : undefined;

  const services = await prisma.petService.findMany({
    where: { city, ...(type ? { type } : {}) },
    orderBy: [{ verified: "desc" }, { rating: "desc" }],
  });

  const center = CITY_CENTER[city] || CITY_CENTER.Bengaluru;
  const pins = services.map((s) => ({ id: s.id, name: s.name, city: s.area || s.city, lat: s.lat, lng: s.lng, species: TYPE_LABEL[s.type] || s.type, score: 0 }));
  const cities = Object.keys(CITY_CENTER);

  return (
    <>
      <Nav user={user} active="services" />
      <section className="section authed-hero" style={{ paddingTop: 28 }}>
        <div className="container">
          <div className="spread" style={{ marginBottom: 16, flexWrap: "wrap", gap: 12 }}>
            <div>
              <span className="eyebrow">Pet care</span>
              <h1 className="h-sec" style={{ margin: "10px 0 4px" }}>Pet services near you</h1>
              <p className="muted"><b style={{ color: "var(--primary-600)" }}>{services.length}</b> trusted {services.length === 1 ? "place" : "places"} in {city}</p>
            </div>
            <form method="get" action="/services" style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
              {type && <input type="hidden" name="type" value={type} />}
              <div className="field" style={{ margin: 0, minWidth: 150 }}>
                <label htmlFor="city">City</label>
                <select id="city" name="city" defaultValue={city}>{cities.map((c) => <option key={c} value={c}>{c}</option>)}</select>
              </div>
              <button className="btn btn-ghost btn-sm" type="submit" style={{ marginBottom: 2 }}>Change city</button>
            </form>
          </div>

          <nav className="qfilters" aria-label="Filter services by type">
            <Link href={`/services?city=${encodeURIComponent(city)}`} className={"qfilter" + (!type ? " on" : "")}>All services</Link>
            {Object.entries(TYPE_LABEL).map(([k, v]) => (
              <Link key={k} href={`/services?city=${encodeURIComponent(city)}&type=${k}`} className={"qfilter" + (type === k ? " on" : "")}>{TYPE_ICON[k]} {v}</Link>
            ))}
          </nav>

          <div className="dash" style={{ gridTemplateColumns: "1fr 1fr" }}>
            <div className="grid-stagger" style={{ display: "grid", gap: 12, alignContent: "start" }}>
              {services.length === 0 ? (
                <div className="card center"><div style={{ fontSize: 40 }}>🐾</div><p className="muted" style={{ marginTop: 8 }}>No services listed here yet — try another city or type.</p></div>
              ) : services.map((s) => (
                <div key={s.id} className="card svc-card">
                  <div style={{ width: 46, height: 46, borderRadius: 14, background: "var(--muted)", display: "grid", placeItems: "center", fontSize: "1.4rem", flexShrink: 0 }}>{TYPE_ICON[s.type]}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 800, color: "var(--fg)", display: "flex", alignItems: "center", gap: 6 }}>{s.name} {s.verified && <span className="chip green" style={{ fontSize: ".68rem", padding: "2px 7px" }}>✓ Verified</span>}</div>
                    <p className="muted" style={{ fontSize: ".88rem" }}>{TYPE_LABEL[s.type]} · {s.area ? s.area + " · " : ""}{s.city}{s.rating ? ` · ⭐ ${s.rating}` : ""}</p>
                  </div>
                  {s.phone && <a href={`tel:${s.phone}`} className="btn btn-ghost btn-sm" style={{ flexShrink: 0 }}>Call</a>}
                </div>
              ))}
            </div>
            <div className="sticky">
              <Map center={center} radiusKm={12} pins={pins} />
              <p className="muted center" style={{ fontSize: ".8rem", marginTop: 8 }}>Listings are a curated demo set. Always confirm details directly with the provider.</p>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}
