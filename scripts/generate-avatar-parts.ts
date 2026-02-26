import { createCanvas } from "canvas";
import * as fs from "fs";
import * as path from "path";

const SIZE = 32;

// ============================================================
// Skin tone palette (6 tones)
// ============================================================
const SKIN_TONES = [
  "#FFDBB4", // 0 - very light
  "#F5C5A3", // 1 - light
  "#D4956A", // 2 - medium light
  "#C68642", // 3 - medium
  "#8D5524", // 4 - medium dark
  "#4A2912", // 5 - dark
];

// Hair color palette (8 colors)
const HAIR_COLORS = [
  "#1A1A1A", // 0 - black
  "#3B2314", // 1 - dark brown
  "#7B4A2D", // 2 - brown
  "#B07040", // 3 - light brown
  "#D4A017", // 4 - dark blonde
  "#F5D060", // 5 - blonde
  "#CC3300", // 6 - red
  "#C0C0C0", // 7 - silver/white
];

// Outfit color palette (6 colors)
const OUTFIT_COLORS = [
  "#4169E1", // 0 - royal blue
  "#C0392B", // 1 - red
  "#27AE60", // 2 - green
  "#8E44AD", // 3 - purple
  "#E67E22", // 4 - orange
  "#1A1A2E", // 5 - dark navy
];

// Eye style colors (6 styles - varied colors)
const EYE_COLORS = [
  "#2C3E50", // 0 - dark gray
  "#1A5276", // 1 - dark blue
  "#1E8449", // 2 - dark green
  "#7B241C", // 3 - dark brown
  "#6C3483", // 4 - violet
  "#117A65", // 5 - teal
];

function ensureDir(dirPath: string) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function saveCanvas(canvas: ReturnType<typeof createCanvas>, filePath: string) {
  const buffer = canvas.toBuffer("image/png");
  fs.writeFileSync(filePath, buffer);
}

function newCanvas() {
  const canvas = createCanvas(SIZE, SIZE);
  const ctx = canvas.getContext("2d");
  ctx.imageSmoothingEnabled = false;
  return { canvas, ctx };
}

// Fill a pixel at grid coordinates (each "pixel" = 1 canvas pixel at 32x32)
function fillPixel(
  ctx: ReturnType<ReturnType<typeof createCanvas>["getContext"]>,
  x: number,
  y: number,
  color: string
) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, 1, 1);
}

function fillRect(
  ctx: ReturnType<ReturnType<typeof createCanvas>["getContext"]>,
  x: number,
  y: number,
  w: number,
  h: number,
  color: string
) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
}

// ============================================================
// Body sprites: 3 types x 6 skin tones = 18 files
// body type 0 = average, 1 = slim, 2 = stout
// ============================================================
function generateBody(bodyType: number, skinToneIndex: number, outDir: string) {
  const { canvas, ctx } = newCanvas();
  const skin = SKIN_TONES[skinToneIndex];
  const outline = "#1A1A1A";
  const shadow = adjustColor(skin, -40);

  if (bodyType === 0) {
    // Average build — 10px wide torso
    // Head
    fillRect(ctx, 11, 2, 10, 10, skin);
    fillRect(ctx, 10, 3, 12, 8, skin);
    // Head outline
    fillRect(ctx, 11, 2, 10, 1, outline);
    fillRect(ctx, 11, 11, 10, 1, outline);
    fillRect(ctx, 10, 3, 1, 8, outline);
    fillRect(ctx, 22, 3, 1, 8, outline);
    // Neck
    fillRect(ctx, 13, 12, 6, 3, skin);
    // Torso
    fillRect(ctx, 10, 15, 12, 10, skin);
    fillRect(ctx, 10, 15, 12, 1, outline);
    fillRect(ctx, 10, 24, 12, 1, outline);
    fillRect(ctx, 10, 15, 1, 10, outline);
    fillRect(ctx, 21, 15, 1, 10, outline);
    // Arms
    fillRect(ctx, 7, 15, 3, 9, skin);
    fillRect(ctx, 22, 15, 3, 9, skin);
    // Hands
    fillRect(ctx, 7, 24, 4, 3, skin);
    fillRect(ctx, 21, 24, 4, 3, skin);
    // Legs
    fillRect(ctx, 10, 25, 5, 7, skin);
    fillRect(ctx, 17, 25, 5, 7, skin);
    // Shadow on torso side
    fillRect(ctx, 20, 16, 1, 8, shadow);
  } else if (bodyType === 1) {
    // Slim build — 8px wide torso
    const skin2 = skin;
    // Head
    fillRect(ctx, 12, 2, 8, 10, skin2);
    fillRect(ctx, 11, 3, 10, 8, skin2);
    // Head outline
    fillRect(ctx, 12, 2, 8, 1, outline);
    fillRect(ctx, 12, 11, 8, 1, outline);
    fillRect(ctx, 11, 3, 1, 8, outline);
    fillRect(ctx, 21, 3, 1, 8, outline);
    // Neck
    fillRect(ctx, 14, 12, 4, 3, skin2);
    // Torso (slim)
    fillRect(ctx, 11, 15, 10, 10, skin2);
    fillRect(ctx, 11, 15, 10, 1, outline);
    fillRect(ctx, 11, 24, 10, 1, outline);
    fillRect(ctx, 11, 15, 1, 10, outline);
    fillRect(ctx, 20, 15, 1, 10, outline);
    // Arms (thinner)
    fillRect(ctx, 8, 15, 3, 8, skin2);
    fillRect(ctx, 21, 15, 3, 8, skin2);
    // Hands
    fillRect(ctx, 8, 23, 3, 3, skin2);
    fillRect(ctx, 21, 23, 3, 3, skin2);
    // Legs (slim)
    fillRect(ctx, 11, 25, 4, 7, skin2);
    fillRect(ctx, 17, 25, 4, 7, skin2);
    // Shadow
    fillRect(ctx, 19, 16, 1, 8, shadow);
  } else {
    // Stout build — 14px wide torso
    // Head (wider)
    fillRect(ctx, 9, 2, 14, 10, skin);
    fillRect(ctx, 8, 3, 16, 8, skin);
    // Head outline
    fillRect(ctx, 9, 2, 14, 1, outline);
    fillRect(ctx, 9, 11, 14, 1, outline);
    fillRect(ctx, 8, 3, 1, 8, outline);
    fillRect(ctx, 24, 3, 1, 8, outline);
    // Neck
    fillRect(ctx, 12, 12, 8, 3, skin);
    // Torso (wide)
    fillRect(ctx, 8, 15, 16, 10, skin);
    fillRect(ctx, 8, 15, 16, 1, outline);
    fillRect(ctx, 8, 24, 16, 1, outline);
    fillRect(ctx, 8, 15, 1, 10, outline);
    fillRect(ctx, 23, 15, 1, 10, outline);
    // Arms (thicker)
    fillRect(ctx, 5, 15, 3, 10, skin);
    fillRect(ctx, 24, 15, 3, 10, skin);
    // Hands
    fillRect(ctx, 5, 25, 4, 3, skin);
    fillRect(ctx, 23, 25, 4, 3, skin);
    // Legs (wider)
    fillRect(ctx, 9, 25, 6, 7, skin);
    fillRect(ctx, 17, 25, 6, 7, skin);
    // Shadow
    fillRect(ctx, 22, 16, 1, 8, shadow);
  }

  saveCanvas(canvas, path.join(outDir, `${bodyType}_${skinToneIndex}.png`));
  console.log(`  body/${bodyType}_${skinToneIndex}.png`);
}

