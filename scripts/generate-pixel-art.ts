import { createCanvas } from "canvas";
import * as fs from "fs";
import * as path from "path";

const RESOLUTIONS = [16, 32, 48, 64, 96, 128];

interface PuzzleArt {
  number: number;
  name: string;
  pixels: (string | null)[][]; // 16x16 grid of hex colors or null (transparent)
}

function generatePuzzleImages(art: PuzzleArt) {
  const baseSize = 16;

  for (const res of RESOLUTIONS) {
    const canvas = createCanvas(res, res);
    const ctx = canvas.getContext("2d");

    // Disable anti-aliasing for crisp pixel art
    ctx.imageSmoothingEnabled = false;

    const scale = res / baseSize;

    for (let y = 0; y < baseSize; y++) {
      for (let x = 0; x < baseSize; x++) {
        const color = art.pixels[y]?.[x];
        if (color) {
          ctx.fillStyle = color;
          ctx.fillRect(
            Math.floor(x * scale),
            Math.floor(y * scale),
            Math.ceil(scale),
            Math.ceil(scale)
          );
        }
      }
    }

    // Save to public/puzzles/{number}/{resolution}.png
    const dir = path.join(
      process.cwd(),
      "public",
      "puzzles",
      String(art.number)
    );
    fs.mkdirSync(dir, { recursive: true });

    const buffer = canvas.toBuffer("image/png");
    fs.writeFileSync(path.join(dir, `${res}.png`), buffer);

    console.log(`Generated puzzle ${art.number} (${art.name}) at ${res}x${res}`);
  }
}

// ============================================================
// Color aliases for readability
// ============================================================
const _ = null; // transparent

// Knight colors
const SV = "#C0C0C0"; // silver
const DG = "#404040"; // dark gray
const BR = "#8B4513"; // brown
const BL = "#4169E1"; // royal blue
const SK = "#FFD1A4"; // skin
const DB = "#2B3A8C"; // dark blue
const LG = "#808080"; // light gray
const WH = "#FFFFFF"; // white
const BK = "#1A1A1A"; // near black

// Slime colors
const GN = "#00FF00"; // green
const DK = "#008000"; // dark green
const MG = "#00CC00"; // mid green
const LN = "#66FF66"; // light green

// Treasure chest colors
const GD = "#FFD700"; // gold
const LB = "#A0522D"; // lighter brown
const VD = "#3C1A00"; // very dark brown
const TB = "#5C3317"; // dark brown

// Dragon colors
const RD = "#FF0000"; // red
const DR = "#8B0000"; // dark red
const OR = "#FFA500"; // orange
const YL = "#FFD700"; // yellow (same as gold)
const MR = "#CC0000"; // mid red

// Mushroom colors
const RR = "#FF0000"; // mushroom red
const BE = "#F5DEB3"; // beige
const CR = "#FAEBD7"; // cream
const LR = "#FF4444"; // lighter red

// Potion colors
const PP = "#800080"; // purple
const PB = "#0000FF"; // potion blue
const GL = "#B0E0E6"; // glass
const DP = "#4B0082"; // deep purple
const LP = "#9370DB"; // light purple
const LQ = "#8A2BE2"; // liquid purple

// Sword colors
const SS = "#C0C0C0"; // sword silver
const SG = "#FFD700"; // sword gold
const SB = "#4169E1"; // sword blue
const SH = "#8B4513"; // sword handle brown
const DS = "#A0A0A0"; // darker silver
const LS = "#E8E8E8"; // light silver
const DW = "#5C3317"; // dark wood

