const track = document.querySelector("#pack-track");
const controls = document.querySelector(".pack-controls");

function updateControls() {
  controls.hidden = track.scrollWidth - track.clientWidth <= 1;
}

function movePacks(direction) {
  const end = track.scrollWidth - track.clientWidth;
  if (end <= 1) return;

  const current = track.scrollLeft;
  const [first, second] = track.children;
  const step = second.getBoundingClientRect().left - first.getBoundingClientRect().left;
  let destination = current + step * direction;

  if (direction < 0 && current <= 1) destination = end;
  if (direction > 0 && current >= end - 1) destination = 0;

  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  track.scrollTo({ left: destination, behavior: reduceMotion ? "instant" : "smooth" });
}

for (const button of controls.querySelectorAll("button")) {
  button.addEventListener("click", () => {
    movePacks(Number(button.dataset.packDirection));
  });
}

track.addEventListener("keydown", event => {
  if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
  if (controls.hidden) return;

  event.preventDefault();
  movePacks(event.key === "ArrowLeft" ? -1 : 1);
});

new ResizeObserver(updateControls).observe(track);
updateControls();
