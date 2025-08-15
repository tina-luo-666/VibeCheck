import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { StoreRenderer } from "@/components/StoreRenderer";

interface StorePageProps {
  params: { slug: string };
}

export default async function StorePage({ params }: StorePageProps) {
  const { data: store, error } = await supabase
    .from("stores")
    .select(
      `
      *,
      products (*)
    `
    )
    .eq("slug", params.slug)
    .eq("status", "published")
    .single();

  if (error || !store) {
    notFound();
  }

  return <StoreRenderer store={store} />;
}

export async function generateMetadata({ params }: StorePageProps) {
  const { data: store } = await supabase
    .from("stores")
    .select("name, description")
    .eq("slug", params.slug)
    .single();

  return {
    title: store?.name || "Store",
    description: store?.description || "AI-generated pop-up store",
  };
}
