const header = document.querySelector(".header");
const burger = document.getElementById("burger");
const nav = document.getElementById("nav");
const leadForm = document.getElementById("leadForm");
const formNote = document.getElementById("formNote");
const directionSelect = document.getElementById("direction");
const submitButton = leadForm.querySelector('button[type="submit"]');
const defaultButtonText = submitButton.innerHTML;
const assistantUrl = "https://t.me/lsenia_language_assistant_bot?start=site_form";

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
  submitButton.innerHTML = isSubmitting ? "Готовлю заявку…" : defaultButtonText;
}

function getFieldValue(name) {
  return leadForm.elements[name]?.value.trim() || "";
}

function buildLeadMessage() {
  const direction = getFieldValue("direction") || "не выбран";
  const message = getFieldValue("message") || "не указана";

  return [
    "Новая заявка с сайта Ксении",
    "",
    `Имя: ${getFieldValue("name")}`,
    `Формат: ${direction}`,
    `Контакт: ${getFieldValue("contact")}`,
    `Цель: ${message}`
  ].join("\n");
}

async function copyText(text) {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.top = "-9999px";
  document.body.append(textarea);
  textarea.select();
  document.execCommand("copy");
  textarea.remove();
}

leadForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!leadForm.reportValidity()) {
    return;
  }

  const leadMessage = buildLeadMessage();

  setSubmitting(true);
  setFormStatus("Готовлю заявку для Telegram-ассистента…");

  try {
    await copyText(leadMessage);
    setFormStatus("Заявка скопирована. Открываю Telegram-ассистента — вставь текст в чат и отправь.", "success");
    setTimeout(() => {
      window.location.href = assistantUrl;
    }, 600);
  } catch (error) {
    window.prompt("Скопируй заявку и отправь её Telegram-ассистенту:", leadMessage);
    window.location.href = assistantUrl;
  } finally {
    setSubmitting(false);
  }
});
