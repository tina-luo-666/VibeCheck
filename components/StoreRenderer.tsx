"use client";

import { Hero } from "./blocks/Hero";
import { ProductGrid } from "./blocks/ProductGrid";
import { FAQ } from "./blocks/FAQ";
import { Footer } from "./blocks/Footer";

interface StoreRendererProps {
  store: any; // Full store with products
}

export function StoreRenderer({ store }: StoreRendererProps) {
  const { layout_json, theme_json, products } = store;

  // Apply theme CSS variables
  const themeStyle = {
    "--primary": theme_json.primaryColor,
    "--font-family":
      theme_json.fontFamily === "inter"
        ? "Inter"
        : theme_json.fontFamily === "playfair"
        ? "Playfair Display"
        : "Poppins",
  } as React.CSSProperties;

  return (
    <div style={themeStyle} className="min-h-screen font-[var(--font-family)]">
      {layout_json.blocks.map((block: any, index: number) => {
        switch (block.type) {
          case "hero":
            return <Hero key={index} {...block.props} />;
          case "product-grid":
            const blockProducts = products.filter((p: any) =>
              block.props.products.includes(p.id)
            );
            return (
              <ProductGrid
                key={index}
                {...block.props}
                products={blockProducts}
              />
            );
          case "faq":
            return <FAQ key={index} {...block.props} />;
          default:
            return null;
        }
      })}
      <Footer />
    </div>
  );
}