// ============================================================
// Puzzle 1: Knight
// A medieval knight with helmet, armor, sword, and shield
// ============================================================
const knightPixels: (string | null)[][] = [
  //0     1     2     3     4     5     6     7     8     9    10    11    12    13    14    15
  [ _,    _,    _,    _,    _,    _,    DG,   DG,   DG,   DG,   _,    _,    _,    _,    _,    _  ], // 0  helmet crest
  [ _,    _,    _,    _,    _,    DG,   SV,   SV,   SV,   SV,   DG,   _,    _,    _,    _,    _  ], // 1  helmet top
  [ _,    _,    _,    _,    DG,   SV,   SV,   SV,   SV,   SV,   SV,   DG,   _,    _,    _,    _  ], // 2  helmet
  [ _,    _,    _,    _,    DG,   SV,   LG,   SV,   SV,   LG,   SV,   DG,   _,    _,    _,    _  ], // 3  helmet with visor
  [ _,    _,    _,    _,    DG,   SV,   BK,   BK,   BK,   BK,   SV,   DG,   _,    _,    _,    _  ], // 4  visor slit
  [ _,    _,    _,    _,    _,    DG,   SV,   SV,   SV,   SV,   DG,   _,    _,    _,    _,    _  ], // 5  chin guard
  [ _,    _,    _,    _,    _,    _,    DG,   SK,   SK,   DG,   _,    _,    _,    _,    _,    _  ], // 6  neck
  [ _,    _,    _,    BL,   BL,   SV,   SV,   SV,   SV,   SV,   SV,   BL,   BL,   _,    _,    _  ], // 7  shoulder armor
  [ _,    _,    BL,   BL,   SV,   SV,   SV,   DG,   SV,   SV,   SV,   SV,   BL,   BL,   _,    _  ], // 8  chest armor
  [ _,    _,    _,    BL,   SV,   SV,   SV,   SV,   SV,   SV,   SV,   SV,   BL,   _,    _,    _  ], // 9  torso
  [ _,    _,    _,    _,    SV,   SV,   BL,   BL,   BL,   BL,   SV,   SV,   _,    _,    _,    _  ], // 10 belt
  [ _,    SV,   _,    _,    DG,   SV,   SV,   SV,   SV,   SV,   SV,   DG,   _,    _,    _,    _  ], // 11 upper legs (sword left)
  [ _,    SV,   _,    _,    BL,   DG,   DG,   _,    _,    DG,   DG,   BL,   _,    _,    _,    _  ], // 12 legs
  [ _,    GD,   _,    _,    BL,   DG,   DG,   _,    _,    DG,   DG,   BL,   _,    _,    _,    _  ], // 13 legs with sword guard
  [ _,    SV,   _,    _,    DG,   DG,   DG,   _,    _,    DG,   DG,   DG,   _,    _,    _,    _  ], // 14 boots
  [ _,    _,    _,    _,    DG,   DG,   DG,   _,    _,    DG,   DG,   DG,   _,    _,    _,    _  ], // 15 boots bottom
];

// ============================================================
// Puzzle 2: Slime
// A classic RPG slime/blob monster - round and bouncy
// ============================================================
const slimePixels: (string | null)[][] = [
  //0     1     2     3     4     5     6     7     8     9    10    11    12    13    14    15
  [ _,    _,    _,    _,    _,    _,    _,    _,    _,    _,    _,    _,    _,    _,    _,    _  ], // 0
  [ _,    _,    _,    _,    _,    _,    _,    _,    _,    _,    _,    _,    _,    _,    _,    _  ], // 1
  [ _,    _,    _,    _,    _,    _,    DK,   DK,   DK,   DK,   _,    _,    _,    _,    _,    _  ], // 2
  [ _,    _,    _,    _,    DK,   DK,   GN,   GN,   GN,   GN,   DK,   DK,   _,    _,    _,    _  ], // 3
  [ _,    _,    _,    DK,   GN,   LN,   LN,   GN,   GN,   GN,   GN,   GN,   DK,   _,    _,    _  ], // 4
  [ _,    _,    DK,   GN,   LN,   LN,   GN,   GN,   GN,   GN,   GN,   GN,   GN,   DK,   _,    _  ], // 5
  [ _,    _,    DK,   GN,   LN,   GN,   GN,   GN,   GN,   GN,   GN,   GN,   GN,   DK,   _,    _  ], // 6
  [ _,    _,    DK,   GN,   GN,   GN,   WH,   WH,   GN,   WH,   WH,   GN,   GN,   DK,   _,    _  ], // 7  eyes row top
  [ _,    _,    DK,   GN,   GN,   GN,   WH,   BK,   GN,   WH,   BK,   GN,   GN,   DK,   _,    _  ], // 8  eyes with pupils
  [ _,    _,    DK,   GN,   GN,   GN,   GN,   GN,   GN,   GN,   GN,   GN,   GN,   DK,   _,    _  ], // 9
  [ _,    _,    DK,   MG,   GN,   GN,   GN,   GN,   GN,   GN,   GN,   GN,   MG,   DK,   _,    _  ], // 10
  [ _,    DK,   MG,   MG,   MG,   GN,   GN,   GN,   GN,   GN,   GN,   MG,   MG,   MG,   DK,   _  ], // 11
  [ _,    DK,   DK,   MG,   MG,   MG,   MG,   GN,   GN,   MG,   MG,   MG,   MG,   DK,   DK,   _  ], // 12
  [ DK,   DK,   _,    DK,   DK,   MG,   MG,   MG,   MG,   MG,   MG,   DK,   DK,   _,    DK,   DK ], // 13 feet/base
  [ DK,   _,    _,    _,    _,    DK,   DK,   DK,   DK,   DK,   DK,   _,    _,    _,    _,    DK ], // 14
  [ _,    _,    _,    _,    _,    _,    _,    _,    _,    _,    _,    _,    _,    _,    _,    _  ], // 15
];