// ============================================================
// Hair sprites: 8 styles x 8 colors = 64 files
// ============================================================
function generateHair(style: number, colorIndex: number, outDir: string) {
  const { canvas, ctx } = newCanvas();
  const color = HAIR_COLORS[colorIndex];
  const dark = adjustColor(color, -30);

  // All hair styles are drawn in the head area (rows 1-12, cols ~9-23)
  // Styles vary in shape
  switch (style) {
    case 0: // Short straight
      fillRect(ctx, 10, 2, 12, 5, color);
      fillRect(ctx, 10, 2, 12, 1, dark);
      break;
    case 1: // Medium parted
      fillRect(ctx, 10, 1, 12, 6, color);
      fillRect(ctx, 15, 1, 2, 7, dark); // part
      fillRect(ctx, 10, 1, 12, 1, dark);
      break;
    case 2: // Spiky
      for (let i = 0; i < 5; i++) {
        fillRect(ctx, 10 + i * 2, 1, 1, 3 + (i % 2) * 2, color);
      }
      fillRect(ctx, 10, 4, 11, 3, color);
      break;
    case 3: // Long straight (side curtains)
      fillRect(ctx, 10, 2, 12, 5, color);
      fillRect(ctx, 9, 3, 2, 10, color); // left side
      fillRect(ctx, 21, 3, 2, 10, color); // right side
      fillRect(ctx, 10, 2, 12, 1, dark);
      break;
    case 4: // Wavy
      fillRect(ctx, 10, 2, 12, 4, color);
      // wave effect
      for (let x = 10; x < 22; x += 2) {
        fillRect(ctx, x, 6, 1, 3, color);
        fillRect(ctx, x + 1, 5, 1, 3, color);
      }
      fillRect(ctx, 10, 2, 12, 1, dark);
      break;
    case 5: // Ponytail
      fillRect(ctx, 10, 2, 12, 5, color);
      fillRect(ctx, 21, 5, 3, 8, color); // ponytail
      fillRect(ctx, 21, 13, 2, 4, color);
      fillRect(ctx, 10, 2, 12, 1, dark);
      break;
    case 6: // Bun
      fillRect(ctx, 10, 3, 12, 4, color);
      // Bun on top
      fillRect(ctx, 13, 1, 6, 4, color);
      fillRect(ctx, 14, 0, 4, 2, color);
      fillRect(ctx, 13, 0, 6, 1, dark);
      fillRect(ctx, 10, 3, 12, 1, dark);
      break;
    case 7: // Mohawk
      fillRect(ctx, 15, 0, 2, 8, color);
      fillRect(ctx, 14, 1, 4, 6, color);
      fillRect(ctx, 13, 3, 6, 4, color);
      fillRect(ctx, 10, 6, 12, 2, dark); // sides shaved (dark shadow)
      break;
  }

  saveCanvas(canvas, path.join(outDir, `${style}_${colorIndex}.png`));
  console.log(`  hair/${style}_${colorIndex}.png`);
}

