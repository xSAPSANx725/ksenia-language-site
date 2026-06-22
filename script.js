const header = document.querySelector(".header");
const burger = document.getElementById("burger");
const nav = document.getElementById("nav");
const leadForm = document.getElementById("leadForm");
const formNote = document.getElementById("formNote");
const directionSelect = document.getElementById("direction");
const submitButton = leadForm.querySelector('button[type="submit"]');
const defaultButtonText = submitButton.innerHTML;

function closeMenu() {
  nav.classList.remove("active");
  burger.classList.remove("active");
  burger.setAttribute("aria-expanded", "false");
  burger.setAttribute("aria-label", "Открыть меню");
  document.body.classList.remove("menu-open");
}

burger.addEventListener("click", () => {
  const isOpen = nav.classList.toggle("active");
  burger.classList.toggle("active", isOpen);
  burger.setAttribute("aria-expanded", String(isOpen));
  burger.setAttribute("aria-label", isOpen ? "Закрыть меню" : "Открыть меню");
  document.body.classList.toggle("menu-open", isOpen);
});

document.querySelectorAll(".nav a").forEach((link) => {
  link.addEventListener("click", closeMenu);
});

window.addEventListener("resize", () => {
  if (window.innerWidth > 920) closeMenu();
});

function updateHeader() {
  header.classList.toggle("scrolled", window.scrollY > 20);
}

window.addEventListener("scroll", updateHeader, { passive: true });
updateHeader();

const revealElements = document.querySelectorAll(".reveal");

if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("active");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.08 }
  );

  revealElements.forEach((element) => revealObserver.observe(element));
} else {
  revealElements.forEach((element) => element.classList.add("active"));
}

// Кнопки конкретных услуг автоматически выбирают нужный пункт в форме.
document.querySelectorAll("[data-service]").forEach((link) => {
  link.addEventListener("click", () => {
    const requestedService = link.dataset.service;
    const matchingOption = Array.from(directionSelect.options).find(
      (option) => option.textContent === requestedService
    );

    if (matchingOption) {
      directionSelect.value = matchingOption.value;
    }
  });
});

function setFormStatus(message, type = "") {
  formNote.textContent = message;
  formNote.classList.remove("form__note--success", "form__note--error");

  if (type) {
    formNote.classList.add(`form__note--${type}`);
  }
}

function setSubmitting(isSubmitting) {
  submitButton.disabled = isSubmitting;
  submitButton.innerHTML = isSubmitting ? "Отправляю…" : defaultButtonText;
}

leadForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!leadForm.reportValidity()) {
    return;
  }

  const endpoint = leadForm.action;
  const endpointIsConfigured = !endpoint.includes("REPLACE_WITH_FORM_ID");

  if (!endpointIsConfigured) {
    setFormStatus(
      "Онлайн-отправка ещё настраивается. Пока напиши Ксении в Telegram: @languagetutorksu",
      "error"
    );
    return;
  }

  setSubmitting(true);
  setFormStatus("Отправляю заявку…");

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      body: new FormData(leadForm),
      headers: { Accept: "application/json" }
    });

    if (!response.ok) {
      throw new Error("Formspree request failed");
    }

    leadForm.reset();
    setFormStatus("Готово! Заявка отправлена. Ксения скоро ответит.", "success");
  } catch (error) {
    setFormStatus(
      "Не получилось отправить заявку. Попробуй ещё раз или напиши в Telegram: @languagetutorksu",
      "error"
    );
  } finally {
    setSubmitting(false);
  }
});
