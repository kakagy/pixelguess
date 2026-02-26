export type ClassName = "knight" | "mage" | "ranger" | "healer";
export type Element = "physical" | "fire" | "wind" | "water";

export interface ClassDef {
  name: ClassName;
  element: Element;
  baseStats: Stats;
  skills: SkillDef[];
}

export interface Stats {
  hp: number;
  atk: number;
  mag: number;
  def: number;
  res: number;
  spd: number;
}

export interface SkillDef {
  id: string;
  name: string;
  element: Element;
  power: number;
  cost: number;
  target: "enemy" | "self" | "ally";
  effect?: "heal" | "buff_def" | "buff_atk" | "debuff_spd";
}

export type Rarity = "common" | "uncommon" | "rare" | "legendary";

export interface Equipment {
  id: string;
  name: string;
  slot: "weapon" | "armor" | "accessory";
  rarity: Rarity;
  statBonus: Partial<Stats>;
  spriteKey: string;
}

export interface AvatarSeed {
  body: number;
  skinTone: number;
  hair: number;
  hairColor: number;
  eyes: number;
  outfit: number;
  outfitColor: number;
}

export interface Avatar {
  id: string;
  userId: string;
  name: string;
  className: ClassName;
  level: number;
  exp: number;
  seed: AvatarSeed;
  equipment: {
    weapon: Equipment | null;
    armor: Equipment | null;
    accessory: Equipment | null;
  };
}

export interface BattleUnit {
  avatarId: string;
  name: string;
  className: ClassName;
  level: number;
  stats: Stats;
  currentHp: number;
  currentMp: number;
  skills: SkillDef[];
  element: Element;
}

export type BattleAction =
  | { type: "attack" }
  | { type: "skill"; skillId: string }
  | { type: "defend" }
  | { type: "item"; itemId: string };

export interface TurnResult {
  actorId: string;
  action: BattleAction;
  targetId: string;
  damage: number;
  healing: number;
  elementMultiplier: number;
  isCrit: boolean;
  effects: string[];
}

export type BattleStatus = "waiting" | "active" | "finished";

export interface BattleState {
  id: string;
  playerA: BattleUnit;
  playerB: BattleUnit;
  currentTurn: "a" | "b";
  turnNumber: number;
  turnDeadline: number;
  status: BattleStatus;
  winner: "a" | "b" | "draw" | null;
  log: TurnResult[];
}

export type BattleMessage =
  | { type: "action"; playerId: string; action: BattleAction }
  | { type: "turn_result"; result: TurnResult; state: BattleState }
  | { type: "battle_end"; winner: string; ratingChange: { a: number; b: number } };

export const TURN_TIMEOUT_SECONDS = 30;
export const MAX_LEVEL = 50;
export const EXP_PER_LEVEL = 100;
