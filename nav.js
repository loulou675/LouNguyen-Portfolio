const body = document.body;
const siteNav = document.getElementById("siteNav");
const centerText = document.getElementById("centerText");
const desktopItems = siteNav ? siteNav.querySelectorAll("li") : [];
const menuToggle = document.getElementById("menuToggle");
const mobileMenu = document.getElementById("mobileMenu");
const menuBackdrop = document.getElementById("menuBackdrop");
const mobileLinks = mobileMenu ? mobileMenu.querySelectorAll("a") : [];

function openMenu() {
  body.classList.add("menu-open");
  menuToggle?.setAttribute("aria-expanded", "true");
  menuToggle?.setAttribute("aria-label", "Close navigation");
  mobileMenu?.setAttribute("aria-hidden", "false");
  if (menuBackdrop) {
    menuBackdrop.hidden = false;
    menuBackdrop.style.display = "block";
  }
}

function closeMenu() {
  body.classList.remove("menu-open");
  menuToggle?.setAttribute("aria-expanded", "false");
  menuToggle?.setAttribute("aria-label", "Open navigation");
  mobileMenu?.setAttribute("aria-hidden", "true");
  if (menuBackdrop) {
    menuBackdrop.hidden = true;
    menuBackdrop.style.display = "none";
  }
}

menuToggle?.addEventListener("click", () => {
  if (body.classList.contains("menu-open")) {
    closeMenu();
    return;
  }
  openMenu();
});

menuBackdrop?.addEventListener("click", closeMenu);
mobileLinks.forEach((link) => link.addEventListener("click", closeMenu));

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeMenu();
  }
});

desktopItems.forEach((item) => {
  item.addEventListener("mouseenter", () => {
    siteNav.style.setProperty("--bg", item.dataset.color);
    centerText.textContent = item.dataset.label;
    siteNav.classList.add("is-hovered");
  });

  item.addEventListener("mouseleave", () => {
    siteNav.classList.remove("is-hovered");
  });
});

siteNav?.addEventListener("mouseleave", () => {
  siteNav.classList.remove("is-hovered");
});

const pageIdsToColors = {
  HomePage: "var(--color-one)",
  aboutPage: "var(--color-three)",
  worksPage: "var(--color-seven)",
  contactPage: "var(--color-eight)"
};

document.querySelectorAll('a[href]').forEach((link) => {
  link.addEventListener("click", () => {
    const currentPageId = document.body.id;
    const previousColor = pageIdsToColors[currentPageId];
    if (previousColor) {
      sessionStorage.setItem("previousPageColor", previousColor);
    }
  });
});
