/**
 * Protagonista educativo HD — 4 direcciones, expresiones, estilo prototipo usuario.
 * Hoodie azul, logo amarillo, jeans, zapatos rojos, mochila marrón.
 */
import { buf, px, rect, groundShadow } from './iso/iso-art-utils.mjs';

function ellipse(b, cx, cy, rx, ry, c) {
  for (let y = -ry; y <= ry; y++)
    for (let x = -rx; x <= rx; x++)
      if ((x * x) / (rx * rx + 0.01) + (y * y) / (ry * ry + 0.01) <= 1) px(b, Math.round(cx + x), Math.round(cy + y), c);
}

export const FW = 112;
export const FH = 144;
export const FRAMES_PER_DIR = 7;
export const DIRS = ['down', 'up', 'left', 'right'];

const C = {
  outline: [38, 32, 28, 255],
  skin: [242, 198, 158, 255],
  skinSh: [208, 158, 118, 255],
  hair: [118, 72, 42, 255],
  hairHi: [158, 108, 62, 255],
  hairDark: [82, 48, 28, 255],
  eye: [72, 48, 32, 255],
  eyeHi: [255, 255, 255, 255],
  hoodie: [68, 148, 78, 255],
  hoodieHi: [88, 168, 98, 255],
  hoodieDark: [48, 118, 58, 255],
  shirt: [248, 248, 252, 255],
  logo: [248, 210, 58, 255],
  logoInner: [58, 168, 88, 255],
  jeans: [68, 72, 82, 255],
  jeansHi: [88, 92, 102, 255],
  jeansPatch: [58, 62, 72, 255],
  backpack: [98, 68, 48, 255],
  backpackHi: [128, 88, 58, 255],
  shoe: [168, 88, 58, 255],
  shoeHi: [248, 248, 252, 255],
  shoeSole: [238, 238, 242, 255],
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
  if (phase === 0) return { left: -6, right: 5, armL: 4, armR: -4, bob: 0 };
  if (phase === 1) return { left: 0, right: 0, armL: 0, armR: 0, bob: -2 };
  return { left: 5, right: -6, armL: -4, armR: 4, bob: 0 };
}

function idleBob(phase) {
  if (phase === 0) return { bob: 0 };
  if (phase === 1) return { bob: -2 };
  return { bob: 0 };
}

function drawShoe(b, x, y) {
  rect(b, x, y, 12, 5, C.shoe);
  rect(b, x, y + 5, 12, 4, C.shoeSole);
  rect(b, x + 1, y + 1, 5, 3, C.shoeHi);
}

function drawLegPair(b, ox, oy, swing, facing) {
  const ly = oy + swing.bob;
  if (facing === 'down' || facing === 'up') {
    rect(b, ox - 14, ly - 26 + swing.left, 10, 20, C.jeans);
    rect(b, ox + 4, ly - 26 + swing.right, 10, 20, C.jeans);
    rect(b, ox - 12, ly - 14 + swing.left, 5, 6, C.jeansPatch);
    rect(b, ox + 6, ly - 14 + swing.right, 5, 6, C.jeansPatch);
    drawShoe(b, ox - 15, ly - 2 + swing.left);
    drawShoe(b, ox + 3, ly - 2 + swing.right);
  } else {
    const f = facing === 'left' ? -1 : 1;
    rect(b, ox + f * (-5 + swing.left), ly - 26, 8, 20, C.jeans);
    rect(b, ox + f * (2 + swing.right), ly - 26, 8, 20, C.jeansPatch);
    drawShoe(b, ox + f * (-6 + swing.left), ly - 2);
    drawShoe(b, ox + f * (1 + swing.right), ly - 2);
  }
}

