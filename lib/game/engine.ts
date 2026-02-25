import {
  type GameState,
  type GuessResult,
  type Puzzle,
  type Resolution,
  RESOLUTIONS,
  MAX_ROUNDS,
} from "./types";

export function createGameState(puzzle: Puzzle): GameState {
  return {
    puzzle,
    guesses: [],
    results: [],
    currentRound: 0,
    status: "playing",
  };
}

export function submitGuess(state: GameState, guess: string): GameState {
  if (state.status !== "playing") return state;

  const normalizedGuess = guess.trim().toLowerCase();
  const normalizedAnswer = state.puzzle.answer.trim().toLowerCase();

  let result: GuessResult;
  if (normalizedGuess === normalizedAnswer) {
    result = "correct";
  } else if (isRelatedCategory(normalizedGuess, state.puzzle.category)) {
    result = "correct_category";
  } else {
    result = "wrong";
  }

  const newGuesses = [...state.guesses, guess];
  const newResults = [...state.results, result];
  const newRound = state.currentRound + 1;

  let status: GameState["status"] = "playing";
  if (result === "correct") {
    status = "won";
  } else if (newRound >= MAX_ROUNDS) {
    status = "lost";
  }

  return {
    ...state,
    guesses: newGuesses,
    results: newResults,
    currentRound: newRound,
    status,
  };
}

function isRelatedCategory(guess: string, category: string): boolean {
  const normalizedCategory = category.toLowerCase();
  const categoryWords = normalizedCategory.split(/\s+/);

  // Direct substring match between guess and category words
  if (
    categoryWords.some(
      (word) => guess.includes(word) || word.includes(guess)
    )
  ) {
    return true;
  }

  // Check if the guess is a known synonym/member of a category keyword
  const CATEGORY_RELATED: Record<string, string[]> = {
    character: [
      "warrior",
      "knight",
      "mage",
      "wizard",
      "archer",
      "hero",
      "villain",
      "thief",
      "rogue",
      "paladin",
      "ranger",
      "cleric",
      "fighter",
      "barbarian",
      "monk",
      "sorcerer",
      "bard",
      "druid",
      "assassin",
      "samurai",
      "ninja",
      "pirate",
    ],
    animal: [
      "dog",
      "cat",
      "bird",
      "fish",
      "lion",
      "tiger",
      "bear",
      "wolf",
      "fox",
      "rabbit",
      "horse",
      "eagle",
      "snake",
      "dragon",
    ],
    vehicle: [
      "car",
      "truck",
      "bus",
      "train",
      "plane",
      "ship",
      "boat",
      "rocket",
      "spaceship",
      "helicopter",
      "bicycle",
      "motorcycle",
    ],
    food: [
      "pizza",
      "burger",
      "sushi",
      "pasta",
      "rice",
      "bread",
      "cake",
      "pie",
      "soup",
      "salad",
      "taco",
      "ramen",
    ],
    game: [
      "rpg",
      "puzzle",
      "platformer",
      "shooter",
      "strategy",
      "adventure",
      "simulation",
      "racing",
      "fighting",
      "sports",
    ],
  };

  return categoryWords.some((word) => {
    const related = CATEGORY_RELATED[word];
    return related !== undefined && related.includes(guess);
  });
}

export function getCurrentResolution(round: number): Resolution {
  const clamped = Math.min(round, RESOLUTIONS.length - 1);
  return RESOLUTIONS[clamped];
}

export function getVisibleHints(state: GameState): string[] {
  return state.puzzle.hints.slice(1, state.currentRound + 1).filter(Boolean);
}

export function generateShareText(state: GameState): string {
  const solved = state.status === "won";
  const score = solved ? `${state.currentRound}/6` : "X/6";
  const header = `PixelGuess #${state.puzzle.puzzleNumber} ${score}`;

  const grid = state.results
    .map((r) => {
      switch (r) {
        case "correct":
          return "\uD83D\uDFE9";
        case "correct_category":
          return "\uD83D\uDFE8";
        case "wrong":
          return "\u2B1B";
      }
    })
    .join("");

  return `${header}\n\n${grid}`;
}
