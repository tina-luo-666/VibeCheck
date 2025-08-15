import { Button } from "@/components/ui/button";

interface HeroProps {
  title: string;
  subtitle: string;
  imageUrl: string;
  ctaText: string;
}

export function Hero({ title, subtitle, imageUrl, ctaText }: HeroProps) {
  return (
    <section className="relative h-screen flex items-center justify-center text-white">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${imageUrl})` }}
      />
      <div className="absolute inset-0 bg-black/40" />

      <div className="relative z-10 text-center max-w-4xl mx-auto px-4">
        <h1 className="text-5xl md:text-7xl font-bold mb-6">{title}</h1>
        <p className="text-xl md:text-2xl mb-8 opacity-90">{subtitle}</p>
        <Button
          size="lg"
          className="bg-[var(--primary)] hover:bg-[var(--primary)]/90 text-white px-8 py-4 text-lg"
          onClick={() =>
            document
              .getElementById("products")
              ?.scrollIntoView({ behavior: "smooth" })
          }
        >
          {ctaText}
        </Button>
      </div>
    </section>
  );
}
