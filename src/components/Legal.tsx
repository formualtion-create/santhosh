import { getCurrentUser } from "@/lib/auth";
import { Nav, Footer } from "./ui";

export async function LegalLayout({ title, intro, children }: { title: string; intro: string; children: React.ReactNode }) {
  const user = await getCurrentUser();
  return (
    <>
      <Nav user={user} />
      <section className="pageform">
        <div className="container narrow" style={{ maxWidth: 760 }}>
          <span className="eyebrow">Legal</span>
          <h1 className="h-sec" style={{ marginBottom: 8 }}>{title}</h1>
          <p className="muted" style={{ marginBottom: 18 }}>{intro}</p>
          <div className="card legal">{children}</div>
          <p className="muted" style={{ fontSize: ".82rem", marginTop: 16 }}>
            This is a plain-language template provided for the product demo and is <b>not legal advice</b>.
            Before going live, have these documents reviewed and finalised by a qualified Indian lawyer.
          </p>
        </div>
      </section>
      <Footer />
    </>
  );
}

export function H({ children }: { children: React.ReactNode }) {
  return <h3 style={{ margin: "20px 0 8px" }}>{children}</h3>;
}
export function P({ children }: { children: React.ReactNode }) {
  return <p style={{ marginBottom: 10, color: "var(--text)" }}>{children}</p>;
}
export function UL({ items }: { items: React.ReactNode[] }) {
  return (
    <ul style={{ listStyle: "disc", paddingLeft: 20, color: "var(--text)", display: "grid", gap: 6, marginBottom: 10 }}>
      {items.map((it, i) => <li key={i}>{it}</li>)}
    </ul>
  );
}
