const menuButton = document.querySelector(".menu-toggle");
const nav = document.querySelector(".main-nav");

if (menuButton && nav) {
  menuButton.addEventListener("click", () => {
    const open = nav.classList.toggle("is-open");
    menuButton.setAttribute("aria-expanded", String(open));
  });
}

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 }
);

document.querySelectorAll(".card, .timeline article, .split, .feature-grid").forEach((item) => {
  item.style.opacity = "0";
  item.style.transform = "translateY(14px)";
  item.style.transition = "opacity .45s ease, transform .45s ease";
  observer.observe(item);
});

const style = document.createElement("style");
style.textContent = `.is-visible{opacity:1!important;transform:none!important}`;
document.head.appendChild(style);
