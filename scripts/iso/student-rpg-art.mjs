/**
 * Protagonista universitario — sprite sheet RPG 4 direcciones × 7 frames.
 * Diseño: chaqueta denim, camiseta blanca, jeans, mochila naranja, cabello castaño.
 */
import { buf, px, rect, blend, groundShadow } from './iso-art-utils.mjs';

export const FW = 72;
export const FH = 96;
export const FRAMES_PER_DIR = 7;
export const DIRS = ['down', 'up', 'left', 'right'];

const C = {
  outline: [38, 32, 28, 255],
  skin: [242, 198, 158, 255],
  skinSh: [208, 158, 118, 255],
  hair: [118, 72, 42, 255],
  hairHi: [158, 108, 62, 255],
  hairDark: [82, 48, 28, 255],
  eye: [88, 52, 32, 255],
  eyeHi: [255, 255, 255, 255],
  jacket: [52, 82, 142, 255],
  jacketHi: [72, 108, 168, 255],
  jacketDark: [36, 58, 108, 255],
  jacketSeam: [44, 68, 118, 255],
  shirt: [248, 248, 252, 255],
  jeans: [56, 60, 74, 255],
  jeansHi: [76, 80, 96, 255],
  jeansDark: [40, 44, 56, 255],
  backpack: [228, 138, 42, 255],
  backpackHi: [255, 178, 72, 255],
  backpackDark: [178, 98, 28, 255],
  shoe: [34, 36, 46, 255],
  shoeHi: [248, 248, 252, 255],
  shoeSole: [218, 218, 224, 255],
};

function flipH(src) {
  const dst = buf(src.w, src.h);
  for (let y = 0; y < src.h; y++) {
    for (let x = 0; x < src.w; x++) {
      const si = (y * src.w + (src.w - 1 - x)) * 4;
      const di = (y * dst.w + x) * 4;
      dst.data[di] = src.data[si];
      dst.data[di + 1] = src.data[si + 1];
      dst.data[di + 2] = src.data[si + 2];
      dst.data[di + 3] = src.data[si + 3];
    }
  }
  return dst;
}

function legSwing(phase) {
  if (phase === 0) return { left: -5, right: 4, armL: 3, armR: -3, bob: 0 };
  if (phase === 1) return { left: 0, right: 0, armL: 0, armR: 0, bob: -1 };
  return { left: 4, right: -5, armL: -3, armR: 3, bob: 0 };
}

function idleBob(phase) {
  if (phase === 0) return { bob: 0, breathe: 0 };
  if (phase === 1) return { bob: -1, breathe: 1 };
  return { bob: 0, breathe: 0 };
}

function drawShoe(b, x, y, side) {
  rect(b, x, y, 9, 4, C.shoe);
  rect(b, x, y + 4, 9, 3, C.shoeSole);
  rect(b, x, y, 4, 3, C.shoeHi);
  rect(b, x + 1, y + 1, 3, 2, C.shoeSole);
  if (side === 'left') outlineShoe(b, x, y);
}

function outlineShoe(b, x, y) {
  for (let dx = 0; dx < 9; dx++) {
    px(b, x + dx, y, C.outline);
    px(b, x + dx, y + 6, C.outline);
  }
  px(b, x, y + 1, C.outline);
  px(b, x + 8, y + 1, C.outline);
}

function drawLegPair(b, ox, oy, swing, facing) {
  const ly = oy + swing.bob;
  if (facing === 'down' || facing === 'up') {
    rect(b, ox - 10, ly - 20 + swing.left, 8, 16, C.jeans);
    rect(b, ox + 2, ly - 20 + swing.right, 8, 16, C.jeans);
    rect(b, ox - 9, ly - 18 + swing.left, 3, 5, C.jeansHi);
    rect(b, ox + 3, ly - 18 + swing.right, 3, 5, C.jeansHi);
    drawShoe(b, ox - 11, ly - 2 + swing.left, 'left');
    drawShoe(b, ox + 1, ly - 2 + swing.right, 'right');
  } else {
    const f = facing === 'left' ? -1 : 1;
    rect(b, ox + f * (-4 + swing.left), ly - 20, 6, 16, C.jeans);
    rect(b, ox + f * (2 + swing.right), ly - 20, 6, 16, C.jeansDark);
    drawShoe(b, ox + f * (-5 + swing.left), ly - 2, 'left');
    drawShoe(b, ox + f * (1 + swing.right), ly - 2, 'right');
  }
}

