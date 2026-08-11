const COLS = 130;

const MIN_DOT = 9;
const MAX_DOT = 9;
const SIZE_POWER = 1.5;

const MOVE_DISTANCE = 3;
const MOVE_SPEED = 0.1;
const MOVE_VARIATION = 0.04;

const TONE_COUNT = 5;
const DIRECTION = -1;

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

let dots = [];
let baseHue = 0;
let accentHue = 180;

function random(min, max) {
  return Math.random() * (max - min) + min;
}

function mapValue(value, inMin, inMax, outMin, outMax) {
  return outMin +
    (outMax - outMin) *
    ((value - inMin) / (inMax - inMin));
}

function randomizeColors() {
  baseHue = random(0, 360);
  accentHue = (baseHue + random(150, 210)) % 360;
}

function applyColor(dot) {
  if (dot.tone === 4) {
    dot.h = baseHue;
    dot.s = 15;
    dot.l = 99;
  }

  else if (dot.tone === 2) {
    dot.h = accentHue;
    dot.s = 100;
    dot.l = 60;
  }

  else {
    dot.h = baseHue;
    dot.s = mapValue(dot.tone, 0, 3, 100, 88);
    dot.l = mapValue(dot.tone, 0, 3, 32, 68);
  }
}

function buildDots(img) {
  const aspect = img.naturalHeight / img.naturalWidth;

  canvas.width = 800;
  canvas.height = Math.round(800 * aspect);

  const rows = Math.round(COLS * aspect);

  const sampleCanvas = document.createElement("canvas");
  sampleCanvas.width = COLS;
  sampleCanvas.height = rows;

  const sampleCtx = sampleCanvas.getContext(
    "2d",
    { willReadFrequently: true }
  );

  sampleCtx.drawImage(
    img,
    0,
    0,
    COLS,
    rows
  );

  const pixels = sampleCtx.getImageData(
    0,
    0,
    COLS,
    rows
  ).data;

  const cellW = canvas.width / COLS;
  const cellH = canvas.height / rows;

  dots = [];

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < COLS; x++) {
      const i = (x + y * COLS) * 4;

      const r = pixels[i];
      const g = pixels[i + 1];
      const b = pixels[i + 2];

      const brightness = (r + g + b) / 3;
      const normalized = brightness / 255;

      let tone = Math.floor(
        normalized * TONE_COUNT
      );

      tone = Math.max(
        0,
        Math.min(
          TONE_COUNT - 1,
          tone
        )
      );

      const darkness = 1 - normalized;

      const sizeFactor = Math.pow(
        darkness,
        SIZE_POWER
      );

      const size =
        MIN_DOT +
        (MAX_DOT - MIN_DOT) *
        sizeFactor;

      const dot = {
        x: x * cellW + cellW / 2,
        y: y * cellH + cellH / 2,

        size,
        tone,

        h: 0,
        s: 0,
        l: 0,

        speed:
          MOVE_SPEED +
          random(
            -MOVE_VARIATION,
            MOVE_VARIATION
          ),

        offset:
          random(
            -MOVE_DISTANCE,
            0
          )
      };

      applyColor(dot);
      dots.push(dot);
    }
  }
}

function draw() {
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(
    0,
    0,
    canvas.width,
    canvas.height
  );

  for (const dot of dots) {
    dot.offset +=
      dot.speed *
      DIRECTION;

    if (
      DIRECTION === -1 &&
      dot.offset < -MOVE_DISTANCE
    ) {
      dot.offset = 0;
    }

    ctx.beginPath();

    ctx.arc(
      dot.x + dot.offset,
      dot.y,
      dot.size / 2,
      0,
      Math.PI * 2
    );

    ctx.fillStyle =
      `hsl(${dot.h} ${dot.s}% ${dot.l}%)`;

    ctx.fill();
  }

  requestAnimationFrame(draw);
}

document
  .getElementById("change")
  .addEventListener(
    "click",
    () => {
      randomizeColors();

      for (const dot of dots) {
        applyColor(dot);
      }
    }
  );

const img = new Image();

img.onload = () => {
  randomizeColors();
  buildDots(img);
  draw();
};

img.onerror = error => {
  console.error(
    "image.jpg could not be loaded",
    error
  );
};

img.src = "./image.jpg";