// ============================================================
// Eyes sprites: 6 styles = 6 files
// ============================================================
function generateEyes(style: number, outDir: string) {
  const { canvas, ctx } = newCanvas();
  const eyeColor = EYE_COLORS[style];
  const white = "#FFFFFF";
  const outline = "#1A1A1A";

  // Eyes are placed in the face area (rows 6-9, relative to 32px canvas)
  // Face center around y=7-8 (assuming head top at y=2, height ~10px)
  const eyeY = 6;
  const leftEyeX = 12;
  const rightEyeX = 18;

  switch (style) {
    case 0: // Round normal
      fillRect(ctx, leftEyeX, eyeY, 3, 3, white);
      fillRect(ctx, rightEyeX, eyeY, 3, 3, white);
      fillPixel(ctx, leftEyeX + 1, eyeY + 1, eyeColor);
      fillPixel(ctx, rightEyeX + 1, eyeY + 1, eyeColor);
      fillPixel(ctx, leftEyeX + 1, eyeY + 1, outline);
      fillPixel(ctx, rightEyeX + 1, eyeY + 1, outline);
      break;
    case 1: // Narrow/serious
      fillRect(ctx, leftEyeX, eyeY + 1, 4, 2, white);
      fillRect(ctx, rightEyeX, eyeY + 1, 4, 2, white);
      fillRect(ctx, leftEyeX + 1, eyeY + 1, 2, 1, eyeColor);
      fillRect(ctx, rightEyeX + 1, eyeY + 1, 2, 1, eyeColor);
      fillRect(ctx, leftEyeX, eyeY + 1, 4, 1, outline);
      fillRect(ctx, rightEyeX, eyeY + 1, 4, 1, outline);
      break;
    case 2: // Wide/surprised
      fillRect(ctx, leftEyeX, eyeY, 4, 4, white);
      fillRect(ctx, rightEyeX, eyeY, 4, 4, white);
      fillRect(ctx, leftEyeX + 1, eyeY + 1, 2, 2, eyeColor);
      fillRect(ctx, rightEyeX + 1, eyeY + 1, 2, 2, eyeColor);
      fillRect(ctx, leftEyeX, eyeY, 4, 1, outline);
      fillRect(ctx, rightEyeX, eyeY, 4, 1, outline);
      break;
    case 3: // Slanted/angry
      fillRect(ctx, leftEyeX, eyeY + 1, 3, 2, white);
      fillRect(ctx, rightEyeX, eyeY + 1, 3, 2, white);
      fillPixel(ctx, leftEyeX, eyeY, outline);
      fillPixel(ctx, leftEyeX + 2, eyeY + 2, outline);
      fillPixel(ctx, rightEyeX + 2, eyeY, outline);
      fillPixel(ctx, rightEyeX, eyeY + 2, outline);
      fillRect(ctx, leftEyeX + 1, eyeY + 1, 1, 1, eyeColor);
      fillRect(ctx, rightEyeX + 1, eyeY + 1, 1, 1, eyeColor);
      break;
    case 4: // Star/happy (closed arc)
      // Happy closed eyes — curved lines
      fillRect(ctx, leftEyeX, eyeY + 1, 4, 1, outline);
      fillRect(ctx, rightEyeX, eyeY + 1, 4, 1, outline);
      fillPixel(ctx, leftEyeX, eyeY + 2, outline);
      fillPixel(ctx, leftEyeX + 3, eyeY + 2, outline);
      fillPixel(ctx, rightEyeX, eyeY + 2, outline);
      fillPixel(ctx, rightEyeX + 3, eyeY + 2, outline);
      break;
    case 5: // Glowing/magical
      fillRect(ctx, leftEyeX, eyeY, 3, 3, eyeColor);
      fillRect(ctx, rightEyeX, eyeY, 3, 3, eyeColor);
      fillPixel(ctx, leftEyeX + 1, eyeY + 1, white);
      fillPixel(ctx, rightEyeX + 1, eyeY + 1, white);
      fillRect(ctx, leftEyeX, eyeY, 3, 1, outline);
      fillRect(ctx, rightEyeX, eyeY, 3, 1, outline);
      break;
  }

  saveCanvas(canvas, path.join(outDir, `${style}.png`));
  console.log(`  eyes/${style}.png`);
}

