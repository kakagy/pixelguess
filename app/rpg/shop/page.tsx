"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const GEM_PACKAGES = [
  { gems: 100, price: "$0.99", index: 0 },
  { gems: 500, price: "$3.99", index: 1 },
  { gems: 1200, price: "$7.99", index: 2 },
];

export default function ShopPage() {
  const [gems, setGems] = useState(0);
  const [purchasing, setPurchasing] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const success = searchParams.get("success");

  useEffect(() => {
    fetch("/api/rpg/currency")
      .then(r => r.json())
      .then(d => setGems(d.gems || 0))
      .catch(() => {});
  }, []);

  const purchase = async (packageIndex: number) => {
    setPurchasing(true);
    try {
      const res = await fetch("/api/rpg/gems/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packageIndex }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      // handle error
    } finally {
      setPurchasing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-lg mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold font-mono">Gem Shop</h1>
          <button
            onClick={() => router.push("/rpg")}
            className="px-4 py2 bg-gray-800 hover:bg-gray-700 rounded-lg font-mono text-sm border border-gray-700"
          >
            Back
          </button>
        </div>

        <p className="text-center text-yellow-400 font-mono mb-6 text-xl">💎 {gems} Gems</p>

        {success && (
          <div className="bg-green-900/50 border border-green-500 text-green-300 p-3 rounded-lg mb-4 text-center font-mono">
            Purchase successful! Gems have been added.
          </div>
        )}

        <div className="space-y-3">
          {GEM_PACKAGES.map((pkg) => (
            <button
              key={pkg.index}
              onClick={() => purchase(pkg.index)}
              disabled={purchasing}
              className="w-full p-4 bg-gray-800 hover:bg-gray-700 disabled:bg-gray-800 rounded-lg border border-gray-700 flex justify-between items-center transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">💎</span>
                <span className="font-bold font-mono text-lg">{pkg.gems} Gems</span>
              </div>
              <span className="font-bold font-mono text-yellow-400">{pkg.price}</span>
            </button>
          ))}
        </div>

        <p className="text-center text-xs text-gray-500 mt-8 font-mono">
          Gems are used for Gacha pulls. Payments processed by Stripe.
        </p>
      </div>
    </div>
  );
}
