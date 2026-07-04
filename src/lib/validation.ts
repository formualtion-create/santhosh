import { z } from "zod";

export const signupSchema = z.object({
  // account
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  // owner
  ownerName: z.string().min(2, "Enter your full name"),
  phone: z
    .string()
    .transform((s) => s.replace(/[^\d+]/g, ""))
    .refine((s) => /^\+?\d{10,13}$/.test(s), "Enter a valid 10-digit mobile number"),
  city: z.string().min(2, "Enter your city"),
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
  // kyc (simulated)
  kycDocType: z.enum(["AADHAAR", "PASSPORT", "DL", "VOTER"]),
  kycDocLast4: z.string().regex(/^\d{4}$/, "Enter the last 4 digits"),
  // pet
  petName: z.string().min(1, "Enter your pet's name"),
  species: z.enum(["DOG", "CAT", "RABBIT", "BIRD", "OTHER"]),
  breed: z.string().optional(),
  ageBand: z.enum(["PUPPY", "YOUNG", "ADULT", "SENIOR"]),
  gender: z.enum(["MALE", "FEMALE"]),
  neutered: z.coerce.boolean().optional(),
  size: z.enum(["SMALL", "MEDIUM", "LARGE"]).optional(),
  energy: z.enum(["LOW", "MEDIUM", "HIGH"]),
  temperament: z.string().optional(),
  intent: z.enum(["PLAYDATE", "FRIENDSHIP", "BREEDING", "ALL"]),
  bio: z.string().max(500).optional(),
  interests: z.string().max(200).optional(),
  favActivity: z.string().max(80).optional(),
  vaccinated: z.coerce.boolean().optional(),
  // consent — DPDP Act 2023
  consentDPDP: z.literal("on", { errorMap: () => ({ message: "Consent is required to create an account" }) }),
  acceptTerms: z.literal("on", { errorMap: () => ({ message: "You must accept the Terms" }) }),
  acceptDeclaration: z.literal("on", { errorMap: () => ({ message: "You must accept the Declaration to continue" }) }),
  consentMarketing: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export type SignupInput = z.infer<typeof signupSchema>;
