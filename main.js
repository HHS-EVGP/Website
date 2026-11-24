document.documentElement.classList.add("js");

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

// Fade sections in as they scroll into view
const revealables = document.querySelectorAll("[data-reveal]");

if (reduceMotion.matches || !("IntersectionObserver" in window)) {
  revealables.forEach((el) => el.classList.add("is-visible"));
} else {
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    }
  }, { rootMargin: "0px 0px -10% 0px" });

  revealables.forEach((el) => observer.observe(el));
}

// Fade the whole page to dark while a [data-theme="dark"] section crosses the
// middle of the screen, then back to light once it has passed
const darkSections = document.querySelectorAll('[data-theme="dark"]');

if (darkSections.length && "IntersectionObserver" in window) {
  const active = new Set();
  const themeObserver = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) active.add(entry.target);
      else active.delete(entry.target);
    }
    document.documentElement.dataset.theme = active.size ? "dark" : "light";
  }, { rootMargin: "-50% 0px -50% 0px" });

  darkSections.forEach((el) => themeObserver.observe(el));
}

// Drive the car across the "What We Do" section as the page scrolls.
// The text is towed behind the car and the photo is uncovered as it passes.
const drive = document.querySelector(".drive");

if (drive && !reduceMotion.matches) {
  const stage = drive.querySelector(".drive-stage");
  const car = drive.querySelector(".drive-car");
  const wheel = drive.querySelector(".drive-wheel");
  const text = drive.querySelector(".drive-text");
  const photo = drive.querySelector(".drive-photo");

  // Wheel radius as a fraction of the car image width
  const WHEEL_RADIUS = 197.5 / 1671;
  // Gap between the back of the car and whatever follows it
  const GAP = 32;
  // Portion of the scroll spent driving; the rest holds the finished layout
  const DRIVE_END = 0.85;

  let layout;
  let ticking = false;

  drive.classList.add("is-driving");

  function measure() {
    const stageBox = stage.getBoundingClientRect();
    const box = (el) => {
      const r = el.getBoundingClientRect();
      return { left: r.left - stageBox.left, right: r.right - stageBox.left };
    };
    const carWidth = car.offsetWidth;
    const textBox = box(text);
    const photoBox = box(photo.firstElementChild);
    const lastRight = Math.max(textBox.right, photoBox.right);

    layout = {
      stickyTop: parseFloat(getComputedStyle(stage).top) || 0,
      carWidth,
      wheelRadius: carWidth * WHEEL_RADIUS,
      // Start with just the nose of the car peeking in
      start: -carWidth * 0.6,
      end: Math.max(stageBox.width, lastRight + GAP) + 10,
      text: textBox,
      photo: photoBox,
    };
  }

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function update() {
    ticking = false;

    // Start rolling while the section is still scrolling into view, so the
    // stage isn't empty when it pins
    const rect = drive.getBoundingClientRect();
    const startTop = window.innerHeight * 0.5;
    const endTop = layout.stickyTop + stage.offsetHeight - drive.offsetHeight;
    const progress = clamp((startTop - rect.top) / (startTop - endTop), 0, 1);
    const t = clamp(progress / DRIVE_END, 0, 1);

    // Ease off the throttle slightly at both ends
    const eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    const x = layout.start + (layout.end - layout.start) * (0.35 * t + 0.65 * eased);
    const rotation = ((x - layout.start) / layout.wheelRadius) * (180 / Math.PI);

    car.style.transform = `translate3d(${x}px, 0, 0)`;
    wheel.style.transform = `rotate(${rotation}deg)`;

    // Rear bumper of the car, minus a little breathing room
    const tail = x - GAP;

    const towed = Math.min(0, tail - layout.text.right);
    for (const child of text.children) {
      child.style.transform = `translate3d(${towed}px, 0, 0)`;
    }

    const photoWidth = layout.photo.right - layout.photo.left;
    const uncovered = clamp(tail - layout.photo.left, 0, photoWidth);
    photo.firstElementChild.style.clipPath =
      `inset(0 ${photoWidth - uncovered}px 0 0 round 1rem)`;
  }

  function requestUpdate() {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  }

  function reset() {
    for (const child of text.children) child.style.transform = "";
    measure();
    update();
  }

  window.addEventListener("scroll", requestUpdate, { passive: true });
  window.addEventListener("resize", reset);
  window.addEventListener("load", reset);
  reset();
}
