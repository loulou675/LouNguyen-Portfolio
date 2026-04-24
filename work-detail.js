const detailTitle = document.getElementById("workDetailTitle");
const detailDescription = document.getElementById("workDetailDescription");
const detailMedia = document.getElementById("workDetailMedia");
const detailRoot = document.getElementById("workDetail");
const prevLink = document.getElementById("workPrev");
const nextLink = document.getElementById("workNext");

const orderedIds = [
  "induction-day",
  "tet-for-tots",
  "cau-sung-vua-du-xai",
  "hidden",
  "the-boy-who-burned-the-night",
  "nhat-dung",
  "tu-phu",
  "rong-cuon-ho-ngoi",
  "library",
  "dragon-anim",
  "cooking-app",
  "porsche"
];

const searchParams = new URLSearchParams(window.location.search);
const workId = searchParams.get("id");
const workEntry = window.workEntries?.[workId];

function setArrowLinks() {
  const currentIndex = orderedIds.indexOf(workId);
  const prevId = currentIndex > 0 ? orderedIds[currentIndex - 1] : null;
  const nextId = currentIndex < orderedIds.length - 1 ? orderedIds[currentIndex + 1] : null;

  if (prevLink) {
    if (prevId) {
      prevLink.href = `work-detail.html?id=${prevId}`;
      prevLink.style.display = "";
    } else {
      prevLink.style.display = "none";
    }
  }

  if (nextLink) {
    if (nextId) {
      nextLink.href = `work-detail.html?id=${nextId}`;
      nextLink.style.display = "";
    } else {
      nextLink.style.display = "none";
    }
  }
}

function renderVideo(entry) {
  const video = document.createElement("video");
  video.className = "work-detail__video";
  video.src = entry.media;
  video.autoplay = true;
  video.loop = true;
  video.muted = true;
  video.playsInline = true;
  video.preload = "auto";
  video.setAttribute("autoplay", "");
  video.setAttribute("loop", "");
  video.setAttribute("muted", "");
  video.setAttribute("playsinline", "");
  video.setAttribute("aria-label", entry.title);

  video.addEventListener("error", () => {
    video.remove();
    detailRoot.classList.add("is-missing");
    detailDescription.textContent =
      "This video could not be loaded. Check the file path or extension in work-data.js.";
  });

  detailMedia.appendChild(video);
}

function renderImages(entry) {
  const images = Array.isArray(entry.image) ? entry.image : [entry.image];

  if (entry.type === "grid-3rows") {
    detailMedia.classList.add("work-detail__media--grid-3rows");
  }

  images.forEach((src, index) => {
    const img = document.createElement("img");
    img.src = src;
    img.alt = `${entry.title} ${index + 1}`;
    img.className = "work-detail__image";
    detailMedia.appendChild(img);
  });
}

if (detailTitle && detailDescription && detailMedia && detailRoot) {
  if (!workEntry) {
    document.title = "Work Not Found";
    detailTitle.textContent = "Work Not Found";
    detailDescription.textContent =
      "This work link is missing or the id is incorrect.";
    detailMedia.remove();
    detailRoot.classList.add("is-missing");

    if (prevLink) prevLink.style.display = "none";
    if (nextLink) nextLink.style.display = "none";
  } else {
    document.title = `${workEntry.title} — Portfolio`;
    detailTitle.textContent = workEntry.title;
    detailDescription.textContent = workEntry.description;

    detailMedia.innerHTML = "";
    detailMedia.classList.remove("work-detail__media--grid-3rows");
    detailMedia.classList.remove("work-detail__media--porsche");
    detailMedia.classList.remove("work-detail__media--hidden");
    detailRoot.classList.remove("is-missing");

    if (workEntry.type === "video") {
      renderVideo(workEntry);
    } else {
      renderImages(workEntry);
    }

    if (workId === "porsche") {
        detailMedia.classList.add("work-detail__media--porsche");
      }

    if (workId === "hidden") {
      detailMedia.classList.add("work-detail__media--hidden");
    }


    setArrowLinks();
  }
}