// ============================================================
// Outfit sprites: 10 types x 6 colors = 60 files
// ============================================================
function generateOutfit(outfitType: number, colorIndex: number, outDir: string) {
  const { canvas, ctx } = newCanvas();
  const color = OUTFIT_COLORS[colorIndex];
  const dark = adjustColor(color, -50);
  const light = adjustColor(color, 50);
  const outline = "#1A1A1A";

  // Outfits cover torso area (y=15 to y=24), arms (y=15-23), legs (y=25-31)
  switch (outfitType) {
    case 0: // Simple tunic
      fillRect(ctx, 10, 15, 12, 10, color);
      fillRect(ctx, 7, 15, 3, 9, color);
      fillRect(ctx, 22, 15, 3, 9, color);
      fillRect(ctx, 10, 25, 5, 7, dark);
      fillRect(ctx, 17, 25, 5, 7, dark);
      fillRect(ctx, 10, 15, 12, 1, outline);
      break;
    case 1: // Armor
      fillRect(ctx, 10, 15, 12, 10, color);
      fillRect(ctx, 7, 15, 3, 9, color);
      fillRect(ctx, 22, 15, 3, 9, color);
      // Chest plate highlight
      fillRect(ctx, 12, 16, 8, 4, light);
      fillRect(ctx, 13, 17, 6, 2, light);
      // Pauldrons
      fillRect(ctx, 8, 14, 4, 3, color);
      fillRect(ctx, 20, 14, 4, 3, color);
      fillRect(ctx, 10, 25, 5, 7, dark);
      fillRect(ctx, 17, 25, 5, 7, dark);
      fillRect(ctx, 10, 15, 12, 1, outline);
      break;
    case 2: // Robe
      fillRect(ctx, 10, 15, 12, 10, color);
      fillRect(ctx, 8, 15, 2, 10, color);
      fillRect(ctx, 22, 15, 2, 10, color);
      // Robe extends down wider
      fillRect(ctx, 8, 25, 16, 7, color);
      fillRect(ctx, 9, 16, 2, 8, light); // trim left
      fillRect(ctx, 21, 16, 2, 8, light); // trim right
      fillRect(ctx, 10, 15, 12, 1, outline);
      break;
    case 3: // Leather jacket
      fillRect(ctx, 10, 15, 12, 10, color);
      fillRect(ctx, 7, 15, 3, 10, color);
      fillRect(ctx, 22, 15, 3, 10, color);
      // Collar
      fillRect(ctx, 13, 14, 6, 3, dark);
      fillRect(ctx, 15, 14, 2, 5, outline); // zipper
      fillRect(ctx, 10, 25, 5, 7, dark);
      fillRect(ctx, 17, 25, 5, 7, dark);
      fillRect(ctx, 10, 15, 12, 1, outline);
      break;
    case 4: // Cloak
      fillRect(ctx, 10, 15, 12, 10, color);
      // Cloak drapes wider
      fillRect(ctx, 7, 16, 18, 9, color);
      fillRect(ctx, 7, 16, 1, 9, dark); // left edge
      fillRect(ctx, 24, 16, 1, 9, dark); // right edge
      fillRect(ctx, 10, 25, 5, 7, dark);
      fillRect(ctx, 17, 25, 5, 7, dark);
      fillRect(ctx, 7, 16, 18, 1, outline);
      break;
    case 5: // Military uniform
      fillRect(ctx, 10, 15, 12, 10, color);
      fillRect(ctx, 7, 15, 3, 9, color);
      fillRect(ctx, 22, 15, 3, 9, color);
      // Epaulettes
      fillRect(ctx, 8, 14, 4, 2, light);
      fillRect(ctx, 20, 14, 4, 2, light);
      // Buttons row
      for (let by = 16; by < 24; by += 2) {
        fillPixel(ctx, 15, by, light);
        fillPixel(ctx, 16, by, light);
      }
      fillRect(ctx, 10, 25, 5, 7, dark);
      fillRect(ctx, 17, 25, 5, 7, dark);
      fillRect(ctx, 10, 15, 12, 1, outline);
      break;
    case 6: // Casual shirt
      fillRect(ctx, 10, 15, 12, 10, color);
      fillRect(ctx, 7, 15, 3, 9, color);
      fillRect(ctx, 22, 15, 3, 9, color);
      // Collar
      fillRect(ctx, 13, 14, 6, 3, light);
      fillRect(ctx, 10, 25, 5, 7, dark);
      fillRect(ctx, 17, 25, 5, 7, dark);
      fillRect(ctx, 10, 15, 12, 1, outline);
      break;
    case 7: // Ninja gi
      fillRect(ctx, 10, 15, 12, 10, color);
      fillRect(ctx, 7, 15, 3, 10, color);
      fillRect(ctx, 22, 15, 3, 10, color);
      // Diagonal sash
      for (let i = 0; i < 8; i++) {
        fillPixel(ctx, 12 + i, 15 + i, dark);
      }
      // Belt
      fillRect(ctx, 10, 22, 12, 2, dark);
      fillRect(ctx, 10, 25, 5, 7, color);
      fillRect(ctx, 17, 25, 5, 7, color);
      fillRect(ctx, 10, 15, 12, 1, outline);
      break;
    case 8: // Scholar robes
      fillRect(ctx, 10, 15, 12, 10, color);
      fillRect(ctx, 8, 15, 2, 11, color);
      fillRect(ctx, 22, 15, 2, 11, color);
      // Wide hem
      fillRect(ctx, 7, 26, 18, 6, color);
      // Gold trim
      fillRect(ctx, 8, 25, 16, 1, light);
      fillRect(ctx, 9, 16, 1, 8, light);
      fillRect(ctx, 22, 16, 1, 8, light);
      fillRect(ctx, 10, 15, 12, 1, outline);
      break;
    case 9: // Battle armor (ornate)
      fillRect(ctx, 10, 15, 12, 10, color);
      fillRect(ctx, 7, 15, 3, 9, color);
      fillRect(ctx, 22, 15, 3, 9, color);
      // Heavy shoulder guards
      fillRect(ctx, 6, 13, 5, 4, color);
      fillRect(ctx, 21, 13, 5, 4, color);
      fillRect(ctx, 6, 13, 5, 1, outline);
      fillRect(ctx, 21, 13, 5, 1, outline);
      // Chest emblem
      fillRect(ctx, 13, 17, 6, 5, light);
      fillRect(ctx, 15, 16, 2, 7, light);
      fillRect(ctx, 13, 17, 6, 1, dark);
      // Leg armor
      fillRect(ctx, 10, 25, 5, 7, color);
      fillRect(ctx, 17, 25, 5, 7, color);
      fillRect(ctx, 10, 25, 5, 1, outline);
      fillRect(ctx, 17, 25, 5, 1, outline);
      fillRect(ctx, 10, 15, 12, 1, outline);
      break;
  }

  saveCanvas(canvas, path.join(outDir, `${outfitType}_${colorIndex}.png`));
  console.log(`  outfit/${outfitType}_${colorIndex}.png`);
}

