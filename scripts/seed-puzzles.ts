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
