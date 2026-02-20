'use strict';

// ---------------------------------------------------------------------------
// Breathing Order
// 秩序は静止ではなく、呼吸する生命体である。
// ---------------------------------------------------------------------------

let t = 0;

// Ring definitions: [pointCount, baseRadius as fraction of min(width, height)]
const RING_DEFS = [
  [6,  0.055],
  [12, 0.100],
  [18, 0.148],
  [24, 0.198],
  [30, 0.250],
  [36, 0.302],
  [42, 0.356],
  [48, 0.410],
];

function setup() {
  createCanvas(windowWidth, windowHeight);
  noiseDetail(4, 0.5);
}

function draw() {
  background(0);
  translate(width / 2, height / 2);

  const minDim = min(width, height);
  const n      = RING_DEFS.length;

  // ------------------------------------------------------------------
  // Master breathing oscillator
  // sin() で基本周期（60fps 換算で約 15 秒 / 呼吸）を作り、
  // noise() で微細な揺らぎを重ねる
  // ------------------------------------------------------------------
  const breathPhase  = t * 0.007;
  const masterBreath = sin(breathPhase) * 0.10
                     + (noise(t * 0.0015, 0) - 0.5) * 0.08;
  const breathFactor = 1.0 + masterBreath;

  // ほぼ気づかない速度のゆっくりした回転
  rotate(t * 0.00013);

  // ------------------------------------------------------------------
  // 各リング
  // ------------------------------------------------------------------
  RING_DEFS.forEach(([count, baseR], ri) => {

    // リングごとに位相をずらして、外側へ伝わるさざ波を表現
    const phaseOff   = ri * 0.22;
    const ringNoise  = (noise(ri * 9.1, t * 0.0020) - 0.5) * 0.05;
    const localMod   = sin(breathPhase + phaseOff) * 0.045 + ringNoise;
    const radius     = baseR * minDim * breathFactor * (1 + localMod);

    // --- 各点の座標を計算 ---
    const pts = [];
    for (let i = 0; i < count; i++) {
      const angle = (TWO_PI / count) * i;
      const seed  = ri * 300 + i;

      // 半径方向・角度方向に noise で微小なズレ
      const wR = (noise(seed,       t * 0.0030) - 0.5) * 4.5;
      const wA = (noise(seed + 777, t * 0.0025) - 0.5) * 0.022;

      const r = radius + wR;
      const a = angle  + wA;
      pts.push([cos(a) * r, sin(a) * r]);
    }

    // --- リングをポリゴン輪郭として描画（極めて淡く） ---
    const lineAlpha = map(ri, 0, n - 1, 28, 7);
    stroke(255, lineAlpha);
    strokeWeight(0.5);
    noFill();
    beginShape();
    pts.forEach(([x, y]) => vertex(x, y));
    endShape(CLOSE);

    // --- 各点をドットとして描画 ---
    noStroke();
    const baseAlpha = map(ri, 0, n - 1, 210, 55);
    const dotBase   = map(ri, 0, n - 1, 4.8, 1.4);

    pts.forEach(([x, y], i) => {
      const seed = ri * 300 + i;

      // 輝度のゆらぎ
      const alphaNoise = (noise(seed + 500, t * 0.0040) - 0.5) * 55;
      // サイズのゆらぎ
      const sizaNoise  = (noise(seed + 1500, t * 0.0050) - 0.5) * 1.5;

      fill(255, constrain(baseAlpha + alphaNoise, 8, 255));
      circle(x, y, max(0.5, dotBase + sizaNoise));
    });
  });

  // ------------------------------------------------------------------
  // 中心から外縁へのスポーク（秩序の軸線・極めて淡い）
  // ------------------------------------------------------------------
  const spokeCount = 6;
  const outerR     = RING_DEFS[n - 1][1] * minDim * breathFactor;
  stroke(255, 8);
  strokeWeight(0.4);
  for (let i = 0; i < spokeCount; i++) {
    const a = (TWO_PI / spokeCount) * i;
    line(0, 0, cos(a) * outerR, sin(a) * outerR);
  }

  // ------------------------------------------------------------------
  // 中心のグロウ
  // ------------------------------------------------------------------
  noStroke();
  const glowR = (0.016 + masterBreath * 0.004) * minDim;
  for (let layer = 5; layer > 0; layer--) {
    fill(255, layer * 5);
    circle(0, 0, glowR * 2 * (layer / 5));
  }

  // 中心ドット
  const centerPulse = 3.5 + sin(breathPhase * 1.6) * 0.9;
  fill(255, 200 + sin(breathPhase * 1.1) * 35);
  circle(0, 0, centerPulse);

  t++;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