// ============================================================
// Puzzle 3: Treasure Chest
// A wooden chest with gold trim, slightly open showing gold inside
// ============================================================
const treasureChestPixels: (string | null)[][] = [
  //0     1     2     3     4     5     6     7     8     9    10    11    12    13    14    15
  [ _,    _,    _,    _,    _,    _,    _,    _,    _,    _,    _,    _,    _,    _,    _,    _  ], // 0
  [ _,    _,    _,    _,    _,    _,    _,    _,    _,    _,    _,    _,    _,    _,    _,    _  ], // 1
  [ _,    _,    TB,   TB,   TB,   TB,   TB,   TB,   TB,   TB,   TB,   TB,   TB,   TB,   _,    _  ], // 2  lid top
  [ _,    TB,   BR,   BR,   BR,   BR,   BR,   BR,   BR,   BR,   BR,   BR,   BR,   BR,   TB,   _  ], // 3  lid
  [ _,    TB,   BR,   LB,   BR,   BR,   BR,   BR,   BR,   BR,   BR,   BR,   LB,   BR,   TB,   _  ], // 4  lid with highlights
  [ _,    TB,   GD,   GD,   GD,   GD,   GD,   GD,   GD,   GD,   GD,   GD,   GD,   GD,   TB,   _  ], // 5  gold trim
  [ _,    TB,   BR,   BR,   BR,   BR,   BR,   GD,   GD,   BR,   BR,   BR,   BR,   BR,   TB,   _  ], // 6  lid bottom with lock
  [ _,    _,    VD,   VD,   VD,   VD,   VD,   GD,   GD,   VD,   VD,   VD,   VD,   VD,   _,    _  ], // 7  opening gap with glow
  [ _,    _,    GD,   YL,   GD,   YL,   GD,   YL,   YL,   GD,   YL,   GD,   YL,   GD,   _,    _  ], // 8  gold treasure visible
  [ _,    TB,   TB,   TB,   TB,   TB,   TB,   TB,   TB,   TB,   TB,   TB,   TB,   TB,   TB,   _  ], // 9  body top rim
  [ _,    TB,   BR,   BR,   BR,   BR,   BR,   BR,   BR,   BR,   BR,   BR,   BR,   BR,   TB,   _  ], // 10 body
  [ _,    TB,   BR,   LB,   BR,   BR,   BR,   GD,   GD,   BR,   BR,   BR,   LB,   BR,   TB,   _  ], // 11 body with keyhole
  [ _,    TB,   BR,   BR,   BR,   BR,   GD,   VD,   VD,   GD,   BR,   BR,   BR,   BR,   TB,   _  ], // 12 body with lock
  [ _,    TB,   BR,   LB,   BR,   BR,   BR,   BR,   BR,   BR,   BR,   BR,   LB,   BR,   TB,   _  ], // 13 body
  [ _,    TB,   TB,   TB,   TB,   TB,   TB,   TB,   TB,   TB,   TB,   TB,   TB,   TB,   TB,   _  ], // 14 base
  [ _,    _,    _,    _,    _,    _,    _,    _,    _,    _,    _,    _,    _,    _,    _,    _  ], // 15
];

