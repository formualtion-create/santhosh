// "Happy Tails" — original, heart-warming little stories of pets who found
// friendship, playdates, love and family on PawsPair. All fictional & original.

export type Story = {
  slug: string;
  pets: string;        // the two pets
  owners: string;      // the owners
  city: string;
  tag: string;         // outcome chip
  emoji: string;
  image: string;       // /pets/*.jpg
  headline: string;
  story: string;       // the warm narrative
  quote: string;       // a short pull-quote
};

export const STORIES: Story[] = [
  {
    slug: "simba-and-misha",
    pets: "Simba & Misha",
    owners: "Ananya & Rahul",
    city: "Bengaluru",
    tag: "Best friends",
    emoji: "🐾",
    image: "/pets/dog-simba.jpg",
    headline: "The Golden who waited by the gate",
    story:
      "Every evening, Simba — a big-hearted Golden Retriever — would sit by Ananya's gate in Indiranagar, watching other dogs trot past, tail thumping hopefully. He had so much love and no one his own size to share it with. On PawsPair, Ananya found Rahul and his gentle Persian, Misha, just two streets away. Their first 'Welcome Woof' at Cubbon Park was all wagging tails and cautious sniffs. Six months on, the two are inseparable — Sunday mornings at the park, shared birthday treats, and a friendship that turned two neighbours into one little family.",
    quote: "He stopped waiting by the gate. Now he waits by the door for his best friend.",
  },
  {
    slug: "luna-finds-her-calm",
    pets: "Luna & Bella",
    owners: "Sneha & Isha",
    city: "Chennai",
    tag: "Rescue story",
    emoji: "🐈",
    image: "/pets/cat-luna.jpg",
    headline: "The shy rescue who learned to play again",
    story:
      "Luna came to Sneha as a frightened little indie, rescued from a Chennai monsoon drain. For months she hid under the bed, flinching at every sound. Sneha didn't want to rush her — she just wanted Luna to have one gentle friend. Through PawsPair's calm-energy filter, she met Isha's serene calico, Bella. They met slowly, screen-door visits first, then quiet afternoons sharing a sunbeam. The day Luna chased a feather toy out into the open for the very first time, Sneha cried happy tears.",
    quote: "She came out from under the bed for a friend. She never went back.",
  },
  {
    slug: "coco-becomes-a-mum",
    pets: "Coco & Rocky",
    owners: "Dr. Meera & Vikram",
    city: "Delhi · Pune",
    tag: "Family planning",
    emoji: "🍼",
    image: "/pets/dog-coco.jpg",
    headline: "A responsible match, a healthy litter",
    story:
      "Dr. Meera, a vet herself, wanted to do family planning the right way — health screening, the correct age, full vaccination, and nothing rushed. PawsPair's health-verified badges and AWBI-aligned guidance made it simple. She matched Coco, her gentle KCI-registered Poodle, with Vikram's spirited, health-checked Labrador, Rocky. Both pets were screened, both parents informed. Months later, four healthy, bright-eyed puppies arrived — every one of them placed with a verified, loving PawsPair family.",
    quote: "Done right, with health checks and heart. That's the only way we'll ever do it.",
  },
  {
    slug: "bruno-the-senior",
    pets: "Bruno & Max",
    owners: "Arjun & Dev",
    city: "Bengaluru · Mumbai",
    tag: "Senior pets",
    emoji: "💛",
    image: "/pets/dog-bruno.jpg",
    headline: "Proof that old dogs make the best friends",
    story:
      "Everyone wants the puppies. Bruno, a soulful older beagle, had slowed down — fewer zoomies, more naps. Arjun worried he'd grown lonely in his quiet years. He set Bruno's energy to 'calm' and found Dev's easy-going rescue, Max, who also preferred a gentle stroll to a sprint. Now the two seniors amble through the park together at exactly their own pace, sharing the shade and the occasional biscuit. Sometimes the best friendships come grey around the muzzle.",
    quote: "Two old souls, one slow walk, all the love in the world.",
  },
  {
    slug: "nova-the-rooftop-cat",
    pets: "Nova & Leo",
    owners: "Kavya & Priya",
    city: "Bengaluru · Delhi",
    tag: "Confidence",
    emoji: "✨",
    image: "/pets/cat-nova.jpg",
    headline: "The cat who found her courage",
    story:
      "Nova ruled exactly one windowsill and trusted exactly no one. Kavya adored her, but worried her tabby's whole world was four walls wide. She wasn't looking for romance — just one safe friend. PawsPair matched Nova with Priya's bouncy little Pom, Leo, whose endless good cheer was impossible to resist. It took patience and many slow blinks, but the standoffish cat and the sunshine pup became the unlikeliest of pairs. Now Nova greets visitors at the door — tail high, courage found.",
    quote: "One brave friendship turned her whole little world bigger.",
  },
  {
    slug: "a-park-full-of-pawrents",
    pets: "The Sunday Squad",
    owners: "12 PawsPair families",
    city: "Bengaluru",
    tag: "Community",
    emoji: "🌳",
    image: "/pets/dog-rocky.jpg",
    headline: "How one match became a whole community",
    story:
      "It started with a single playdate. Then those two owners invited another match. Then another. Today, every Sunday at 8am, a dozen PawsPair families gather at Cubbon Park — Goldens and indies, cats in carriers, seniors and pups — for what they lovingly call the 'Sunday Squad'. There's chai for the humans, a shared water bowl for the dogs, and a WhatsApp group full of vet tips and puppy photos. A matchmaking app quietly became a neighbourhood.",
    quote: "We came for a playdate. We found a whole village.",
  },
];

export function getStory(slug: string) {
  return STORIES.find((s) => s.slug === slug) || null;
}

// Short one-line testimonials for the homepage social-proof strip.
export type Testimonial = { name: string; pet: string; city: string; avatar: string; rating: number; quote: string };

export const TESTIMONIALS: Testimonial[] = [
  { name: "Ananya R.", pet: "Simba", city: "Bengaluru", avatar: "/pets/dog-simba.jpg", rating: 5, quote: "Simba finally has a best friend two streets away. PawsPair felt safe from the very first hello." },
  { name: "Sneha I.", pet: "Luna", city: "Chennai", avatar: "/pets/cat-luna.jpg", rating: 5, quote: "My rescue was so shy. The calm-energy filter found her the gentlest little friend. I'm so grateful." },
  { name: "Dr. Meera K.", pet: "Coco", city: "Delhi", avatar: "/pets/dog-coco.jpg", rating: 5, quote: "As a vet, the health badges and AWBI-aligned guidance won me over. Family planning done responsibly." },
  { name: "Vikram S.", pet: "Rocky", city: "Pune", avatar: "/pets/dog-rocky.jpg", rating: 5, quote: "Verified profiles meant zero creeps and zero fakes. Just real pet parents who love their dogs." },
  { name: "Kavya R.", pet: "Nova", city: "Bengaluru", avatar: "/pets/cat-nova.jpg", rating: 5, quote: "My anti-social cat now greets guests at the door. Never thought an app could do that. 🐈" },
  { name: "Arjun N.", pet: "Bruno", city: "Bengaluru", avatar: "/pets/dog-bruno.jpg", rating: 5, quote: "Senior-dog friendly. Bruno found a buddy who walks at his pace. The Sunday Squad is everything." },
];
