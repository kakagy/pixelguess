"use client";
import { useState } from "react";
import type { ClassName } from "@/lib/rpg/types";
import { CLASS_DEFS } from "@/lib/rpg/classes";

interface Props {
  onSelect: (name: string, className: ClassName) => Promise<void>;
}

const CLASS_ICONS: Record<ClassName, string> = {
  knight: "🗡️",
  mage: "🔥",
  ranger: "🏹",
  healer: "💧",
};

const CLASS_COLORS: Record<ClassName, string> = {
  knight: "border-amber-500 bg-amber-500/10",
  mage: "border-red-500 bg-red-500/10",
  ranger: "border-emerald-500 bg-emerald-500/10",
  healer: "border-blue-500 bg-blue-500/10",
};

export function ClassSelect({ onSelect }: Props) {
  const [selected, setSelected] = useState<ClassName | null>(null);
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!selected || !name.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      await onSelect(name.trim(), selected);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create avatar");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold text-center mb-6 font-mono">Choose Your Class</h2>

      <div className="grid grid-cols-2 gap-4 mb-6">
        {(Object.entries(CLASS_DEFS) as [ClassName, typeof CLASS_DEFS[string]][]).map(([key, def]) => (
          <button
            key={key}
            onClick={() => setSelected(key as ClassName)}
            className={`p-4 rounded-lg border-2 transition-all ${
              selected === key
                ? `${CLASS_COLORS[key as ClassName]} ring-2 ring-offset-2 ring-offset-gray-900`
                : "border-gray-700 bg-gray-800 hover:border-gray-500"
            }`}
          >
            <div className="text-3xl mb-2">{CLASS_ICONS[key as ClassName]}</div>
            <div className="font-bold capitalize font-mono">{key}</div>
            <div className="text-xs text-gray-400 capitalize">{def.element}</div>
            <div className="text-xs text-gray-500 mt-1">
              HP:{def.baseStats.hp} ATK:{def.baseStats.atk} DEF:{def.baseStats.def} SPD:{def.baseStats.spd}
            </div>
          </button>
        ))}
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Enter avatar name (2-16 chars)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={16}
          className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white font-mono focus:border-purple-500 focus:outline-none"
        />
      </div>

      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

      <button
        onClick={handleSubmit}
        disabled={!selected || name.trim().length < 2 || submitting}
        className="w-full py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded-lg font-bold font-mono transition-colors"
      >
        {submitting ? "Creating..." : "Create Avatar"}
      </button>
    </div>
  );
}