// ============================================================
// Puzzle 4: Dragon
// A small red dragon facing left with wings and tail
// ============================================================
const dragonPixels: (string | null)[][] = [
  //0     1     2     3     4     5     6     7     8     9    10    11    12    13    14    15
  [ _,    _,    _,    _,    _,    _,    _,    _,    _,    _,    _,    _,    _,    _,    _,    _  ], // 0
  [ _,    _,    _,    DR,   DR,   _,    _,    _,    _,    _,    _,    _,    _,    _,    _,    _  ], // 1  horns
  [ _,    _,    DR,   RD,   RD,   DR,   _,    _,    _,    _,    _,    _,    _,    _,    _,    _  ], // 2  head top
  [ _,    DR,   RD,   RD,   RD,   RD,   DR,   _,    _,    _,    _,    _,    _,    _,    _,    _  ], // 3  head
  [ _,    DR,   YL,   BK,   RD,   RD,   RD,   DR,   _,    _,    _,    _,    _,    _,    _,    _  ], // 4  eye + face
  [ _,    DR,   RD,   RD,   RD,   RD,   DR,   _,    _,    _,    _,    DR,   _,    _,    _,    _  ], // 5  snout + wing tip
  [ _,    _,    DR,   OR,   DR,   RD,   RD,   DR,   _,    _,    DR,   RD,   DR,   _,    _,    _  ], // 6  mouth fire + wing
  [ _,    _,    _,    DR,   RD,   RD,   RD,   RD,   DR,   DR,   RD,   RD,   RD,   DR,   _,    _  ], // 7  neck + wing spread
  [ _,    _,    _,    _,    DR,   RD,   RD,   RD,   RD,   DR,   DR,   RD,   DR,   _,    _,    _  ], // 8  body + wing
  [ _,    _,    _,    _,    DR,   RD,   OR,   RD,   RD,   RD,   DR,   DR,   _,    _,    _,    _  ], // 9  body (belly)
  [ _,    _,    _,    _,    _,    DR,   OR,   OR,   RD,   RD,   RD,   DR,   _,    _,    _,    _  ], // 10 belly
  [ _,    _,    _,    _,    _,    DR,   OR,   RD,   RD,   RD,   RD,   RD,   DR,   _,    _,    _  ], // 11 lower body + tail start
  [ _,    _,    _,    _,    DR,   RD,   RD,   RD,   RD,   DR,   _,    _,    RD,   DR,   _,    _  ], // 12 legs + tail
  [ _,    _,    _,    _,    DR,   DR,   _,    _,    DR,   DR,   _,    _,    _,    RD,   DR,   _  ], // 13 feet + tail
  [ _,    _,    _,    DR,   OR,   DR,   _,    _,    DR,   OR,   DR,   _,    _,    OR,   OR,   _  ], // 14 claws + tail tip
  [ _,    _,    _,    _,    _,    _,    _,    _,    _,    _,    _,    _,    _,    _,    _,    _  ], // 15
];

