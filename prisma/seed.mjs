import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const C = {
  Bengaluru: [12.9716, 77.5946], Mumbai: [19.076, 72.8777], Delhi: [28.6139, 77.209],
  Chennai: [13.0827, 80.2707], Hyderabad: [17.385, 78.4867], Pune: [18.5204, 73.8567],
};
function near([lat, lng]) { return [lat + (Math.random() - 0.5) * 0.12, lng + (Math.random() - 0.5) * 0.12]; }

const members = [
  { email: "ananya@example.com", ownerName: "Ananya Rao", city: "Bengaluru", plan: "FETCH", pet: { name: "Simba", species: "DOG", breed: "Golden Retriever", ageBand: "YOUNG", gender: "MALE", energy: "HIGH", intent: "PLAYDATE", vaccinated: true, photoUrl: "/pets/dog-simba.jpg", bio: "Loves fetch, long walks and making new friends." } },
  { email: "rahul@example.com", ownerName: "Rahul Mehta", city: "Bengaluru", pet: { name: "Misha", species: "CAT", breed: "Persian", ageBand: "ADULT", gender: "FEMALE", energy: "LOW", intent: "FRIENDSHIP", vaccinated: true, photoUrl: "/pets/cat-misha.jpg", bio: "Calm, cuddly and a little regal." } },
  { email: "meera@example.com", ownerName: "Dr. Meera Krishnan", city: "Delhi", plan: "PEDIGREE", pet: { name: "Coco", species: "DOG", breed: "Poodle", ageBand: "ADULT", gender: "FEMALE", energy: "MEDIUM", intent: "BREEDING", vaccinated: true, photoUrl: "/pets/dog-coco.jpg", bio: "Health-checked, gentle, KCI-registered." } },
  { email: "vikram@example.com", ownerName: "Vikram Shah", city: "Pune", pet: { name: "Rocky", species: "DOG", breed: "Labrador", ageBand: "ADULT", gender: "MALE", energy: "HIGH", intent: "PLAYDATE", vaccinated: true, photoUrl: "/pets/dog-rocky.jpg", bio: "Spirited, devoted, lives for the lake." } },
  { email: "sneha@example.com", ownerName: "Sneha Iyer", city: "Chennai", pet: { name: "Luna", species: "CAT", breed: "Indie", ageBand: "YOUNG", gender: "FEMALE", energy: "LOW", intent: "FRIENDSHIP", vaccinated: true, photoUrl: "/pets/cat-luna.jpg", bio: "Serene, affectionate and home-loving." } },
  { email: "arjun@example.com", ownerName: "Arjun Nair", city: "Bengaluru", pet: { name: "Bruno", species: "DOG", breed: "Beagle", ageBand: "PUPPY", gender: "MALE", energy: "HIGH", intent: "ALL", vaccinated: true, photoUrl: "/pets/dog-bruno.jpg", bio: "Playful, sociable, endlessly curious." } },
  { email: "kavya@example.com", ownerName: "Kavya Reddy", city: "Bengaluru", pet: { name: "Nova", species: "CAT", breed: "Tabby", ageBand: "ADULT", gender: "FEMALE", energy: "MEDIUM", intent: "FRIENDSHIP", vaccinated: true, photoUrl: "/pets/cat-nova.jpg", bio: "Independent but loves a sunny windowsill." } },
  { email: "dev@example.com", ownerName: "Dev Malhotra", city: "Mumbai", pet: { name: "Max", species: "DOG", breed: "Indie", ageBand: "ADULT", gender: "MALE", energy: "MEDIUM", intent: "PLAYDATE", vaccinated: true, photoUrl: "/pets/dog-max.jpg", bio: "Friendly rescue, great with other dogs." } },
  { email: "priya@example.com", ownerName: "Priya Singh", city: "Delhi", pet: { name: "Leo", species: "DOG", breed: "Pomeranian", ageBand: "YOUNG", gender: "MALE", energy: "HIGH", intent: "ALL", vaccinated: true, photoUrl: "/pets/dog-leo.jpg", bio: "Fluffy bundle of joy, loves the park." } },
  { email: "isha@example.com", ownerName: "Isha Verma", city: "Chennai", pet: { name: "Bella", species: "CAT", breed: "Calico", ageBand: "ADULT", gender: "FEMALE", energy: "LOW", intent: "FRIENDSHIP", vaccinated: true, photoUrl: "/pets/cat-bella.jpg", bio: "Quiet, sweet and very photogenic." } },
];