// ============================================================
// Weapon sprites: 4 class weapons
// ============================================================
function generateWeapon(className: string, outDir: string) {
  const { canvas, ctx } = newCanvas();

  switch (className) {
    case "knight": {
      // Sword — vertical blade on right side of body area
      const SV = "#C8C8C8"; // silver
      const DS = "#909090"; // dark silver
      const LS = "#E8E8E8"; // light silver
      const GD = "#FFD700"; // gold
      const BN = "#5C3317"; // wood brown
      const BK = "#1A1A1A";
      // Blade
      fillRect(ctx, 22, 3, 1, 1, LS);
      fillRect(ctx, 21, 4, 3, 1, SV);
      fillRect(ctx, 21, 5, 3, 12, SV);
      fillRect(ctx, 22, 5, 1, 12, DS);
      fillRect(ctx, 21, 4, 1, 13, BK);
      fillRect(ctx, 23, 4, 1, 13, BK);
      // Guard
      fillRect(ctx, 18, 17, 9, 2, GD);
      fillRect(ctx, 18, 17, 9, 1, BK);
      fillRect(ctx, 18, 18, 9, 1, BK);
      // Grip
      fillRect(ctx, 21, 19, 3, 5, BN);
      fillRect(ctx, 21, 19, 1, 5, BK);
      fillRect(ctx, 23, 19, 1, 5, BK);
      // Pommel
      fillRect(ctx, 20, 24, 5, 3, GD);
      fillRect(ctx, 20, 24, 5, 1, BK);
      fillRect(ctx, 20, 26, 5, 1, BK);
      break;
    }
    case "mage": {
      // Staff — long vertical staff with orb on top
      const WD = "#6B3A2A"; // dark wood
      const LW = "#8B5030"; // light wood
      const OR = "#FF8C00"; // orb orange
      const YL = "#FFE44D"; // orb glow
      const PU = "#9B59B6"; // purple accent
      const BK = "#1A1A1A";
      // Staff shaft
      fillRect(ctx, 15, 8, 2, 22, WD);
      fillRect(ctx, 15, 8, 1, 22, LW);
      fillRect(ctx, 15, 8, 2, 1, BK);
      fillRect(ctx, 15, 29, 2, 1, BK);
      // Orb
      fillRect(ctx, 12, 3, 8, 7, OR);
      fillRect(ctx, 13, 2, 6, 1, OR);
      fillRect(ctx, 13, 9, 6, 1, OR);
      fillRect(ctx, 11, 4, 1, 5, OR);
      fillRect(ctx, 20, 4, 1, 5, OR);
      // Orb glow center
      fillRect(ctx, 13, 4, 6, 5, YL);
      fillRect(ctx, 14, 3, 4, 7, YL);
      // Highlight
      fillRect(ctx, 13, 4, 2, 2, "#FFFFFF");
      // Orb outline
      fillRect(ctx, 12, 3, 8, 1, BK);
      fillRect(ctx, 12, 9, 8, 1, BK);
      fillRect(ctx, 11, 4, 1, 5, BK);
      fillRect(ctx, 20, 4, 1, 5, BK);
      // Staff wrap
      fillRect(ctx, 14, 10, 4, 2, PU);
      break;
    }
    case "ranger": {
      // Bow — curved bow shape
      const WD = "#5C3A1E"; // wood
      const LW = "#8B5E3C"; // light wood
      const ST = "#C8C8C8"; // string silver
      const BK = "#1A1A1A";
      // Bow limbs (curved shape)
      // Upper limb
      fillRect(ctx, 8, 3, 2, 4, LW);
      fillRect(ctx, 9, 7, 2, 4, LW);
      fillRect(ctx, 10, 11, 2, 3, LW);
      // Lower limb
      fillRect(ctx, 8, 22, 2, 4, LW);
      fillRect(ctx, 9, 18, 2, 4, LW);
      fillRect(ctx, 10, 14, 2, 4, LW);
      // Handle
      fillRect(ctx, 10, 13, 4, 6, WD);
      fillRect(ctx, 10, 13, 1, 6, BK);
      fillRect(ctx, 13, 13, 1, 6, BK);
      // Bow tip notches
      fillRect(ctx, 8, 2, 2, 2, WD);
      fillRect(ctx, 8, 25, 2, 2, WD);
      // Bow outline
      fillRect(ctx, 8, 3, 1, 23, BK);
      // Bowstring
      fillRect(ctx, 12, 3, 1, 1, ST);
      fillRect(ctx, 13, 4, 1, 1, ST);
      fillRect(ctx, 14, 5, 1, 6, ST);
      fillRect(ctx, 13, 11, 1, 4, ST);
      fillRect(ctx, 12, 15, 1, 2, ST);
      fillRect(ctx, 13, 17, 1, 4, ST);
      fillRect(ctx, 14, 21, 1, 4, ST);
      fillRect(ctx, 13, 25, 1, 1, ST);
      fillRect(ctx, 12, 26, 1, 1, ST);
      // Arrow nocked
      fillRect(ctx, 15, 15, 12, 1, "#C8A060"); // arrow shaft
      fillRect(ctx, 25, 14, 2, 3, "#C0C0C0"); // arrowhead
      break;
    }
    case "healer": {
      // Wand — short ornate wand with star tip
      const WD = "#7B5930"; // light wood
      const PK = "#FF69B4"; // pink
      const WH = "#FFFFFF"; // white
      const YL = "#FFE44D"; // yellow
      const PU = "#9B59B6"; // purple
      const BK = "#1A1A1A";
      // Wand shaft
      fillRect(ctx, 15, 14, 2, 16, WD);
      fillRect(ctx, 15, 14, 1, 16, "#9B7040");
      fillRect(ctx, 15, 14, 2, 1, BK);
      fillRect(ctx, 15, 29, 2, 1, BK);
      // Ribbon wrapping
      for (let i = 0; i < 4; i++) {
        fillRect(ctx, 14, 15 + i * 4, 4, 1, PK);
      }
      // Star shape at top
      // Horizontal bar
      fillRect(ctx, 12, 10, 8, 2, YL);
      // Vertical bar
      fillRect(ctx, 15, 7, 2, 8, YL);
      // Diagonal accents
      fillPixel(ctx, 13, 8, YL);
      fillPixel(ctx, 18, 8, YL);
      fillPixel(ctx, 13, 13, YL);
      fillPixel(ctx, 18, 13, YL);
      // Center gem
      fillRect(ctx, 14, 9, 4, 4, PK);
      fillRect(ctx, 15, 9, 2, 4, WH);
      // Outline
      fillRect(ctx, 12, 10, 8, 1, BK);
      fillRect(ctx, 12, 11, 8, 1, BK);
      fillRect(ctx, 15, 7, 2, 1, BK);
      // Sparkles
      fillPixel(ctx, 10, 7, WH);
      fillPixel(ctx, 21, 7, WH);
      fillPixel(ctx, 10, 14, PU);
      fillPixel(ctx, 21, 14, PU);
      break;
    }
  }

  saveCanvas(canvas, path.join(outDir, `${className}.png`));
  console.log(`  weapon/${className}.png`);
}