function drawBackpack(b, ox, oy, dir, bob) {
  const y = oy - 38 + bob;
  if (dir === 'down') {
    rect(b, ox - 12, y, 8, 16, C.backpack);
    rect(b, ox - 11, y + 1, 6, 12, C.backpackHi);
    rect(b, ox - 11, y + 8, 6, 2, C.backpackDark);
    rect(b, ox - 13, y - 4, 3, 8, C.backpackDark);
    rect(b, ox - 4, y - 4, 3, 8, C.backpackDark);
  } else if (dir === 'up') {
    rect(b, ox - 10, y - 2, 20, 18, C.backpack);
    rect(b, ox - 8, y, 16, 14, C.backpackHi);
    rect(b, ox - 2, y + 4, 4, 6, C.backpackDark);
    rect(b, ox - 9, y - 6, 4, 6, C.backpackDark);
    rect(b, ox + 5, y - 6, 4, 6, C.backpackDark);
  } else {
    const f = dir === 'left' ? -1 : 1;
    rect(b, ox + f * 4, y, 10, 16, C.backpack);
    rect(b, ox + f * 5, y + 2, 7, 11, C.backpackHi);
    rect(b, ox + f * 2, y - 3, 3, 10, C.backpackDark);
  }
}

function drawTorsoFront(b, ox, oy, bob) {
  const y = oy - 48 + bob;
  rect(b, ox - 14, y, 28, 24, C.jacket);
  rect(b, ox - 11, y + 3, 22, 18, C.jacketHi);
  rect(b, ox - 6, y + 4, 12, 14, C.shirt);
  rect(b, ox - 14, y, 28, 4, C.jacketDark);
  rect(b, ox - 4, y + 2, 8, 5, C.jacketHi);
  rect(b, ox - 12, y + 10, 4, 9, C.jacketSeam);
  rect(b, ox + 8, y + 10, 4, 9, C.jacketSeam);
  rect(b, ox - 9, y + 16, 6, 5, C.jacketDark);
  rect(b, ox + 3, y + 16, 6, 5, C.jacketDark);
  rect(b, ox - 10, y + 20, 20, 5, C.jeans);
  rect(b, ox - 9, y + 24, 5, 3, C.jeansHi);
  rect(b, ox + 4, y + 24, 5, 3, C.jeansHi);
}

function drawTorsoBack(b, ox, oy, bob) {
  const y = oy - 36 + bob;
  rect(b, ox - 11, y, 22, 18, C.jacketDark);
  rect(b, ox - 9, y + 2, 18, 14, C.jacket);
  rect(b, ox - 10, y + 6, 20, 2, C.jacketSeam);
  rect(b, ox - 8, y + 14, 16, 4, C.jeansDark);
}

function drawTorsoSide(b, ox, oy, bob, facing) {
  const f = facing === 'left' ? -1 : 1;
  const y = oy - 36 + bob;
  rect(b, ox + f * -4, y, 12, 18, C.jacket);
  rect(b, ox + f * -3, y + 2, 9, 14, C.jacketHi);
  rect(b, ox + f * -1, y + 4, 5, 10, C.shirt);
  rect(b, ox + f * -5, y + 14, 10, 4, C.jeans);
  rect(b, ox + f * 2, y + 1, 3, 14, C.jacketDark);
}

function drawArmsFront(b, ox, oy, swing, bob, interact) {
  const y = oy - 34 + bob;
  rect(b, ox - 16 + swing.armL, y + 2, 5, 11, C.jacket);
  rect(b, ox + 11 + swing.armR, y + 2, 5, 11, C.jacket);
  rect(b, ox - 15 + swing.armL, y + 10, 4, 4, C.skin);
  if (interact) {
    rect(b, ox - 2, y + 8, 8, 4, C.skin);
    rect(b, ox + 6, y + 7, 5, 4, C.skin);
  } else {
    rect(b, ox + 12 + swing.armR, y + 10, 4, 4, C.skin);
  }
}

function drawArmsBack(b, ox, oy, swing, bob) {
  const y = oy - 34 + bob;
  rect(b, ox - 15 + swing.armL, y + 4, 4, 10, C.jacketDark);
  rect(b, ox + 11 + swing.armR, y + 4, 4, 10, C.jacketDark);
}

function drawArmsSide(b, ox, oy, swing, bob, facing, interact) {
  const f = facing === 'left' ? -1 : 1;
  const y = oy - 34 + bob;
  if (interact) {
    rect(b, ox + f * 6, y + 6, 10, 4, C.jacket);
    rect(b, ox + f * 14, y + 5, 5, 4, C.skin);
  } else {
    rect(b, ox + f * (5 + swing.armR), y + 2, 4, 12, C.jacket);
    rect(b, ox + f * (-8 + swing.armL), y + 4, 4, 10, C.jacketDark);
    rect(b, ox + f * (6 + swing.armR), y + 11, 4, 4, C.skin);
  }
}

