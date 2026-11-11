const track = document.querySelector("#pack-track");
const controls = document.querySelector(".pack-controls");
const dial = controls.querySelector(".pack-dial");
const cards = [...track.children];
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)");
const wideWheel = matchMedia("(min-width: 1100px)");
const pixelsPerDialStep = 34;
let anglePerCard;
let position = 0;
let target = 0;
let radius;
let animation;
let cardDrag;
let dialDrag;
let dialOffset = 0;

// Recycle faces at the far edges of the visible arc.
function drawWheel() {
  const half = cards.length / 2;
  cards.forEach((card, index) => {
    const offset = ((index - position + half) % cards.length + cards.length) % cards.length - half;
    const angle = offset * anglePerCard;
    card.style.setProperty("--card-angle", `${angle}deg`);
    card.style.setProperty("--card-light", 1 - Math.abs(angle) / 240);
    card.style.zIndex = String(Math.round(90 - Math.abs(angle)));
  });
}

function resizeWheel() {
  const visibleArc = wideWheel.matches ? 135 : 180;
  anglePerCard = visibleArc / cards.length;
  const pitch = cards[0].offsetWidth + 20;
  radius = pitch / (2 * Math.tan(anglePerCard * Math.PI / 360));
  track.style.setProperty("--wheel-radius", `${radius}px`);
  drawWheel();
}

function turnTo(destination) {
  cancelAnimationFrame(animation);
  target = destination;
  if (reduceMotion.matches || position === target) {
    position = target;
    drawWheel();
    return;
  }

  const start = position;
  const startedAt = performance.now();
  function frame(now) {
    const progress = Math.min(1, (now - startedAt) / 320);
    position = start + (destination - start) * (1 - (1 - progress) ** 3);
    drawWheel();
    if (progress < 1) animation = requestAnimationFrame(frame);
  }
  animation = requestAnimationFrame(frame);
}

function step(direction) {
  turnTo(Math.round(target) + direction);
}

for (const button of controls.querySelectorAll("[data-pack-direction]")) {
  button.addEventListener("click", () => step(Number(button.dataset.packDirection)));
}

function handleArrowKey(event) {
  if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
  event.preventDefault();
  step(event.key === "ArrowLeft" ? -1 : 1);
}

dial.addEventListener("pointerdown", event => {
  if (!event.isPrimary || event.button !== 0) return;
  cancelAnimationFrame(animation);
  dialDrag = { startX: event.clientX, startPosition: position, startOffset: dialOffset, moved: false };
  dial.setPointerCapture(event.pointerId);
});

dial.addEventListener("pointermove", event => {
  if (!dialDrag || !dial.hasPointerCapture(event.pointerId)) return;
  const distance = event.clientX - dialDrag.startX;
  if (Math.abs(distance) < 4 && !dialDrag.moved) return;
  dialDrag.moved = true;
  position = dialDrag.startPosition + distance / pixelsPerDialStep;
  dialOffset = (dialDrag.startOffset + distance) % 5;
  dial.style.setProperty("--dial-offset", `${dialOffset}px`);
  drawWheel();
});

dial.addEventListener("lostpointercapture", () => {
  turnTo(Math.round(position));
});

dial.addEventListener("click", event => {
  if (event.detail === 0 || !dialDrag?.moved) step(1);
});
dial.addEventListener("keydown", handleArrowKey);

track.addEventListener("pointerdown", event => {
  if (!event.isPrimary || event.button !== 0 || event.target.closest("a, button, input")) return;
  cancelAnimationFrame(animation);
  cardDrag = { startX: event.clientX, startPosition: position };
  track.setPointerCapture(event.pointerId);
});

track.addEventListener("dragstart", event => event.preventDefault());

track.addEventListener("pointermove", event => {
  if (!cardDrag || !track.hasPointerCapture(event.pointerId)) return;
  const distance = cardDrag.startX - event.clientX;
  if (Math.abs(distance) < 5 && !track.classList.contains("is-dragging")) return;
  track.classList.add("is-dragging");
  const pixelsPerCard = radius * anglePerCard * Math.PI / 180;
  position = cardDrag.startPosition + distance / pixelsPerCard;
  drawWheel();
});

track.addEventListener("lostpointercapture", () => {
  cardDrag = undefined;
  track.classList.remove("is-dragging");
  turnTo(Math.round(position));
});

track.addEventListener("keydown", handleArrowKey);

track.classList.add("is-wheel");
resizeWheel();
controls.hidden = false;
new ResizeObserver(resizeWheel).observe(track);