const VIBES = {
  Simba: { interests: "Fetch, Beach days, Belly rubs, Long walks", favActivity: "Catching frisbees 🥏" },
  Misha: { interests: "Sunbeams, Cuddles, Bird-watching, Naps", favActivity: "Napping on warm laundry ☀️" },
  Coco: { interests: "Grooming, Treats, Park strolls, New friends", favActivity: "Showing off a fresh haircut ✂️" },
  Rocky: { interests: "Swimming, Fetch, Road trips, Zoomies", favActivity: "Cannonballing into the lake 🌊" },
  Luna: { interests: "Window naps, String toys, Quiet corners", favActivity: "Knocking pens off tables 🐾" },
  Bruno: { interests: "Sniffing everything, Snacks, Puppy play", favActivity: "Following his nose anywhere 👃" },
  Nova: { interests: "Sunbathing, Feather wands, People-watching", favActivity: "Claiming the warmest spot 🔆" },
  Max: { interests: "Dog parks, Tug-of-war, Belly rubs", favActivity: "Making every dog his friend 🐶" },
  Leo: { interests: "Park sprints, Cuddles, Squeaky toys", favActivity: "Bouncing like a fluffball 🎾" },
  Bella: { interests: "Lap naps, Quiet play, Slow blinks", favActivity: "Posing for the camera 📸" },
  Pixel: { interests: "Exploring, Treats, New smells", favActivity: "Discovering new corners 🔎" },
};

// Trust badges per member (email -> flags). Drives realistic badge variety.
const TRUST = {
  "ananya@example.com": { phone: 1, selfie: 1, social: 1, location: 1, health: 1, chip: 1 },
  "rahul@example.com":  { phone: 1, selfie: 1, location: 1 },
  "meera@example.com":  { phone: 1, selfie: 1, social: 1, location: 1, health: 1, chip: 1 },
  "vikram@example.com": { phone: 1, selfie: 1 },
  "sneha@example.com":  { phone: 1, location: 1 },
  "arjun@example.com":  { phone: 1, selfie: 1, social: 1, health: 1 },
  "kavya@example.com":  { phone: 1 },
  "dev@example.com":    { phone: 1, selfie: 1, location: 1 },
  "priya@example.com":  { phone: 1, social: 1 },
  "isha@example.com":   { phone: 1, selfie: 1 },
};
// A couple of members showcase the privacy controls.
const PRIVACY = {
  "sneha@example.com": { photoPrivacy: "MATCHED" },
  "priya@example.com": { hideExactLocation: true },
};

