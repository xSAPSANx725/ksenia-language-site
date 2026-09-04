const header = document.querySelector(".header");
const burger = document.getElementById("burger");
const nav = document.getElementById("nav");
const leadForm = document.getElementById("leadForm");
const formNote = document.getElementById("formNote");
const directionSelect = document.getElementById("direction");
const submitButton = leadForm.querySelector('button[type="submit"]');
const defaultButtonText = submitButton.innerHTML;
const assistantUrl = "https://t.me/lsenia_language_assistant_bot";
const leadEndpoint = "https://ksenia-language-assistant-backend.mossy-fir-8154.chatgpt.site/lead";

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
  submitButton.innerHTML = isSubmitting ? "Отправляю заявку…" : defaultButtonText;
}

leadForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!leadForm.reportValidity()) {
    return;
  }

  setSubmitting(true);

  try {
    const formData = new FormData(leadForm);
    const payload = Object.fromEntries(formData.entries());

    const response = await fetch(leadEndpoint, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error("Lead request failed");
    }

    leadForm.reset();
    setFormStatus("Готово! Заявка отправлена Ксении в Telegram.", "success");
  } catch (error) {
    setFormStatus(
      "Не получилось отправить заявку автоматически. Открой Telegram-ассистента и напиши там.",
      "error"
    );
    window.open(assistantUrl, "_blank", "noopener,noreferrer");
  } finally {
    setSubmitting(false);
  }
});
