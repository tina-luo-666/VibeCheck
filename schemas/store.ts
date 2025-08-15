import { z } from "zod";

export const StoreSpecSchema = z.object({
  name: z.string().max(48),
  description: z.string().max(155),
  hero: z.object({
    title: z.string().max(60),
    subtitle: z.string().max(120),
    imageUrl: z.string().url(),
  }),
  products: z
    .array(
      z.object({
        name: z.string().max(40),
        description: z.string().max(200),
        price: z.number().min(1).max(99999), // cents
        imagePrompt: z.string(),
      })
    )
    .min(2)
    .max(6),
  theme: z.object({
    primaryColor: z.string().regex(/^#[0-9A-F]{6}$/i),
    fontFamily: z.enum(["inter", "playfair", "poppins"]),
    style: z.enum(["minimal", "bold", "organic"]),
  }),
  faq: z
    .array(
      z.object({
        question: z.string().max(100),
        answer: z.string().max(300),
      })
    )
    .max(5),
});

export type StoreSpec = z.infer<typeof StoreSpecSchema>;
