import type { AvatarSeed, ClassName } from "./types";

/** Generate a random avatar seed */
export function generateSeed(): AvatarSeed {
  return {
    body: Math.floor(Math.random() * 3),
    skinTone: Math.floor(Math.random() * 6),
    hair: Math.floor(Math.random() * 8),
    hairColor: Math.floor(Math.random() * 8),
    eyes: Math.floor(Math.random() * 6),
    outfit: Math.floor(Math.random() * 10),
    outfitColor: Math.floor(Math.random() * 6),
  };
}

/** Convert seed to a deterministic hash for caching */
export function seedToKey(seed: AvatarSeed, className: ClassName): string {
  return `${className}_${Object.values(seed).join("_")}`;
}

/** Get sprite layer URLs for a given seed and class */
export function getSpriteUrls(seed: AvatarSeed, className: ClassName): string[] {
  return [
    `/sprites/body/${seed.body}_${seed.skinTone}.png`,
    `/sprites/hair/${seed.hair}_${seed.hairColor}.png`,
    `/sprites/eyes/${seed.eyes}.png`,
    `/sprites/outfit/${seed.outfit}_${seed.outfitColor}.png`,
    `/sprites/weapon/${className}.png`,
  ];
}
