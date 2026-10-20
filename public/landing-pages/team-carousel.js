const section = document.querySelector("#team-carousel");

if (section) {
  const stage = section.querySelector("[data-ntc-stage]");
  const ring = section.querySelector("[data-ntc-ring]");
  const status = section.querySelector("[data-ntc-status]");
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

  const loadMembers = async () => {
    const response = await fetch(new URL("./team-carousel-members.json", import.meta.url));
    if (!response.ok) {
      throw new Error(`Could not load team carousel members (${response.status}).`);
    }

    const members = await response.json();
    if (!Array.isArray(members) || members.length < 2) {
      throw new Error("The team carousel needs at least two member entries.");
    }

    members.forEach((member, index) => {
      if (
        !member ||
        typeof member.name !== "string" ||
        typeof member.designation !== "string" ||
        typeof member.photo !== "string"
      ) {
        throw new Error(`Team carousel member ${index + 1} has invalid data.`);
      }
    });

    return members;
  };

  loadMembers()
    .then((members) => {
      let rotation = 0;
      let activeIndex = 0;
      let pointerStart = null;
      let activePointerId = null;
      let startRotation = 0;
      let autoRotateTimer;

      const step = 360 / members.length;
      const cards = members.map((member, index) => {
        const card = document.createElement("article");
        card.className = "ntc-card";
        card.style.setProperty("--ntc-angle", `${index * step}deg`);
        card.setAttribute("role", "group");
        card.setAttribute("aria-roledescription", "slide");

        const face = document.createElement("div");
        face.className = "ntc-card-face";

        const photo = document.createElement("img");
        photo.className = "ntc-photo";
        photo.src = new URL(member.photo, import.meta.url).href;
        photo.alt = `${member.name}, ${member.designation}`;
        photo.loading = "eager";
        photo.decoding = "async";
        photo.draggable = false;

        const copy = document.createElement("div");
        copy.className = "ntc-card-copy";

        const name = document.createElement("h3");
        name.className = "ntc-name";
        name.textContent = member.name;

        const designation = document.createElement("p");
        designation.className = "ntc-designation";
        designation.textContent = member.designation;

        copy.append(name, designation);
        face.append(photo, copy);
        card.append(face);
        ring.append(card);
        return card;
      });

      const updateCarousel = () => {
        ring.style.setProperty("--ntc-rotation", `${rotation}deg`);
        activeIndex = ((Math.round(-rotation / step) % members.length) + members.length) % members.length;
        cards.forEach((card, index) => {
          const isActive = index === activeIndex;
          card.classList.toggle("ntc-active", isActive);
          card.setAttribute("aria-current", String(isActive));
          card.setAttribute("aria-label", `${index + 1} of ${members.length}: ${members[index].name}`);
        });
        status.textContent = `${String(activeIndex + 1).padStart(2, "0")} / ${String(members.length).padStart(2, "0")} · ${members[activeIndex].name}`;
      };

      const rotate = (direction) => {
        rotation -= direction * step;
        updateCarousel();
      };

      const pauseAutoRotation = () => window.clearInterval(autoRotateTimer);
      const resumeAutoRotation = () => {
        pauseAutoRotation();
        if (!reducedMotion && !document.hidden) {
          autoRotateTimer = window.setInterval(() => rotate(1), 4600);
        }
      };

      section.querySelector("[data-ntc-prev]").addEventListener("click", () => {
        rotate(-1);
        resumeAutoRotation();
      });
      section.querySelector("[data-ntc-next]").addEventListener("click", () => {
        rotate(1);
        resumeAutoRotation();
      });

      stage.addEventListener("keydown", (event) => {
        if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
          event.preventDefault();
          rotate(event.key === "ArrowRight" ? 1 : -1);
          resumeAutoRotation();
        }
      });

      stage.addEventListener("pointerenter", pauseAutoRotation);
      stage.addEventListener("pointerleave", () => {
        if (pointerStart === null) resumeAutoRotation();
      });
      stage.addEventListener("focusin", pauseAutoRotation);
      stage.addEventListener("focusout", resumeAutoRotation);
      document.addEventListener("visibilitychange", resumeAutoRotation);

      stage.addEventListener("pointerdown", (event) => {
        if (event.button !== 0) return;
        pointerStart = event.clientX;
        activePointerId = event.pointerId;
        startRotation = rotation;
        stage.classList.add("ntc-dragging");
        pauseAutoRotation();
      });

      window.addEventListener("pointermove", (event) => {
        if (pointerStart === null || event.pointerId !== activePointerId) return;
        rotation = startRotation + (event.clientX - pointerStart) * 0.42;
        updateCarousel();
      });

      const finishDrag = (event) => {
        if (pointerStart === null || event.pointerId !== activePointerId) return;
        pointerStart = null;
        activePointerId = null;
        stage.classList.remove("ntc-dragging");
        rotation = -activeIndex * step;
        updateCarousel();
        resumeAutoRotation();
      };

      window.addEventListener("pointerup", finishDrag);
      window.addEventListener("pointercancel", finishDrag);

      updateCarousel();
      resumeAutoRotation();
    })
    .catch((error) => {
      console.error("[team-carousel] Initialization failed:", error);
      const message = document.createElement("p");
      message.className = "ntc-error";
      message.textContent = "Team members could not be loaded.";
      section.querySelector(".ntc-content").append(message);
    });
}
