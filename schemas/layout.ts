import { z } from "zod";

export const LayoutBlockSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("hero"),
    props: z.object({
      title: z.string(),
      subtitle: z.string(),
      imageUrl: z.string(),
      ctaText: z.string(),
    }),
  }),
  z.object({
    type: z.literal("product-grid"),
    props: z.object({
      title: z.string(),
      products: z.array(z.string()), // product IDs
    }),
  }),
  z.object({
    type: z.literal("faq"),
    props: z.object({
      title: z.string(),
      items: z.array(
        z.object({
          question: z.string(),
          answer: z.string(),
        })
      ),
    }),
  }),
]);

export const LayoutSpecSchema = z.object({
  blocks: z.array(LayoutBlockSchema),
});

export type LayoutSpec = z.infer<typeof LayoutSpecSchema>;
