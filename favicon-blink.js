(() => {
  const icon = document.querySelector('link[rel="icon"]');
  const openEye = icon.href;
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const frame = (outline, pupil) => 'data:image/svg+xml,' + encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
      <rect width="64" height="64" rx="12" fill="#031c1d"/>
      <path d="${outline}" fill="none" stroke="#b8f4dc" stroke-width="4" stroke-linecap="round"/>
      ${pupil}
    </svg>`
  );
  const halfClosed = frame(
    'M10 32Q32 19 54 32Q32 45 10 32Z',
    '<ellipse cx="32" cy="32" rx="8" ry="4" fill="#f17435"/>'
  );
  const closed = frame('M10 31Q32 39 54 31', '');
  const frames = [halfClosed, closed, halfClosed, openEye];
  const frameDelays = [0, 70, 145, 220];
  let nextBlink;
  let pendingFrames = [];

  function blink() {
    pendingFrames = frames.map((url, index) => setTimeout(() => {
      icon.href = url;
    }, frameDelays[index]));
    nextBlink = setTimeout(blink, 9000);
  }

  function reset() {
    clearTimeout(nextBlink);
    pendingFrames.forEach(clearTimeout);
    pendingFrames = [];
    icon.href = openEye;
    if (!document.hidden && !reducedMotion.matches) nextBlink = setTimeout(blink, 1800);
  }

  document.addEventListener('visibilitychange', reset);
  reducedMotion.addEventListener('change', reset);
  reset();
})();