function drawBackpack(b, ox, oy, dir, bob) {
  const y = oy - 48 + bob;
  if (dir === 'down') {
    rect(b, ox - 16, y, 10, 20, C.backpack);
    rect(b, ox - 15, y + 2, 8, 14, C.backpackHi);
    rect(b, ox - 17, y - 5, 4, 10, C.hoodieDark);
    rect(b, ox - 5, y - 5, 4, 10, C.hoodieDark);
  } else if (dir === 'up') {
    rect(b, ox - 14, y - 4, 28, 24, C.backpack);
    rect(b, ox - 11, y, 22, 18, C.backpackHi);
  } else {
    const f = dir === 'left' ? -1 : 1;
    rect(b, ox + f * 5, y, 12, 20, C.backpack);
    rect(b, ox + f * 6, y + 2, 9, 14, C.backpackHi);
  }
}

function drawTorsoFront(b, ox, oy, bob) {
  const y = oy - 58 + bob;
  rect(b, ox - 18, y, 36, 30, C.hoodie);
  rect(b, ox - 14, y + 4, 28, 22, C.hoodieHi);
  rect(b, ox - 8, y + 6, 16, 18, C.shirt);
  ellipse(b, ox, y + 14, 6, 6, C.logo);
  px(b, ox, y + 14, C.logoInner);
  rect(b, ox - 18, y, 36, 5, C.hoodieDark);
  rect(b, ox - 12, y + 22, 8, 8, C.hoodieDark);
  rect(b, ox + 4, y + 22, 8, 8, C.hoodieDark);
  rect(b, ox - 12, y + 26, 24, 6, C.jeans);
}

function drawTorsoBack(b, ox, oy, bob) {
  const y = oy - 44 + bob;
  rect(b, ox - 14, y, 28, 24, C.hoodieDark);
  rect(b, ox - 11, y + 3, 22, 18, C.hoodie);
  rect(b, ox - 10, y + 18, 20, 6, C.jeans);
}

function drawTorsoSide(b, ox, oy, bob, facing) {
  const f = facing === 'left' ? -1 : 1;
  const y = oy - 44 + bob;
  rect(b, ox + f * -5, y, 14, 24, C.hoodie);
  rect(b, ox + f * -4, y + 3, 11, 18, C.hoodieHi);
  rect(b, ox + f * -2, y + 5, 6, 12, C.shirt);
  rect(b, ox + f * -6, y + 18, 12, 6, C.jeans);
}

function drawArmsFront(b, ox, oy, swing, bob, interact, idle) {
  const y = oy - 40 + bob;
  if (idle) {
    rect(b, ox - 20, y + 4, 6, 14, C.hoodie);
    rect(b, ox + 14, y + 4, 6, 14, C.hoodie);
    return;
  }
  rect(b, ox - 20 + swing.armL, y + 2, 6, 14, C.hoodie);
  rect(b, ox + 14 + swing.armR, y + 2, 6, 14, C.hoodie);
  if (interact) {
    rect(b, ox - 2, y + 10, 10, 5, C.skin);
    rect(b, ox + 8, y + 9, 6, 5, C.skin);
  } else {
    rect(b, ox - 18 + swing.armL, y + 12, 5, 5, C.skin);
    rect(b, ox + 15 + swing.armR, y + 12, 5, 5, C.skin);
  }
}

function drawArmsBack(b, ox, oy, swing, bob) {
  const y = oy - 40 + bob;
  rect(b, ox - 18 + swing.armL, y + 5, 5, 12, C.hoodieDark);
  rect(b, ox + 13 + swing.armR, y + 5, 5, 12, C.hoodieDark);
}

function drawArmsSide(b, ox, oy, swing, bob, facing, interact) {
  const f = facing === 'left' ? -1 : 1;
  const y = oy - 40 + bob;
  if (interact) {
    rect(b, ox + f * 8, y + 8, 12, 5, C.hoodie);
    rect(b, ox + f * 18, y + 7, 6, 5, C.skin);
  } else {
    rect(b, ox + f * (6 + swing.armR), y + 2, 5, 14, C.hoodie);
    rect(b, ox + f * (6 + swing.armR), y + 13, 5, 5, C.skin);
  }
}

