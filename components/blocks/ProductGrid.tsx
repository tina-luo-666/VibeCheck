import { ProductCard } from "./ProductCard";

interface ProductGridProps {
  title: string;
  products: any[];
}

export function ProductGrid({ title, products }: ProductGridProps) {
  return (
    <section id="products" className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-12">{title}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
