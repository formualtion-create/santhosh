// A lightweight, auto-playing demo of the swipe-to-match experience — shows the
// product in motion on the landing page instead of just describing it. Pure CSS
// animation (no JS/interaction), and fully hidden from assistive tech.
const DECK = [
  { name: "Simba", meta: "Golden Retriever · 2 yrs · 1.2 km", img: "/pets/dog-simba.jpg", score: 96 },
  { name: "Luna", meta: "Indie Cat · 1 yr · 3 km", img: "/pets/cat-luna.jpg", score: 91 },
  { name: "Rocky", meta: "Labrador · 4 yrs · 2 km", img: "/pets/dog-rocky.jpg", score: 88 },
];

export default function LiveDemo() {
  return (
    <div className="demo-deck" aria-hidden>
      {DECK.map((p, i) => (
        <article className={`demo-card demo-card--${i}`} key={p.name}>
          <div className="demo-card__img">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p.img} alt="" loading="lazy" />
            <span className="demo-card__score">{p.score}% match</span>
            <span className="demo-stamp demo-stamp--like">LIKE</span>
            <span className="demo-stamp demo-stamp--nope">NOPE</span>
          </div>
          <div className="demo-card__body">
            <b>{p.name}</b>
            <span>{p.meta}</span>
          </div>
        </article>
      ))}
      <span className="demo-match">💚 It&apos;s a match!</span>
    </div>
  );
}
