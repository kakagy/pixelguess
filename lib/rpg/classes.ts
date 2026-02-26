import type { ClassDef } from "./types";

export const CLASS_DEFS: Record<string, ClassDef> = {
  knight: {
    name: "knight",
    element: "physical",
    baseStats: { hp: 120, atk: 14, mag: 4, def: 12, res: 8, spd: 6 },
    skills: [
      { id: "shield_bash", name: "Shield Bash", element: "physical", power: 1.2, cost: 5, target: "enemy" },
      { id: "fortify", name: "Fortify", element: "physical", power: 0, cost: 8, target: "self", effect: "buff_def" },
      { id: "heavy_strike", name: "Heavy Strike", element: "physical", power: 1.8, cost: 12, target: "enemy" },
    ],
  },
  mage: {
    name: "mage",
    element: "fire",
    baseStats: { hp: 80, atk: 4, mag: 16, def: 5, res: 12, spd: 8 },
    skills: [
      { id: "fireball", name: "Fireball", element: "fire", power: 1.4, cost: 6, target: "enemy" },
      { id: "flame_wave", name: "Flame Wave", element: "fire", power: 1.0, cost: 4, target: "enemy" },
      { id: "inferno", name: "Inferno", element: "fire", power: 2.0, cost: 15, target: "enemy" },
    ],
  },
  ranger: {
    name: "ranger",
    element: "wind",
    baseStats: { hp: 90, atk: 12, mag: 6, def: 7, res: 7, spd: 14 },
    skills: [
      { id: "quick_shot", name: "Quick Shot", element: "wind", power: 1.1, cost: 4, target: "enemy" },
      { id: "wind_slash", name: "Wind Slash", element: "wind", power: 1.5, cost: 8, target: "enemy" },
      { id: "evasion", name: "Evasion", element: "wind", power: 0, cost: 6, target: "self", effect: "buff_def" },
    ],
  },
  healer: {
    name: "healer",
    element: "water",
    baseStats: { hp: 100, atk: 5, mag: 13, def: 8, res: 14, spd: 7 },
    skills: [
      { id: "heal", name: "Heal", element: "water", power: 1.5, cost: 8, target: "self", effect: "heal" },
      { id: "water_bolt", name: "Water Bolt", element: "water", power: 1.3, cost: 6, target: "enemy" },
      { id: "tidal_wave", name: "Tidal Wave", element: "water", power: 1.8, cost: 14, target: "enemy" },
    ],
  },
};
