import Stripe from "stripe";
import { env } from "./env";
import { supabase } from "./supabase";

const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
});

export async function createCheckoutSession(
  productId: string,
  qty: number = 1
) {
  // Get product details
  const { data: product, error } = await supabase
    .from("products")
    .select("*, stores!inner(*)")
    .eq("id", productId)
    .single();

  if (error || !product) {
    throw new Error("Product not found");
  }

  // Create Stripe checkout session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: product.name,
            description: product.description,
            images: [product.image_url],
          },
          unit_amount: product.price,
        },
        quantity: qty,
      },
    ],
    mode: "payment",
    success_url: `${env.NEXT_PUBLIC_SITE_URL}/s/${product.stores.slug}?success=true`,
    cancel_url: `${env.NEXT_PUBLIC_SITE_URL}/s/${product.stores.slug}?canceled=true`,
    metadata: {
      productId,
      storeId: product.store_id,
    },
  });

  // Create order record
  await supabase.from("orders").insert({
    store_id: product.store_id,
    product_id: productId,
    stripe_session_id: session.id,
    amount: product.price * qty,
  });

  return session;
}

export async function handleWebhook(payload: string, signature: string) {
  // Skip webhook verification if no secret is provided (for local development)
  if (!env.STRIPE_WEBHOOK_SECRET) {
    console.log("Webhook secret not provided, skipping verification");
    const event = JSON.parse(payload);

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;

      // Update order status
      await supabase
        .from("orders")
        .update({
          status: "paid",
          customer_email: session.customer_details?.email || null,
        })
        .eq("stripe_session_id", session.id);
    }

    return event;
  }

  const event = stripe.webhooks.constructEvent(
    payload,
    signature,
    env.STRIPE_WEBHOOK_SECRET
  );

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    // Update order status
    await supabase
      .from("orders")
      .update({
        status: "paid",
        customer_email: session.customer_details?.email || null,
      })
      .eq("stripe_session_id", session.id);
  }

  return event;
}
