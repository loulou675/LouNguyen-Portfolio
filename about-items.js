const aboutItemMessages = [
  "I care about fashion and keep up with the latest trends.",
  "I been to 32/34 provinces of Vietnam.",
  "I have knowledge about different types of flowers.",
  "I'm a homebody. I prefer staying at home to recharge.",
  "I'm addicted to online shopping.",
  "I spend most of my free time playing video games.",
  "I love cooking.",
  "I want this space to feel like a small archive of how I think, design, and create."
];

const aboutItems = [...document.querySelectorAll(".item")];
const aboutWorld = document.getElementById("world");
const itemOverlay = document.getElementById("itemOverlay");
const itemOverlayBackdrop = document.getElementById("itemOverlayBackdrop");
const itemOverlayVisual = document.getElementById("itemOverlayVisual");
const itemOverlayText = document.getElementById("itemOverlayText");

const overlayClasses = [
  "item-overlay--item-3",
  "item-overlay--item-6",
  "item-overlay--item-7"
];

const DRAG_THRESHOLD = 12;

let pressedItem = null;
let pressStart = null;

function resetOverlayClasses() {
  itemOverlay?.classList.remove(...overlayClasses);
}

function closeItemOverlay() {
  if (!itemOverlay || !itemOverlayVisual || !itemOverlayText) return;

  document.body.classList.remove("about-item-open");
  itemOverlay.classList.remove("is-open");
  itemOverlay.setAttribute("aria-hidden", "true");
  itemOverlayVisual.innerHTML = "";
  itemOverlayVisual.appendChild(itemOverlayText);
  itemOverlayText.textContent = "";
  resetOverlayClasses();
}

function applyItemOverlayClass(index) {
  resetOverlayClasses();

  if (index === 2) {
    itemOverlay.classList.add("item-overlay--item-3");
  }

  if (index === 5) {
    itemOverlay.classList.add("item-overlay--item-6");
  }

  if (index === 6) {
    itemOverlay.classList.add("item-overlay--item-7");
  }
}

function openItemOverlay(item, index) {
  if (!itemOverlay || !itemOverlayVisual || !itemOverlayText) return;

  const visual = item.innerHTML;
  const message = aboutItemMessages[index] || "More about me coming soon.";

  itemOverlayVisual.innerHTML = visual;
  itemOverlayVisual.appendChild(itemOverlayText);
  itemOverlayText.textContent = message;

  applyItemOverlayClass(index);

  itemOverlay.classList.add("is-open");
  itemOverlay.setAttribute("aria-hidden", "false");
  document.body.classList.add("about-item-open");
}

aboutItems.forEach((item, index) => {
  item.dataset.itemIndex = String(index);
  item.setAttribute("role", "button");
  item.setAttribute("tabindex", "0");
  item.setAttribute("aria-label", `Open info ${index + 1}`);

  item.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openItemOverlay(item, index);
    }
  });
});

aboutWorld?.addEventListener("pointerdown", (event) => {
  const item = event.target.closest(".item");
  if (!item) return;

  pressedItem = item;
  pressStart = {
    x: event.clientX,
    y: event.clientY
  };
});

aboutWorld?.addEventListener("pointerup", (event) => {
  const item = event.target.closest(".item");

  if (!item || !pressedItem || item !== pressedItem || !pressStart) {
    pressedItem = null;
    pressStart = null;
    return;
  }

  const dx = event.clientX - pressStart.x;
  const dy = event.clientY - pressStart.y;
  const distance = Math.hypot(dx, dy);

  if (distance <= DRAG_THRESHOLD) {
    const index = Number(item.dataset.itemIndex || 0);
    openItemOverlay(item, index);
  }

  pressedItem = null;
  pressStart = null;
});

aboutWorld?.addEventListener("pointerleave", () => {
  pressedItem = null;
  pressStart = null;
});

itemOverlayBackdrop?.addEventListener("click", closeItemOverlay);

itemOverlay?.addEventListener("click", (event) => {
  if (event.target === itemOverlay) {
    closeItemOverlay();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeItemOverlay();
  }
});