function drawHeadFront(b, ox, oy, bob, expr) {
  const y = oy - 82 + bob;
  rect(b, ox - 14, y, 28, 22, C.skin);
  rect(b, ox - 16, y - 12, 32, 16, C.hair);
  rect(b, ox - 14, y - 18, 8, 6, C.hairHi);
  rect(b, ox - 2, y - 19, 6, 7, C.hairHi);
  rect(b, ox + 6, y - 14, 7, 6, C.hairHi);
  rect(b, ox + 8, y - 8, 6, 8, C.hair);
  if (expr === 1) {
    rect(b, ox - 6, y + 6, 5, 2, C.hairDark);
    rect(b, ox + 3, y + 6, 5, 2, C.hairDark);
  } else {
    px(b, ox - 6, y + 6, C.eye);
    px(b, ox + 5, y + 6, C.eye);
    px(b, ox - 5, y + 5, C.eyeHi);
    px(b, ox + 6, y + 5, C.eyeHi);
  }
  if (expr === 2) {
    rect(b, ox - 3, y + 12, 6, 2, [180, 100, 100, 255]);
  } else {
    px(b, ox - 1, y + 12, C.outline);
    px(b, ox + 1, y + 12, C.outline);
  }
}

function drawHeadBack(b, ox, oy, bob) {
  const y = oy - 62 + bob;
  rect(b, ox - 12, y, 24, 18, C.hairDark);
  rect(b, ox - 13, y - 10, 26, 12, C.hair);
  rect(b, ox - 8, y - 8, 16, 8, C.hairHi);
  rect(b, ox - 10, y + 4, 20, 12, C.hair);
  rect(b, ox - 9, y + 14, 18, 5, C.hoodieDark);
}

function drawHeadSide(b, ox, oy, bob, facing, expr) {
  const f = facing === 'left' ? -1 : 1;
  const y = oy - 62 + bob;
  rect(b, ox + f * -3, y, 12, 18, C.skin);
  rect(b, ox + f * -8, y - 10, 16, 12, C.hair);
  rect(b, ox + f * -5, y - 12, 9, 6, C.hairHi);
  rect(b, ox + f * 2, y - 5, 7, 9, C.hair);
  if (expr !== 1) {
    px(b, ox + f * 1, y + 5, C.eye);
    px(b, ox, y + 4, C.eyeHi);
  }
  px(b, ox + f * 2, y + 10, C.skinSh);
}

function drawFrame(dir, frameIndex) {
  const b = buf(FW, FH);
  const ox = 56;
  const oy = 118;
  const isInteract = frameIndex === 6;
  const isWalk = frameIndex >= 3 && frameIndex <= 5;
  const phase = isWalk ? frameIndex - 3 : frameIndex;
  const swing = isWalk || isInteract ? legSwing(isInteract ? 1 : phase) : legSwing(1);
  const idle = !isWalk && !isInteract;
  const bob = idle ? idleBob(phase).bob : swing.bob;
  const expr = idle ? phase : 0;

  groundShadow(b, FW, FH, 52);

  if (dir === 'down') {
    drawBackpack(b, ox, oy, 'down', bob);
    drawLegPair(b, ox, oy, swing, 'down');
    drawTorsoFront(b, ox, oy, bob);
    drawArmsFront(b, ox, oy, swing, bob, isInteract, idle);
    drawHeadFront(b, ox, oy, bob, expr);
  } else if (dir === 'up') {
    drawLegPair(b, ox, oy, swing, 'up');
    drawTorsoBack(b, ox, oy, bob);
    drawBackpack(b, ox, oy, 'up', bob);
    drawArmsBack(b, ox, oy, swing, bob);
    drawHeadBack(b, ox, oy, bob);
  } else {
    drawBackpack(b, ox, oy, dir, bob);
    drawLegPair(b, ox, oy, swing, dir);
    drawTorsoSide(b, ox, oy, bob, dir);
    drawArmsSide(b, ox, oy, swing, bob, dir, isInteract);
    drawHeadSide(b, ox, oy, bob, dir, expr);
  }

  return b;
}

export function buildEduPlayerFrames() {
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