// ============================================================
// Puzzle 5: Mushroom
// A power-up mushroom with spotted red cap and beige stem
// ============================================================
const mushroomPixels: (string | null)[][] = [
  //0     1     2     3     4     5     6     7     8     9    10    11    12    13    14    15
  [ _,    _,    _,    _,    _,    _,    _,    _,    _,    _,    _,    _,    _,    _,    _,    _  ], // 0
  [ _,    _,    _,    _,    _,    _,    _,    _,    _,    _,    _,    _,    _,    _,    _,    _  ], // 1
  [ _,    _,    _,    _,    _,    BK,   BK,   BK,   BK,   BK,   BK,   _,    _,    _,    _,    _  ], // 2  cap top outline
  [ _,    _,    _,    BK,   BK,   RR,   RR,   RR,   RR,   RR,   RR,   BK,   BK,   _,    _,    _  ], // 3  cap top
  [ _,    _,    BK,   RR,   RR,   WH,   WH,   RR,   RR,   WH,   WH,   RR,   RR,   BK,   _,    _  ], // 4  cap with spots
  [ _,    BK,   RR,   RR,   WH,   WH,   WH,   RR,   RR,   WH,   WH,   WH,   RR,   RR,   BK,   _  ], // 5  cap wider
  [ _,    BK,   RR,   RR,   WH,   WH,   RR,   RR,   RR,   RR,   WH,   WH,   RR,   RR,   BK,   _  ], // 6  cap mid
  [ _,    BK,   RR,   RR,   RR,   RR,   RR,   RR,   RR,   RR,   RR,   RR,   RR,   RR,   BK,   _  ], // 7  cap lower
  [ _,    BK,   RR,   RR,   RR,   RR,   WH,   WH,   WH,   WH,   RR,   RR,   RR,   RR,   BK,   _  ], // 8  cap bottom with center spot
  [ _,    _,    BK,   BK,   BK,   BK,   BK,   BK,   BK,   BK,   BK,   BK,   BK,   BK,   _,    _  ], // 9  cap rim
  [ _,    _,    _,    _,    _,    BK,   BE,   BE,   BE,   BE,   BK,   _,    _,    _,    _,    _  ], // 10 stem top
  [ _,    _,    _,    _,    _,    BK,   BE,   CR,   CR,   BE,   BK,   _,    _,    _,    _,    _  ], // 11 stem
  [ _,    _,    _,    _,    _,    BK,   BE,   CR,   CR,   BE,   BK,   _,    _,    _,    _,    _  ], // 12 stem
  [ _,    _,    _,    _,    BK,   BE,   BE,   CR,   CR,   BE,   BE,   BK,   _,    _,    _,    _  ], // 13 stem wider base
  [ _,    _,    _,    _,    BK,   BK,   BK,   BK,   BK,   BK,   BK,   BK,   _,    _,    _,    _  ], // 14 base outline
  [ _,    _,    _,    _,    _,    _,    _,    _,    _,    _,    _,    _,    _,    _,    _,    _  ], // 15
];

// ============================================================
// Puzzle 6: Potion
// A magic potion bottle with cork, glass body, and purple liquid
// ============================================================
const potionPixels: (string | null)[][] = [
  //0     1     2     3     4     5     6     7     8     9    10    11    12    13    14    15
  [ _,    _,    _,    _,    _,    _,    _,    _,    _,    _,    _,    _,    _,    _,    _,    _  ], // 0
  [ _,    _,    _,    _,    _,    _,    BR,   BR,   BR,   BR,   _,    _,    _,    _,    _,    _  ], // 1  cork top
  [ _,    _,    _,    _,    _,    _,    LB,   BR,   BR,   LB,   _,    _,    _,    _,    _,    _  ], // 2  cork bottom
  [ _,    _,    _,    _,    _,    _,    BK,   GL,   GL,   BK,   _,    _,    _,    _,    _,    _  ], // 3  neck top
  [ _,    _,    _,    _,    _,    _,    BK,   GL,   GL,   BK,   _,    _,    _,    _,    _,    _  ], // 4  neck
  [ _,    _,    _,    _,    _,    BK,   GL,   LP,   LP,   GL,   BK,   _,    _,    _,    _,    _  ], // 5  neck widens
  [ _,    _,    _,    _,    BK,   GL,   LP,   LP,   LP,   LP,   GL,   BK,   _,    _,    _,    _  ], // 6  shoulder
  [ _,    _,    _,    BK,   GL,   LP,   PP,   PP,   PP,   PP,   LP,   GL,   BK,   _,    _,    _  ], // 7  body widens
  [ _,    _,    _,    BK,   GL,   PP,   PP,   LQ,   PP,   PP,   PP,   GL,   BK,   _,    _,    _  ], // 8  body with sparkle
  [ _,    _,    _,    BK,   GL,   PP,   PP,   PP,   PP,   PP,   PP,   GL,   BK,   _,    _,    _  ], // 9  body
  [ _,    _,    _,    BK,   GL,   PP,   PP,   PP,   PP,   DP,   PP,   GL,   BK,   _,    _,    _  ], // 10 body
  [ _,    _,    _,    BK,   GL,   PP,   DP,   PP,   PP,   PP,   PP,   GL,   BK,   _,    _,    _  ], // 11 body with bubble
  [ _,    _,    _,    _,    BK,   GL,   PP,   PP,   PP,   PP,   GL,   BK,   _,    _,    _,    _  ], // 12 body narrows
  [ _,    _,    _,    _,    _,    BK,   BK,   BK,   BK,   BK,   BK,   _,    _,    _,    _,    _  ], // 13 base
  [ _,    _,    _,    _,    _,    _,    _,    _,    _,    _,    _,    _,    _,    _,    _,    _  ], // 14
  [ _,    _,    _,    _,    _,    _,    _,    _,    _,    _,    _,    _,    _,    _,    _,    _  ], // 15
];