// ============================================================
// Background sprites: 3 battlefield backgrounds at 480x320
// ============================================================
function generateBackground(variant: number, outDir: string) {
  const canvas = createCanvas(480, 320);
  const ctx = canvas.getContext("2d");
  ctx.imageSmoothingEnabled = false;

  switch (variant) {
    case 0: {
      // Grassland — blue sky, green ground
      const skyTop = "#4A90E2";
      const skyHorizon = "#87CEEB";
      const groundTop = "#7AB648";
      const groundMid = "#5D9E2F";
      const groundDark = "#3A7A1A";

      // Sky gradient (manual bands)
      const skyHeight = 200;
      for (let y = 0; y < skyHeight; y++) {
        const t = y / skyHeight;
        const r = lerp(0x4A, 0x87, t);
        const g = lerp(0x90, 0xCE, t);
        const b = lerp(0xE2, 0xEB, t);
        ctx.fillStyle = `rgb(${Math.round(r)},${Math.round(g)},${Math.round(b)})`;
        ctx.fillRect(0, y, 480, 1);
      }

      // Sun
      ctx.fillStyle = "#FFE44D";
      ctx.beginPath();
      ctx.arc(80, 60, 30, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#FFCC00";
      ctx.beginPath();
      ctx.arc(80, 60, 24, 0, Math.PI * 2);
      ctx.fill();

      // Clouds (pixel rectangles)
      drawCloud(ctx, 150, 50, "#FFFFFF");
      drawCloud(ctx, 320, 80, "#F0F0F0");
      drawCloud(ctx, 420, 40, "#FFFFFF");

      // Ground
      ctx.fillStyle = groundTop;
      ctx.fillRect(0, 200, 480, 15);
      ctx.fillStyle = groundMid;
      ctx.fillRect(0, 215, 480, 55);
      ctx.fillStyle = groundDark;
      ctx.fillRect(0, 270, 480, 50);

      // Pixel grass tufts
      ctx.fillStyle = "#8FD145";
      for (let x = 0; x < 480; x += 12) {
        ctx.fillRect(x, 197, 2, 4);
        ctx.fillRect(x + 5, 196, 2, 5);
        ctx.fillRect(x + 9, 198, 2, 3);
      }

      // Distant trees (pixel)
      ctx.fillStyle = "#2A6E1A";
      for (let x = 50; x < 480; x += 80) {
        ctx.fillRect(x, 160, 20, 42);
        ctx.fillRect(x - 8, 170, 36, 32);
        ctx.fillRect(x - 4, 155, 28, 20);
      }
      break;
    }

    case 1: {
      // Underground dungeon — dark stone walls and floor
      const bgDark = "#0D0D0D";
      const stone1 = "#3A3A3A";
      const stone2 = "#4A4A4A";
      const stone3 = "#2A2A2A";
      const torchOrange = "#FF8C00";
      const torchYellow = "#FFE44D";

      // Background fill
      ctx.fillStyle = bgDark;
      ctx.fillRect(0, 0, 480, 320);

      // Stone wall blocks (ceiling and side walls)
      for (let row = 0; row < 7; row++) {
        for (let col = 0; col < 15; col++) {
          const offset = row % 2 === 0 ? 0 : 16;
          const bx = col * 32 + offset;
          const by = row * 20;
          const shade = (row + col) % 3 === 0 ? stone1 : (row + col) % 3 === 1 ? stone2 : stone3;
          ctx.fillStyle = shade;
          ctx.fillRect(bx, by, 31, 19);
          ctx.fillStyle = bgDark;
          ctx.fillRect(bx + 31, by, 1, 20); // mortar
          ctx.fillRect(bx, by + 19, 32, 1);
        }
      }

      // Floor
      ctx.fillStyle = "#252525";
      ctx.fillRect(0, 260, 480, 60);
      ctx.fillStyle = "#1A1A1A";
      ctx.fillRect(0, 260, 480, 2);

      // Floor tiles
      for (let col = 0; col < 15; col++) {
        ctx.fillStyle = col % 2 === 0 ? "#2E2E2E" : "#222222";
        ctx.fillRect(col * 32, 262, 32, 58);
        ctx.fillStyle = "#111111";
        ctx.fillRect(col * 32, 262, 1, 58); // grout
      }

      // Torches
      drawTorch(ctx, 80, 120, torchOrange, torchYellow);
      drawTorch(ctx, 240, 120, torchOrange, torchYellow);
      drawTorch(ctx, 400, 120, torchOrange, torchYellow);

      // Glow effect around torches (simple colored rectangles with alpha)
      ctx.fillStyle = "rgba(255,140,0,0.06)";
      ctx.fillRect(40, 90, 80, 80);
      ctx.fillRect(200, 90, 80, 80);
      ctx.fillRect(360, 90, 80, 80);
      break;
    }

    case 2: {
      // Sky arena — floating platform in clouds
      const skyTop = "#1A1A4E";
      const skyBottom = "#3A5FA0";
      const cloudWhite = "#E8E8FF";
      const platformBrown = "#8B5E3C";
      const platformDark = "#5C3A1E";
      const goldTrim = "#FFD700";

      // Night sky gradient
      for (let y = 0; y < 280; y++) {
        const t = y / 280;
        const r = lerp(0x1A, 0x3A, t);
        const g = lerp(0x1A, 0x5F, t);
        const b = lerp(0x4E, 0xA0, t);
        ctx.fillStyle = `rgb(${Math.round(r)},${Math.round(g)},${Math.round(b)})`;
        ctx.fillRect(0, y, 480, 1);
      }

      // Stars (pixel dots)
      ctx.fillStyle = "#FFFFFF";
      const starPositions = [
        [30, 20], [80, 45], [150, 15], [220, 60], [290, 25],
        [360, 50], [430, 10], [460, 70], [10, 80], [120, 100],
        [250, 90], [380, 30], [50, 130], [170, 140], [310, 110],
        [450, 120], [100, 170], [240, 180], [400, 160], [480, 190],
      ];
      for (const [sx, sy] of starPositions) {
        ctx.fillRect(sx, sy, 2, 2);
        // Sparkle cross
        ctx.fillRect(sx + 1, sy - 1, 1, 1);
        ctx.fillRect(sx + 1, sy + 2, 1, 1);
      }

      // Moon
      ctx.fillStyle = "#F5F5DC";
      ctx.beginPath();
      ctx.arc(420, 50, 28, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#1A1A4E"; // crescent shadow
      ctx.beginPath();
      ctx.arc(430, 44, 24, 0, Math.PI * 2);
      ctx.fill();

      // Cloud layers
      ctx.fillStyle = cloudWhite;
      for (let cx = -40; cx < 520; cx += 120) {
        drawCloudLarge(ctx, cx, 210, cloudWhite);
      }
      ctx.fillStyle = "rgba(232,232,255,0.5)";
      for (let cx = 0; cx < 520; cx += 100) {
        drawCloudLarge(ctx, cx, 240, "rgba(232,232,255,0.4)");
      }

      // Floating platform
      ctx.fillStyle = platformBrown;
      ctx.fillRect(40, 270, 400, 30);
      ctx.fillStyle = platformDark;
      ctx.fillRect(40, 295, 400, 15);
      // Platform top edge
      ctx.fillStyle = goldTrim;
      ctx.fillRect(40, 268, 400, 3);
      // Platform pillars / decorations
      for (let px = 60; px < 460; px += 80) {
        ctx.fillStyle = goldTrim;
        ctx.fillRect(px, 260, 6, 12);
        ctx.fillRect(px - 3, 258, 12, 4);
      }
      // Platform side decorations
      ctx.fillStyle = platformDark;
      ctx.fillRect(40, 270, 8, 35);
      ctx.fillRect(432, 270, 8, 35);
      ctx.fillStyle = goldTrim;
      ctx.fillRect(38, 268, 4, 37);
      ctx.fillRect(438, 268, 4, 37);
      break;
    }
  }

  const outPath = path.join(outDir, `${variant}.png`);
  const buffer = canvas.toBuffer("image/png");
  fs.writeFileSync(outPath, buffer);
  console.log(`  bg/${variant}.png`);
}

// ============================================================
// Helper: linear interpolation
// ============================================================
function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

// ============================================================
// Helper: draw a pixelated cloud
// ============================================================
function drawCloud(ctx: ReturnType<ReturnType<typeof createCanvas>["getContext"]>, x: number, y: number, color: string) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y + 10, 60, 20);
  ctx.fillRect(x + 10, y + 4, 40, 28);
  ctx.fillRect(x + 18, y, 24, 36);
}

