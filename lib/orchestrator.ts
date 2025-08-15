import { generateStoreSpec, generateProductImage } from "./openai";
import { moderatePrompt } from "./moderation";
import { supabase } from "./supabase";
import { StoreSpecSchema } from "@/schemas/store";
import { nanoid } from "nanoid";

export async function generateFromPrompt(
  prompt: string,
  allowIp = false,
  ipAddress?: string,
  requestId?: string
) {
  const logPrefix = requestId ? `[${requestId}]` : "[orchestrator]";
  const startTime = Date.now();
  console.log(`${logPrefix} Starting orchestrator with prompt: "${prompt}"`);

  // 1. Moderate prompt
  console.log(`${logPrefix} Step 1: Starting content moderation...`);
  const moderationStartTime = Date.now();
  const moderation = await moderatePrompt(prompt, allowIp);
  const moderationTime = Date.now() - moderationStartTime;
  console.log(
    `${logPrefix} Content moderation completed in ${moderationTime}ms, allowed: ${moderation.allowed}`
  );

  if (!moderation.allowed) {
    console.log(
      `${logPrefix} Content moderation blocked: ${moderation.reason}`
    );
    throw new Error(`Content blocked: ${moderation.reason}`);
  }

  // 2. Generate store spec
  console.log(`${logPrefix} Step 2: Starting store spec generation...`);
  const storeSpecStartTime = Date.now();
  const rawSpec = await generateStoreSpec(prompt);
  const storeSpecGenerationTime = Date.now() - storeSpecStartTime;
  console.log(
    `${logPrefix} Store spec generation completed in ${storeSpecGenerationTime}ms`
  );

  console.log(`${logPrefix} Validating store spec with schema...`);
  const validationStartTime = Date.now();
  const storeSpec = StoreSpecSchema.parse(rawSpec);
  const validationTime = Date.now() - validationStartTime;
  console.log(
    `${logPrefix} Store spec validation completed in ${validationTime}ms`
  );

  // 3. Generate hero image
  console.log(`${logPrefix} Step 3: Starting hero image generation...`);
  const heroImageStartTime = Date.now();
  const heroImageUrl = await generateProductImage(
    `${prompt} hero image, lifestyle shot`
  );
  const heroImageTime = Date.now() - heroImageStartTime;
  console.log(
    `${logPrefix} Hero image generation completed in ${heroImageTime}ms`
  );

  // 4. Create store record
  console.log(`${logPrefix} Step 4: Creating store record...`);
  const storeCreationStartTime = Date.now();
  const slug = nanoid(8);
  console.log(`${logPrefix} Generated slug: ${slug}`);

  const storeData = {
    slug,
    name: storeSpec.name,
    description: storeSpec.description,
    // Auto-publish so the generated URL is immediately viewable
    status: "published",
    layout_json: {
      blocks: [
        {
          type: "hero",
          props: {
            title: storeSpec.hero.title,
            subtitle: storeSpec.hero.subtitle,
            imageUrl: heroImageUrl,
            ctaText: "Shop Now",
          },
        },
        {
          type: "product-grid",
          props: {
            title: "Featured Products",
            products: [], // Will be populated after products are created
          },
        },
        {
          type: "faq",
          props: {
            title: "Frequently Asked Questions",
            items: storeSpec.faq,
          },
        },
      ],
    },
    theme_json: storeSpec.theme,
  };

  console.log(`${logPrefix} Inserting store record into database...`);
  const { data: store, error: storeError } = await supabase
    .from("stores")
    .insert(storeData)
    .select()
    .single();

  const storeCreationTime = Date.now() - storeCreationStartTime;
  console.log(
    `${logPrefix} Store record creation completed in ${storeCreationTime}ms, ID: ${store?.id}`
  );

  if (storeError) {
    console.error(`${logPrefix} Store creation error:`, storeError);
    throw storeError;
  }

  // 5. Generate and create products (in parallel for speed)
  console.log(
    `${logPrefix} Step 5: Generating and creating ${storeSpec.products.length} products in parallel...`
  );
  const productsStartTime = Date.now();
  const productIds: string[] = await Promise.all(
    storeSpec.products.map(async (productSpec) => {
      console.log(
        `${logPrefix} Generating image for product "${productSpec.name}"...`
      );
      const productImageStartTime = Date.now();
      const imageUrl = await generateProductImage(productSpec.imagePrompt);
      const productImageTime = Date.now() - productImageStartTime;
      console.log(
        `${logPrefix} Product image generation completed in ${productImageTime}ms for "${productSpec.name}"`
      );

      console.log(
        `${logPrefix} Inserting product "${productSpec.name}" into database...`
      );
      const productInsertStartTime = Date.now();
      const { data: product, error: productError } = await supabase
        .from("products")
        .insert({
          store_id: store.id,
          name: productSpec.name,
          description: productSpec.description,
          price: productSpec.price,
          image_url: imageUrl,
        })
        .select()
        .single();

      const productInsertTime = Date.now() - productInsertStartTime;
      console.log(
        `${logPrefix} Product "${productSpec.name}" insertion completed in ${productInsertTime}ms, ID: ${product?.id}`
      );

      if (productError) {
        console.error(
          `${logPrefix} Product creation error for "${productSpec.name}":`,
          productError
        );
        throw productError;
      }
      return product.id as string;
    })
  );

  const productsTime = Date.now() - productsStartTime;
  console.log(
    `${logPrefix} All products completed in ${productsTime}ms, created ${productIds.length} products`
  );

  // 6. Update layout with product IDs
  console.log(`${logPrefix} Step 6: Updating store layout with product IDs...`);
  const layoutUpdateStartTime = Date.now();
  const updatedLayout = {
    ...store.layout_json,
    blocks: store.layout_json.blocks.map((block: any) =>
      block.type === "product-grid"
        ? { ...block, props: { ...block.props, products: productIds } }
        : block
    ),
  };

  const { error: layoutUpdateError } = await supabase
    .from("stores")
    .update({ layout_json: updatedLayout })
    .eq("id", store.id);

  const layoutUpdateTime = Date.now() - layoutUpdateStartTime;
  console.log(`${logPrefix} Layout update completed in ${layoutUpdateTime}ms`);

  if (layoutUpdateError) {
    console.error(`${logPrefix} Layout update error:`, layoutUpdateError);
    throw layoutUpdateError;
  }

  // 7. Log generation
  if (ipAddress) {
    console.log(`${logPrefix} Step 7: Logging generation record...`);
    const generationLogStartTime = Date.now();
    const { error: generationLogError } = await supabase
      .from("generations")
      .insert({
        store_id: store.id,
        prompt,
        ip_address: ipAddress,
      });
    const generationLogTime = Date.now() - generationLogStartTime;
    console.log(
      `${logPrefix} Generation logging completed in ${generationLogTime}ms`
    );

    if (generationLogError) {
      console.warn(
        `${logPrefix} Generation logging error (non-critical):`,
        generationLogError
      );
    }
  }

  const totalTime = Date.now() - startTime;
  console.log(
    `${logPrefix} Orchestrator completed successfully in ${totalTime}ms total`
  );
  return { storeId: store.id, slug };
}