async function main() {
  await prisma.message.deleteMany();
  await prisma.match.deleteMany();
  await prisma.like.deleteMany();
  await prisma.block.deleteMany();
  await prisma.report.deleteMany();
  await prisma.review.deleteMany();
  await prisma.checkIn.deleteMany();
  await prisma.petService.deleteMany();
  await prisma.storySubmission.deleteMany();
  await prisma.event.deleteMany();
  await prisma.pet.deleteMany();
  await prisma.user.deleteMany();

  const hash = await bcrypt.hash("password123", 12);
  const ids = {}; // email -> { userId, petId }

  for (const m of members) {
    const [lat, lng] = near(C[m.city] || C.Bengaluru);
    const t = TRUST[m.email] || {};
    const priv = PRIVACY[m.email] || {};
    const u = await prisma.user.create({
      data: {
        email: m.email, passwordHash: hash, ownerName: m.ownerName, phone: "+919000000000",
        city: m.city, lat, lng, kycStatus: "VERIFIED", kycDocType: "AADHAAR",
        kycDocRef: "AADHAAR ••••" + Math.floor(1000 + Math.random() * 9000), verifiedAt: new Date(),
        emailVerified: true, declarationAcceptedAt: new Date(),
        consentDPDP: true, acceptedTermsAt: new Date(), plan: m.plan || "SNIFF",
        // trust badges
        phoneVerified: !!t.phone, selfieVerified: !!t.selfie, locationVerified: !!t.location,
        socialVerified: !!t.social, socialUrl: t.social ? "https://instagram.com/" + m.pet.name.toLowerCase() + "_paws" : null,
        // privacy
        photoPrivacy: priv.photoPrivacy || "PUBLIC", hideExactLocation: !!priv.hideExactLocation,
        pets: {
          create: {
            ...m.pet, ...(VIBES[m.pet.name] || {}), city: m.city, lat, lng,
            healthVerified: !!t.health, healthDocRef: t.health ? "Vet record ••••" : null,
            microchipVerified: !!t.chip, microchipId: t.chip ? "•••• " + Math.floor(1000 + Math.random() * 9000) : null,
          },
        },
      },
      include: { pets: true },
    });
    ids[m.email] = { userId: u.id, petId: u.pets[0].id };
  }

  // Admin account
  await prisma.user.create({
    data: {
      email: "admin@pawspair.in", passwordHash: await bcrypt.hash("admin12345", 12),
      ownerName: "PawsPair Admin", phone: "+919000000001", city: "Bengaluru", role: "ADMIN",
      kycStatus: "VERIFIED", verifiedAt: new Date(), emailVerified: true, declarationAcceptedAt: new Date(), consentDPDP: true, acceptedTermsAt: new Date(),
    },
  });

  // A member awaiting verification, so the admin queue isn't empty
  await prisma.user.create({
    data: {
      email: "pending@example.com", passwordHash: hash, ownerName: "Nikhil Pending", phone: "+919000000002",
      city: "Pune", lat: 18.52, lng: 73.85, kycStatus: "IN_REVIEW", kycDocType: "PASSPORT",
      kycDocRef: "PASSPORT ••••4242", emailVerified: true, declarationAcceptedAt: new Date(), consentDPDP: true, acceptedTermsAt: new Date(),
      pets: { create: { name: "Pixel", species: "DOG", breed: "Indie", ageBand: "YOUNG", gender: "FEMALE", energy: "MEDIUM", intent: "PLAYDATE", ...VIBES.Pixel, city: "Pune", lat: 18.52, lng: 73.85 } },
    },
  });

  const like = (fromEmail, toEmail) =>
    prisma.like.create({ data: { fromUserId: ids[fromEmail].userId, toPetId: ids[toEmail].petId, toUserId: ids[toEmail].userId, action: "LIKE" } });

  // Mutual matches for ananya with rahul and arjun
  await like("ananya@example.com", "rahul@example.com");
  await like("rahul@example.com", "ananya@example.com");
  await like("ananya@example.com", "arjun@example.com");
  await like("arjun@example.com", "ananya@example.com");
  // One-way: kavya likes ananya (not yet reciprocated)
  await like("kavya@example.com", "ananya@example.com");

  const mk = async (e1, e2) => {
    const [a, b] = [ids[e1].userId, ids[e2].userId].sort();
    return prisma.match.create({ data: { userAId: a, userBId: b } });
  };
  const m1 = await mk("ananya@example.com", "rahul@example.com");
  const m2 = await mk("ananya@example.com", "arjun@example.com");

  await prisma.message.create({ data: { matchId: m1.id, senderId: ids["rahul@example.com"].userId, body: "Hi Ananya! Misha would love a playdate with Simba 🐾" } });
  await prisma.message.create({ data: { matchId: m1.id, senderId: ids["ananya@example.com"].userId, body: "Aww yes! Are you free this weekend at Cubbon Park?" } });

  // Reviews (only between matched members)
  await prisma.review.createMany({
    data: [
      { authorId: ids["rahul@example.com"].userId, subjectId: ids["ananya@example.com"].userId, rating: 5, comment: "Ananya and Simba were lovely — punctual, friendly and great with Misha. Highly recommend!" },
      { authorId: ids["arjun@example.com"].userId, subjectId: ids["ananya@example.com"].userId, rating: 5, comment: "Wonderful playdate at the park. Simba is so well-behaved 🐾" },
      { authorId: ids["ananya@example.com"].userId, subjectId: ids["rahul@example.com"].userId, rating: 5, comment: "Rahul is a caring pet parent. Misha is adorable and calm." },
    ],
  });

  // Curated pet-services directory (vets, groomers, walkers, daycares, stores)
  const SERVICES = [
    { name: "Cessna Lifeline Veterinary Hospital", type: "VET", city: "Bengaluru", area: "Domlur", rating: 4.7, verified: true },
    { name: "CUPA Animal Hospital", type: "VET", city: "Bengaluru", area: "Kasturba Road", rating: 4.5, verified: true },
    { name: "Scrubbed Paws Grooming", type: "GROOMER", city: "Bengaluru", area: "Indiranagar", rating: 4.6, verified: true },
    { name: "Happy Tails Daycare", type: "DAYCARE", city: "Bengaluru", area: "Koramangala", rating: 4.8, verified: true },
    { name: "Bengaluru Dog Walkers Co.", type: "WALKER", city: "Bengaluru", area: "HSR Layout", rating: 4.4 },
    { name: "Heads Up For Tails", type: "STORE", city: "Bengaluru", area: "Indiranagar", rating: 4.5, verified: true },
    { name: "Bombay Veterinary Clinic", type: "VET", city: "Mumbai", area: "Bandra", rating: 4.6, verified: true },
    { name: "Pawsh Grooming Studio", type: "GROOMER", city: "Mumbai", area: "Andheri", rating: 4.5 },
    { name: "Wiggles Pet Daycare", type: "DAYCARE", city: "Mumbai", area: "Powai", rating: 4.7, verified: true },
    { name: "Max Vets", type: "VET", city: "Delhi", area: "Saket", rating: 4.6, verified: true },
    { name: "The Pet Spa", type: "GROOMER", city: "Delhi", area: "Vasant Kunj", rating: 4.4 },
    { name: "Chennai Pet Clinic", type: "VET", city: "Chennai", area: "Adyar", rating: 4.5, verified: true },
    { name: "Pune Paws Veterinary", type: "VET", city: "Pune", area: "Koregaon Park", rating: 4.6, verified: true },
    { name: "Furry Friends Daycare", type: "DAYCARE", city: "Hyderabad", area: "Gachibowli", rating: 4.7 },
  ];
  for (const s of SERVICES) {
    const [lat, lng] = near(C[s.city] || C.Bengaluru);
    await prisma.petService.create({ data: { ...s, lat, lng, phone: "+9180" + Math.floor(10000000 + Math.random() * 89999999) } });
  }

  // Community Happy Tail submissions (a couple approved + featured, one pending for the admin queue)
  await prisma.storySubmission.createMany({
    data: [
      { name: "Farah K.", petName: "Pepper", species: "Dog", city: "Hyderabad", rating: 5, status: "APPROVED", featured: true, story: "Pepper was a lockdown puppy who'd never met another dog. Within a week on PawsPair she had three playdate buddies in our colony. Watching her learn to play is the best thing I've seen all year." },
      { name: "Rohit & Tara", petName: "Biscuit", species: "Dog", city: "Mumbai", rating: 5, status: "APPROVED", story: "We were nervous about a senior-dog friend for our anxious rescue. The verification and the calm filter made it stress-free. Biscuit finally sleeps through the night." },
      { name: "Aishwarya M.", petName: "Mochi", species: "Cat", city: "Bengaluru", rating: 5, status: "APPROVED", story: "Even as a cat parent I felt welcome. Mochi has a little window-buddy across the street now and they 'chat' through the glass every morning. So wholesome." },
      { name: "Karthik V.", petName: "Simba", species: "Dog", city: "Chennai", rating: 5, status: "PENDING", story: "Found the perfect beach-walk friend for my Lab within two days. Genuinely safe and genuinely fun — submitting our story so others give it a try!" },
    ],
  });

  // A little sample activity so the admin "Activity & data" view isn't empty
  const ana = ids["ananya@example.com"].userId, rah = ids["rahul@example.com"].userId, arj = ids["arjun@example.com"].userId;
  await prisma.event.createMany({
    data: [
      { type: "signup", userId: ana, meta: JSON.stringify({ species: "DOG", city: "Bengaluru", intent: "PLAYDATE" }) },
      { type: "login", userId: ana },
      { type: "search", userId: ana, meta: JSON.stringify({ species: "DOG", energy: "HIGH", sort: "score" }) },
      { type: "swipe_like", userId: ana, meta: JSON.stringify({ petId: ids["rahul@example.com"].petId }) },
      { type: "match", userId: ana, meta: JSON.stringify({ with: "rahul" }) },
      { type: "message", userId: rah, meta: JSON.stringify({ len: 46 }) },
      { type: "review", userId: rah, meta: JSON.stringify({ rating: 5 }) },
      { type: "badge", userId: ana, meta: JSON.stringify({ step: "selfie" }) },
      { type: "swipe_like", userId: arj, meta: JSON.stringify({ petId: ids["ananya@example.com"].petId }) },
      { type: "subscribe", userId: ana, meta: JSON.stringify({ plan: "FETCH", from: "SNIFF" }) },
      { type: "checkin", userId: ana },
      { type: "newsletter", meta: JSON.stringify({ species: "Cat" }) },
      { type: "story_submit", meta: JSON.stringify({ petName: "Pepper", city: "Hyderabad", rating: 5 }) },
      { type: "photo_upload", userId: ana, meta: JSON.stringify({ kind: "pet" }) },
    ],
  });

  console.log(`Seeded ${members.length} members + 1 admin + 1 pending, 2 matches, 2 messages, 3 reviews, ${SERVICES.length} services, 4 story submissions, 14 events.`);
  console.log("Demo: ananya@example.com / password123  ·  admin@pawspair.in / admin12345");
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
