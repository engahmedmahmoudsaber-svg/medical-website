const WHATSAPP = "https://wa.me/201234567890";

function initMobileMenu() {
  const toggle = document.getElementById("menu-toggle");
  const menu = document.getElementById("mobile-menu");
  if (!toggle || !menu) return;

  toggle.addEventListener("click", () => {
    const open = menu.classList.toggle("hidden") === false;
    toggle.setAttribute("aria-expanded", String(open));
  });

  menu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      menu.classList.add("hidden");
      toggle.setAttribute("aria-expanded", "false");
    });
  });
}

function initHeaderScroll() {
  const header = document.querySelector("header");
  if (!header) return;

  window.addEventListener("scroll", () => {
    header.classList.toggle("shadow-lg", window.scrollY > 50);
  });
}

function initBookingButtons() {
  document.querySelectorAll("[data-book]").forEach((el) => {
    el.addEventListener("click", () => {
      window.location.href = "contact.html";
    });
  });

  document.querySelectorAll("[data-whatsapp]").forEach((el) => {
    el.addEventListener("click", () => {
      window.open(WHATSAPP, "_blank", "noopener");
    });
  });
}

function initContactForm() {
  const form = document.getElementById("appointment-form");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = form.querySelector('[name="name"]')?.value || "";
    const phone = form.querySelector('[name="phone"]')?.value || "";
    const service = form.querySelector('[name="service"]')?.value || "";
    const message = form.querySelector('[name="message"]')?.value || "";
    const text = encodeURIComponent(
      `مرحباً، أود حجز موعد.\nالاسم: ${name}\nالهاتف: ${phone}\nالخدمة: ${service}\n${message ? `ملاحظات: ${message}` : ""}`
    );
    window.open(`${WHATSAPP}?text=${text}`, "_blank", "noopener");
  });

  const serviceButtons = form.querySelectorAll("[data-service-btn]");
  const serviceInput = form.querySelector('[name="service"]');
  serviceButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      serviceButtons.forEach((b) => {
        b.classList.remove("bg-surface-container-low", "border-primary", "text-primary");
        b.classList.add("border-[#DFF4FF]", "text-on-surface-variant");
      });
      btn.classList.add("bg-surface-container-low", "border-primary", "text-primary");
      btn.classList.remove("border-[#DFF4FF]", "text-on-surface-variant");
      if (serviceInput) serviceInput.value = btn.dataset.serviceBtn || "";
    });
  });
}

function initScrollReveal() {
  const sections = document.querySelectorAll("[data-reveal]");
  if (!sections.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("opacity-100", "translate-y-0");
          entry.target.classList.remove("opacity-0", "translate-y-10");
        }
      });
    },
    { threshold: 0.1 }
  );

  sections.forEach((section) => observer.observe(section));
}

document.addEventListener("DOMContentLoaded", () => {
  initMobileMenu();
  initHeaderScroll();
  initBookingButtons();
  initContactForm();
  initScrollReveal();
});