// ============================================================
// Puzzle 7: Sword
// A legendary sword - vertical, with ornate guard and gem
// ============================================================
const swordPixels: (string | null)[][] = [
  //0     1     2     3     4     5     6     7     8     9    10    11    12    13    14    15
  [ _,    _,    _,    _,    _,    _,    _,    LS,   _,    _,    _,    _,    _,    _,    _,    _  ], // 0  blade tip
  [ _,    _,    _,    _,    _,    _,    LS,   SS,   LS,   _,    _,    _,    _,    _,    _,    _  ], // 1  blade
  [ _,    _,    _,    _,    _,    _,    SS,   DS,   SS,   _,    _,    _,    _,    _,    _,    _  ], // 2  blade
  [ _,    _,    _,    _,    _,    _,    SS,   DS,   SS,   _,    _,    _,    _,    _,    _,    _  ], // 3  blade
  [ _,    _,    _,    _,    _,    _,    SS,   DS,   SS,   _,    _,    _,    _,    _,    _,    _  ], // 4  blade
  [ _,    _,    _,    _,    _,    _,    SS,   DS,   SS,   _,    _,    _,    _,    _,    _,    _  ], // 5  blade
  [ _,    _,    _,    _,    _,    _,    SS,   DS,   SS,   _,    _,    _,    _,    _,    _,    _  ], // 6  blade
  [ _,    _,    _,    _,    _,    _,    SS,   DS,   SS,   _,    _,    _,    _,    _,    _,    _  ], // 7  blade
  [ _,    _,    _,    _,    _,    _,    SS,   DS,   SS,   _,    _,    _,    _,    _,    _,    _  ], // 8  blade
  [ _,    _,    _,    _,    _,    _,    SS,   DS,   SS,   _,    _,    _,    _,    _,    _,    _  ], // 9  blade lower
  [ _,    _,    _,    SG,   SG,   SG,   SG,   SB,   SG,   SG,   SG,   SG,   _,    _,    _,    _  ], // 10 guard with gem
  [ _,    _,    _,    _,    _,    _,    SG,   SH,   SG,   _,    _,    _,    _,    _,    _,    _  ], // 11 guard bottom
  [ _,    _,    _,    _,    _,    _,    SH,   DW,   SH,   _,    _,    _,    _,    _,    _,    _  ], // 12 grip
  [ _,    _,    _,    _,    _,    _,    SH,   DW,   SH,   _,    _,    _,    _,    _,    _,    _  ], // 13 grip
  [ _,    _,    _,    _,    _,    SG,   SG,   SG,   SG,   SG,   _,    _,    _,    _,    _,    _  ], // 14 pommel
  [ _,    _,    _,    _,    _,    _,    SG,   SG,   SG,   _,    _,    _,    _,    _,    _,    _  ], // 15 pommel bottom
];

// ============================================================
// All puzzles
// ============================================================
const puzzles: PuzzleArt[] = [
  { number: 1, name: "Knight", pixels: knightPixels },
  { number: 2, name: "Slime", pixels: slimePixels },
  { number: 3, name: "Treasure Chest", pixels: treasureChestPixels },
  { number: 4, name: "Dragon", pixels: dragonPixels },
  { number: 5, name: "Mushroom", pixels: mushroomPixels },
  { number: 6, name: "Potion", pixels: potionPixels },
  { number: 7, name: "Sword", pixels: swordPixels },
];

// Generate all puzzle images
for (const puzzle of puzzles) {
  generatePuzzleImages(puzzle);
}

console.log("\nAll pixel art generated successfully!");