function drawHeadFront(b, ox, oy, bob) {
  const y = oy - 70 + bob;
  rect(b, ox - 11, y, 22, 18, C.skin);
  rect(b, ox - 13, y - 10, 26, 13, C.hair);
  rect(b, ox - 11, y - 14, 6, 5, C.hairHi);
  rect(b, ox - 2, y - 15, 5, 6, C.hairHi);
  rect(b, ox + 4, y - 12, 6, 5, C.hairHi);
  rect(b, ox + 6, y - 7, 5, 7, C.hair);
  px(b, ox - 5, y + 5, C.eye);
  px(b, ox + 4, y + 5, C.eye);
  px(b, ox - 4, y + 4, C.eyeHi);
  px(b, ox + 5, y + 4, C.eyeHi);
  px(b, ox, y + 9, C.skinSh);
  px(b, ox - 2, y + 10, C.outline);
  px(b, ox + 2, y + 10, C.outline);
}

function drawHeadBack(b, ox, oy, bob) {
  const y = oy - 52 + bob;
  rect(b, ox - 9, y, 18, 14, C.hairDark);
  rect(b, ox - 10, y - 8, 20, 10, C.hair);
  rect(b, ox - 6, y - 6, 12, 6, C.hairHi);
  rect(b, ox - 8, y + 2, 16, 10, C.hair);
  rect(b, ox - 7, y + 10, 14, 4, C.jacketDark);
}

function drawHeadSide(b, ox, oy, bob, facing) {
  const f = facing === 'left' ? -1 : 1;
  const y = oy - 52 + bob;
  rect(b, ox + f * -2, y, 10, 14, C.skin);
  rect(b, ox + f * -6, y - 8, 14, 10, C.hair);
  rect(b, ox + f * -4, y - 10, 8, 5, C.hairHi);
  rect(b, ox + f * 2, y - 4, 6, 8, C.hair);
  if (facing === 'left') {
    px(b, ox - 1, y + 4, C.eye);
    px(b, ox, y + 3, C.eyeHi);
  } else {
    px(b, ox + 1, y + 4, C.eye);
    px(b, ox, y + 3, C.eyeHi);
  }
  px(b, ox + f * 1, y + 8, C.skinSh);
}

function drawFrame(dir, frameIndex) {
  const b = buf(FW, FH);
  const ox = 36;
  const oy = 88;
  const isInteract = frameIndex === 6;
  const isWalk = frameIndex >= 3 && frameIndex <= 5;
  const phase = isWalk ? frameIndex - 3 : frameIndex;
  const swing = isWalk || isInteract ? legSwing(isInteract ? 1 : phase) : legSwing(1);
  const idle = !isWalk && !isInteract ? idleBob(phase) : { bob: swing.bob, breathe: 0 };
  const bob = idle.bob;

  groundShadow(b, FW, FH, 42);

  if (dir === 'down') {
    drawBackpack(b, ox, oy, 'down', bob);
    drawLegPair(b, ox, oy, swing, 'down');
    drawTorsoFront(b, ox, oy, bob);
    drawArmsFront(b, ox, oy, swing, bob, isInteract);
    drawHeadFront(b, ox, oy, bob);
  } else if (dir === 'up') {
    drawLegPair(b, ox, oy, swing, 'up');
    drawTorsoBack(b, ox, oy, bob);
    drawBackpack(b, ox, oy, 'up', bob);
    drawArmsBack(b, ox, oy, swing, bob);
    drawHeadBack(b, ox, oy, bob);
  } else {
    const facing = dir;
    drawBackpack(b, ox, oy, facing, bob);
    drawLegPair(b, ox, oy, swing, facing);
    drawTorsoSide(b, ox, oy, bob, facing);
    drawArmsSide(b, ox, oy, swing, bob, facing, isInteract);
    drawHeadSide(b, ox, oy, bob, facing);
  }

  return b;
}

/** 28 frames: 4 dirs × 7 (idle×3, walk×3, interact) */
export function buildStudentFrames() {
  const frames = [];
  for (const dir of DIRS) {
    if (dir === 'right') {
      for (let f = 0; f < FRAMES_PER_DIR; f++) frames.push(flipH(drawFrame('left', f)));
    } else {
      for (let f = 0; f < FRAMES_PER_DIR; f++) frames.push(drawFrame(dir, f));
    }
  }
  return frames;
}
