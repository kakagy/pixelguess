import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const seedPuzzles = [
  {
    puzzle_number: 1,
    publish_date: "2026-03-01",
    answer: "knight",
    category: "game character",
    hints: ["", "RPG character", "Medieval era", "Wears heavy armor", "Carries a sword and shield", "Starts with K"],
    image_urls: {
      "16": "/puzzles/1/16.png",
      "32": "/puzzles/1/32.png",
      "48": "/puzzles/1/48.png",
      "64": "/puzzles/1/64.png",
      "96": "/puzzles/1/96.png",
      "128": "/puzzles/1/128.png",
    },
    difficulty: 2,
  },
  {
    puzzle_number: 2,
    publish_date: "2026-03-02",
    answer: "slime",
    category: "monster",
    hints: ["", "Classic RPG enemy", "Usually the first encounter", "Gelatinous body", "Often green or blue", "Starts with S"],
    image_urls: {
      "16": "/puzzles/2/16.png",
      "32": "/puzzles/2/32.png",
      "48": "/puzzles/2/48.png",
      "64": "/puzzles/2/64.png",
      "96": "/puzzles/2/96.png",
      "128": "/puzzles/2/128.png",
    },
    difficulty: 1,
  },
  {
    puzzle_number: 3,
    publish_date: "2026-03-03",
    answer: "treasure chest",
    category: "item",
    hints: ["", "Found in dungeons", "Contains rewards", "Made of wood and metal", "A staple of adventure games", "Starts with T"],
    image_urls: {
      "16": "/puzzles/3/16.png",
      "32": "/puzzles/3/32.png",
      "48": "/puzzles/3/48.png",
      "64": "/puzzles/3/64.png",
      "96": "/puzzles/3/96.png",
      "128": "/puzzles/3/128.png",
    },
    difficulty: 1,
  },
  {
    puzzle_number: 4,
    publish_date: "2026-03-04",
    answer: "dragon",
    category: "monster",
    hints: ["", "A mythical creature", "Breathes fire", "Has wings and scales", "Often guards treasure", "Starts with D"],
    image_urls: {
      "16": "/puzzles/4/16.png",
      "32": "/puzzles/4/32.png",
      "48": "/puzzles/4/48.png",
      "64": "/puzzles/4/64.png",
      "96": "/puzzles/4/96.png",
      "128": "/puzzles/4/128.png",
    },
    difficulty: 3,
  },
  {
    puzzle_number: 5,
    publish_date: "2026-03-05",
    answer: "mushroom",
    category: "item",
    hints: ["", "Found in many platformers", "A consumable power-up", "Has a spotted cap", "Grows from the ground", "Starts with M"],
    image_urls: {
      "16": "/puzzles/5/16.png",
      "32": "/puzzles/5/32.png",
      "48": "/puzzles/5/48.png",
      "64": "/puzzles/5/64.png",
      "96": "/puzzles/5/96.png",
      "128": "/puzzles/5/128.png",
    },
    difficulty: 1,
  },
  {
    puzzle_number: 6,
    publish_date: "2026-03-06",
    answer: "potion",
    category: "item",
    hints: ["", "An RPG consumable", "Restores health or mana", "Comes in a glass container", "Filled with colorful liquid", "Starts with P"],
    image_urls: {
      "16": "/puzzles/6/16.png",
      "32": "/puzzles/6/32.png",
      "48": "/puzzles/6/48.png",
      "64": "/puzzles/6/64.png",
      "96": "/puzzles/6/96.png",
      "128": "/puzzles/6/128.png",
    },
    difficulty: 2,
  },
  {
    puzzle_number: 7,
    publish_date: "2026-03-07",
    answer: "sword",
    category: "item",
    hints: ["", "A classic RPG weapon", "Used in melee combat", "Has a blade and handle", "The hero's trusty weapon", "Starts with S"],
    image_urls: {
      "16": "/puzzles/7/16.png",
      "32": "/puzzles/7/32.png",
      "48": "/puzzles/7/48.png",
      "64": "/puzzles/7/64.png",
      "96": "/puzzles/7/96.png",
      "128": "/puzzles/7/128.png",
    },
    difficulty: 2,
  },
];

async function seed() {
  for (const puzzle of seedPuzzles) {
    const { error } = await supabase.from("puzzles").upsert(puzzle, {
      onConflict: "puzzle_number",
    });
    if (error) {
      console.error(`Failed to seed puzzle ${puzzle.puzzle_number}:`, error.message);
    } else {
      console.log(`Seeded puzzle #${puzzle.puzzle_number}: ${puzzle.answer}`);
    }
  }
}

seed();
