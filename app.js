const fileInput = document.getElementById("file-input");
const processBtn = document.getElementById("process-btn");
const downloadBtn = document.getElementById("download-btn");
const previewCanvas = document.getElementById("preview-canvas");
const previewCtx = previewCanvas.getContext("2d");

const TARGET_WIDTH = 150;
const TARGET_HEIGHT = 50;

let lastResultDataUrl = null;

function enableProcessButtonIfFileSelected() {
  processBtn.disabled = !fileInput.files || fileInput.files.length === 0;
}

fileInput.addEventListener("change", () => {
  enableProcessButtonIfFileSelected();
  downloadBtn.disabled = true;
  lastResultDataUrl = null;
  // Clear preview
  previewCtx.clearRect(0, 0, TARGET_WIDTH, TARGET_HEIGHT);
});

processBtn.addEventListener("click", async () => {
  if (!fileInput.files || fileInput.files.length === 0) {
    return;
  }
  const file = fileInput.files[0];
  try {
    const dataUrl = await readFileAsDataURL(file);
    const img = await loadImage(dataUrl);
    const result = processImage(img);
    lastResultDataUrl = result;
    downloadBtn.disabled = false;
  } catch (err) {
    console.error(err);
    alert("Sorry, there was a problem processing that image.");
  }
});

downloadBtn.addEventListener("click", () => {
  if (!lastResultDataUrl) return;
  const a = document.createElement("a");
  a.href = lastResultDataUrl;
  a.download = "fixed-logo.png";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
});

function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = (e) => reject(e);
    reader.readAsDataURL(file);
  });
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = src;
  });
}

function processImage(img) {
  const w = img.naturalWidth || img.width;
  const h = img.naturalHeight || img.height;
  if (!w || !h) {
    throw new Error("Image has invalid dimensions.");
  }

  // Offscreen canvas to inspect original pixels
  const offCanvas = document.createElement("canvas");
  offCanvas.width = w;
  offCanvas.height = h;
  const offCtx = offCanvas.getContext("2d");
  offCtx.drawImage(img, 0, 0);

  const bgColor = inferBackgroundColor(offCtx, w, h);

  // Compute scaled size
  const scale = Math.min(TARGET_WIDTH / w, TARGET_HEIGHT / h);
  const newW = Math.max(1, Math.floor(w * scale));
  const newH = Math.max(1, Math.floor(h * scale));

  // Draw final result into preview canvas
  previewCanvas.width = TARGET_WIDTH;
  previewCanvas.height = TARGET_HEIGHT;

  previewCtx.save();
  previewCtx.clearRect(0, 0, TARGET_WIDTH, TARGET_HEIGHT);
  previewCtx.fillStyle = `rgba(${bgColor.r}, ${bgColor.g}, ${bgColor.b}, 1)`;
  previewCtx.fillRect(0, 0, TARGET_WIDTH, TARGET_HEIGHT);

  const offsetX = (TARGET_WIDTH - newW) / 2;
  const offsetY = (TARGET_HEIGHT - newH) / 2;
  previewCtx.drawImage(img, offsetX, offsetY, newW, newH);
  previewCtx.restore();

  return previewCanvas.toDataURL("image/png");
}

function inferBackgroundColor(ctx, width, height) {
  const data = ctx.getImageData(0, 0, width, height).data;

  const border = Math.min(5, Math.floor(Math.min(width, height) / 2));
  const counts = new Map();

  function samplePixel(x, y) {
    const idx = (y * width + x) * 4;
    const r = data[idx];
    const g = data[idx + 1];
    const b = data[idx + 2];
    const a = data[idx + 3];
    // Skip fully transparent pixels to avoid sampling logos with transparent background
    if (a === 0) {
      return;
    }
    const key = `${r},${g},${b}`;
    counts.set(key, (counts.get(key) || 0) + 1);
  }

  // Top and bottom borders
  for (let y = 0; y < border; y++) {
    if (y >= height) break;
    for (let x = 0; x < width; x++) {
      samplePixel(x, y);
    }
  }
  for (let y = height - border; y < height; y++) {
    if (y < 0) continue;
    for (let x = 0; x < width; x++) {
      samplePixel(x, y);
    }
  }

  // Left and right borders
  for (let x = 0; x < border; x++) {
    if (x >= width) break;
    for (let y = 0; y < height; y++) {
      samplePixel(x, y);
    }
  }
  for (let x = width - border; x < width; x++) {
    if (x < 0) continue;
    for (let y = 0; y < height; y++) {
      samplePixel(x, y);
    }
  }

  let bestKey = null;
  let bestCount = -1;
  for (const [key, count] of counts.entries()) {
    if (count > bestCount) {
      bestCount = count;
      bestKey = key;
    }
  }

  if (!bestKey) {
    // Fallback: top-left pixel
    const idx = 0;
    const r = data[idx];
    const g = data[idx + 1];
    const b = data[idx + 2];
    return { r, g, b };
  }

  const [r, g, b] = bestKey.split(",").map((v) => parseInt(v, 10));
  return { r, g, b };
}

