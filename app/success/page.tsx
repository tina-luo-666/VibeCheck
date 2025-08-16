"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";

interface SuccessPageProps {
  searchParams?: { store?: string; session_id?: string };
}

export default function SuccessPage({ searchParams }: SuccessPageProps) {
  const storeSlug = searchParams?.store;
  const sessionId = searchParams?.session_id;
  const confettiRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = confettiRef.current;
    if (!container) return;

    const colors = [
      "#EF4444", // red
      "#F59E0B", // amber
      "#10B981", // emerald
      "#3B82F6", // blue
      "#8B5CF6", // violet
      "#EC4899", // pink
    ];

    const numPieces = 140;
    const pieces: HTMLDivElement[] = [];

    for (let i = 0; i < numPieces; i++) {
      const piece = document.createElement("div");
      const size = Math.floor(Math.random() * 8) + 6; // 6-14px
      const left = Math.random() * 100; // vw
      const rotate = Math.floor(Math.random() * 360);
      const duration = 4 + Math.random() * 2.5; // 4 - 6.5s
      const delay = Math.random() * 0.75; // stagger start
      const tilt = Math.random() * 1.2 - 0.6; // -0.6 to 0.6
      const color = colors[Math.floor(Math.random() * colors.length)];

      piece.className = "confetti-piece";
      piece.style.position = "absolute";
      piece.style.top = "-20px";
      piece.style.left = `${left}vw`;
      piece.style.width = `${size}px`;
      piece.style.height = `${size * (0.6 + Math.random() * 0.8)}px`;
      piece.style.background = color;
      piece.style.opacity = String(0.85);
      piece.style.transform = `rotate(${rotate}deg) skew(${tilt}rad)`;
      piece.style.borderRadius = Math.random() > 0.5 ? "2px" : "9999px"; // mix rectangles and confetti dots
      piece.style.animation = `fall-spin ${duration}s ease-in forwards`;
      piece.style.animationDelay = `${delay}s`;
      container.appendChild(piece);
      pieces.push(piece);
    }

    const timeout = setTimeout(() => {
      pieces.forEach((p) => p.remove());
    }, 9000);

    return () => {
      clearTimeout(timeout);
      pieces.forEach((p) => p.remove());
    };
  }, []);

  return (
    <div className="relative min-h-[70vh] bg-gradient-to-br from-purple-50 via-pink-50 to-amber-50">
      <div
        ref={confettiRef}
        className="pointer-events-none fixed inset-0 overflow-hidden z-50"
        aria-hidden
      />

      <div className="mx-auto max-w-2xl px-6 py-24 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-fuchsia-600 via-pink-600 to-orange-500 bg-clip-text text-transparent">
          Payment successful
        </h1>
        <p className="mt-4 text-gray-600">
          Thanks for your purchase.{" "}
          {sessionId ? "Your order is confirmed." : ""} A receipt has been sent
          to your email if provided.
        </p>

        <div className="mt-10 flex items-center justify-center gap-4">
          {storeSlug ? (
            <Link
              href={`/s/${storeSlug}`}
              className="rounded-full px-5 py-2 text-sm font-medium text-white bg-gradient-to-r from-violet-600 to-fuchsia-600 shadow hover:opacity-95 transition"
            >
              Return to store
            </Link>
          ) : null}
          <Link
            href="/"
            className="rounded-full px-5 py-2 text-sm font-medium text-white bg-gradient-to-r from-orange-500 to-pink-500 shadow hover:opacity-95 transition"
          >
            Continue browsing
          </Link>
        </div>
      </div>

      {/* Scoped animation keyframes for confetti */}
      <style jsx>{`
        @keyframes fall-spin {
          0% {
            transform: translateY(-20px) rotate(0deg);
          }
          60% {
            transform: translateY(60vh) rotate(360deg);
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
