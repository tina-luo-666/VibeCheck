"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Sparkles, Store, Zap } from "lucide-react";

export default function HomePage() {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{
    storeId: string;
    slug: string;
  } | null>(null);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setLoading(true);
    setError("");
    setResult(null);
    setProgress(0);
    setStatus("Getting ready...");

    const startTime = Date.now();
    console.log(
      `[Frontend] Starting generation request at ${new Date().toISOString()}`
    );

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        console.log(`[Frontend] Request timeout after 5 minutes`);
        controller.abort();
      }, 300000); // 5 minute timeout

      console.log(
        `[Frontend] Sending request to /api/generate with prompt: "${prompt.trim()}"`
      );

      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: prompt.trim() }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const requestTime = Date.now() - startTime;
      console.log(`[Frontend] Received response after ${requestTime}ms`);

      const data = await response.json();
      console.log(`[Frontend] Response data:`, data);

      if (!response.ok) {
        const errorMsg = data.error || "Generation failed";
        console.error(`[Frontend] API error (${response.status}): ${errorMsg}`);
        if (data.requestId) {
          console.error(`[Frontend] Server request ID: ${data.requestId}`);
        }
        throw new Error(errorMsg);
      }

      const totalTime = Date.now() - startTime;
      console.log(
        `[Frontend] Generation completed successfully in ${totalTime}ms`
      );
      setProgress(100);
      setStatus("Done!");
      setResult(data);
    } catch (err: any) {
      const totalTime = Date.now() - startTime;
      console.error(`[Frontend] Generation failed after ${totalTime}ms:`, err);

      if (err.name === "AbortError") {
        setError(
          "Request timed out. The generation is taking longer than expected. Please try again."
        );
      } else if (err.message.includes("fetch")) {
        setError("Network error. Please check your connection and try again.");
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  // Simulated staged progress while waiting for the server
  useEffect(() => {
    if (!loading) return;

    let isCancelled = false;
    const start = Date.now();

    const updateStatusFor = (p: number) => {
      if (p < 15) setStatus("Screening your idea for safety...");
      else if (p < 45) setStatus("Designing your store layout...");
      else if (p < 65) setStatus("Generating product photos...");
      else if (p < 85) setStatus("Setting up products and pricing...");
      else if (p < 100) setStatus("Polishing and publishing...");
      else setStatus("Done!");
    };

    // Eases to ~99% over ~14s, then waits for real completion
    const interval = setInterval(() => {
      if (isCancelled) return;
      const elapsed = Date.now() - start;
      const target = Math.min(99, Math.floor((elapsed / 28000) * 100));
      setProgress((prev) => {
        const next = Math.max(prev, target);
        updateStatusFor(next);
        return next;
      });
    }, 150);

    return () => {
      isCancelled = true;
      clearInterval(interval);
    };
  }, [loading]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-6">
            <Sparkles className="w-12 h-12 text-purple-600 mr-3" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              VibeCheck
            </h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Turn any trend into a beautiful, AI-powered pop-up store in seconds.
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Store className="w-5 h-5 mr-2" />
                Create Your Pop-Up Store
              </CardTitle>
              <CardDescription>
                Describe your trend, aesthetic, or product idea and we'll
                generate a complete store for you.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="prompt">What kind of store do you want?</Label>
                <Input
                  id="prompt"
                  placeholder="e.g., mushroom summer aesthetic tees, cottagecore home decor..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleGenerate()}
                  className="mt-2"
                />
              </div>

              <Button
                onClick={handleGenerate}
                disabled={loading || !prompt.trim()}
                className="w-full"
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 mr-2" />
                    Generate Store
                  </>
                )}
              </Button>

              {loading && (
                <div className="mt-3 p-4 rounded-lg border bg-white/70 backdrop-blur">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center text-sm text-gray-700">
                      <Sparkles className="w-4 h-4 mr-2 text-purple-600 animate-pulse" />
                      <span>{status}</span>
                    </div>
                    <span className="text-xs text-gray-500">{progress}%</span>
                  </div>
                  <div className="h-3 w-full rounded-full bg-gray-200 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="mt-3 flex items-center justify-center gap-3 text-gray-500">
                    <Zap
                      className="w-4 h-4 animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    />
                    <Store
                      className="w-4 h-4 animate-bounce"
                      style={{ animationDelay: "120ms" }}
                    />
                    <Sparkles
                      className="w-4 h-4 animate-bounce"
                      style={{ animationDelay: "240ms" }}
                    />
                  </div>
                  <p className="mt-2 text-xs text-center text-gray-500">
                    This usually takes 10–30 seconds.
                  </p>
                </div>
              )}

              {error && (
                <div className="text-center p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-700">{error}</p>
                </div>
              )}

              {result && (
                <div className="text-center p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-700 mb-2">
                    Store generated successfully!
                  </p>
                  <Button
                    onClick={() => window.open(`/s/${result.slug}`, "_blank")}
                    variant="outline"
                    size="sm"
                  >
                    View Store
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
