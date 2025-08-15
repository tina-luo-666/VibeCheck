"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    description: string;
    price: number;
    image_url: string;
  };
}

export function ProductCard({ product }: ProductCardProps) {
  const handleBuy = async () => {
    const response = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId: product.id, qty: 1 }),
    });

    const { url } = await response.json();
    window.location.href = url;
  };

  return (
    <Card className="group hover:shadow-xl transition-shadow duration-300">
      <CardContent className="p-0">
        <div className="aspect-square relative overflow-hidden rounded-t-lg">
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
        <div className="p-6">
          <h3 className="font-bold text-xl mb-2">{product.name}</h3>
          <p className="text-gray-600 mb-4">{product.description}</p>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-[var(--primary)]">
              ${(product.price / 100).toFixed(2)}
            </span>
            <Button
              onClick={handleBuy}
              className="bg-[var(--primary)] hover:bg-[var(--primary)]/90"
            >
              Buy Now
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
