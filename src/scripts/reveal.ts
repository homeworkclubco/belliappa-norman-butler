const reveal = () => {
  const els = document.querySelectorAll<HTMLElement>(
    "[data-reveal]:not([data-reveal-in])"
  );
  if (!els.length) return;
  const io = new IntersectionObserver(
    entries => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          (entry.target as HTMLElement).setAttribute("data-reveal-in", "");
          io.unobserve(entry.target);
        }
      }
    },
    { rootMargin: "0px 0px 0% 0px", threshold: 0.05 }
  );
  els.forEach(el => io.observe(el));
};

reveal();
document.addEventListener("astro:page-load", reveal);
