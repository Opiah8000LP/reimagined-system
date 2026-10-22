// rotating 3D wireframes drawn onto the 2D canvas, plus a few outline symbols
import { TAU } from './util.js';

const PHI = (1 + Math.sqrt(5)) / 2;
const unit = p => { const l = Math.hypot(p[0], p[1], p[2]); return [p[0] / l, p[1] / l, p[2] / l]; };

function edges(verts, maxLen) {
  const out = [];
  for (let i = 0; i < verts.length; i++) {
    for (let j = i + 1; j < verts.length; j++) {
      const d = Math.hypot(verts[i][0] - verts[j][0], verts[i][1] - verts[j][1], verts[i][2] - verts[j][2]);
      if (d < maxLen) out.push([i, j]);
    }
  }
  return out;
}

const icoV = [[-1, PHI, 0], [1, PHI, 0], [-1, -PHI, 0], [1, -PHI, 0], [0, -1, PHI], [0, 1, PHI], [0, -1, -PHI], [0, 1, -PHI], [PHI, 0, -1], [PHI, 0, 1], [-PHI, 0, -1], [-PHI, 0, 1]].map(unit);
const octV = [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]];
const cubeV = [[-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1], [-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1]].map(unit);

export const SHAPES = {
  ico: { v: icoV, e: edges(icoV, 1.1) },
  octa: { v: octV, e: edges(octV, 1.5) },
  cube: { v: cubeV, e: edges(cubeV, 1.2) }
};

// jitter wobbles every vertex for the glitchy look. set strokeStyle first
export function drawWire(ctx, shape, x, y, size, rx, ry, jitter = 0, depth = 3) {
  const cx = Math.cos(rx), sx = Math.sin(rx), cy = Math.cos(ry), sy = Math.sin(ry);
  const pts = shape.v.map((p, i) => {
    const x1 = p[0] * cy + p[2] * sy, z1 = -p[0] * sy + p[2] * cy;
    const y2 = p[1] * cx - z1 * sx, z2 = p[1] * sx + z1 * cx;
    const k = depth / (depth - z2), w = jitter ? Math.sin(i * 12.9 + rx * 40) * jitter : 0;
    return [x + (x1 + w) * size * k, y + (y2 + w * 0.6) * size * k];
  });
  ctx.beginPath();
  for (const [a, b] of shape.e) { ctx.moveTo(pts[a][0], pts[a][1]); ctx.lineTo(pts[b][0], pts[b][1]); }
  ctx.stroke();
}

export function crescent(ctx, r) {
  ctx.beginPath();
  ctx.arc(0, 0, r, 0.55 * Math.PI, 1.45 * Math.PI);
  ctx.arc(r * 0.42, 0, r * 0.78, 1.5 * Math.PI, 0.5 * Math.PI, true);
  ctx.closePath();
  ctx.stroke();
}

export function circle(ctx, x, y, r) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, TAU);
  ctx.stroke();
}