function drawCloudLarge(ctx: ReturnType<ReturnType<typeof createCanvas>["getContext"]>, x: number, y: number, color: string) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y + 15, 100, 25);
  ctx.fillRect(x + 15, y + 5, 70, 35);
  ctx.fillRect(x + 30, y, 40, 45);
}

// ============================================================
// Helper: draw a pixel torch
// ============================================================
function drawTorch(
  ctx: ReturnType<ReturnType<typeof createCanvas>["getContext"]>,
  x: number,
  y: number,
  orange: string,
  yellow: string
) {
  const BN = "#5C3317";
  // Handle
  ctx.fillStyle = BN;
  ctx.fillRect(x - 3, y + 10, 6, 18);
  // Bracket
  ctx.fillStyle = "#888888";
  ctx.fillRect(x - 5, y + 8, 10, 4);
  // Flame layers
  ctx.fillStyle = orange;
  ctx.fillRect(x - 5, y, 10, 12);
  ctx.fillRect(x - 3, y - 5, 6, 6);
  ctx.fillStyle = yellow;
  ctx.fillRect(x - 3, y + 2, 6, 8);
  ctx.fillRect(x - 1, y - 3, 2, 5);
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(x - 1, y + 4, 2, 4);
}

// ============================================================
// Helper: lighten/darken hex color
// ============================================================
function adjustColor(hex: string, amount: number): string {
  const r = Math.min(255, Math.max(0, parseInt(hex.slice(1, 3), 16) + amount));
  const g = Math.min(255, Math.max(0, parseInt(hex.slice(3, 5), 16) + amount));
  const b = Math.min(255, Math.max(0, parseInt(hex.slice(5, 7), 16) + amount));
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

// ============================================================
// Main generation
// ============================================================
function main() {
  const publicDir = path.join(process.cwd(), "public", "sprites");

  const bodyDir = path.join(publicDir, "body");
  const hairDir = path.join(publicDir, "hair");
  const eyesDir = path.join(publicDir, "eyes");
  const outfitDir = path.join(publicDir, "outfit");
  const weaponDir = path.join(publicDir, "weapon");
  const bgDir = path.join(publicDir, "bg");

  ensureDir(bodyDir);
  ensureDir(hairDir);
  ensureDir(eyesDir);
  ensureDir(outfitDir);
  ensureDir(weaponDir);
  ensureDir(bgDir);

  console.log("\nGenerating body sprites (3 types x 6 skin tones)...");
  for (let bodyType = 0; bodyType < 3; bodyType++) {
    for (let skinTone = 0; skinTone < 6; skinTone++) {
      generateBody(bodyType, skinTone, bodyDir);
    }
  }

  console.log("\nGenerating hair sprites (8 styles x 8 colors)...");
  for (let style = 0; style < 8; style++) {
    for (let color = 0; color < 8; color++) {
      generateHair(style, color, hairDir);
    }
  }

  console.log("\nGenerating eye sprites (6 styles)...");
  for (let style = 0; style < 6; style++) {
    generateEyes(style, eyesDir);
  }

  console.log("\nGenerating outfit sprites (10 types x 6 colors)...");
  for (let outfitType = 0; outfitType < 10; outfitType++) {
    for (let color = 0; color < 6; color++) {
      generateOutfit(outfitType, color, outfitDir);
    }
  }

  console.log("\nGenerating weapon sprites (4 classes)...");
  for (const className of ["knight", "mage", "ranger", "healer"]) {
    generateWeapon(className, weaponDir);
  }

  console.log("\nGenerating background sprites (3 variants)...");
  for (let variant = 0; variant < 3; variant++) {
    generateBackground(variant, bgDir);
  }

  const total = 18 + 64 + 6 + 60 + 4 + 3;
  console.log(`\nAll ${total} sprite assets generated successfully!`);
  console.log(`Output directory: ${publicDir}`);
}

main();
