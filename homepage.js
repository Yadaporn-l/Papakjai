// script.js
// Minimal JS for the public (not-logged-in) home page

// Toggle the mobile menu (hamburger)
function setupHamburger() {
  const ham = document.querySelector('.hamburger');
  const menu = document.querySelector('.menu');
  if (!ham || !menu) return;

  ham.addEventListener('click', () => {
    const open = menu.style.display === 'flex';
    menu.style.display = open ? 'none' : 'flex';

    // Lightweight popover style for the dropdown menu on small screens
    if (!open) {
      menu.style.position = 'absolute';
      menu.style.top = '60px';
      menu.style.right = '4%';
      menu.style.flexDirection = 'column';
      menu.style.gap = '10px';
      menu.style.padding = '12px';
      menu.style.background = '#0b1118';
      menu.style.border = '1px solid #1f2834';
      menu.style.borderRadius = '12px';
      menu.style.boxShadow = '0 10px 25px rgba(0,0,0,.35)';
      menu.querySelectorAll('a').forEach(a => (a.style.whiteSpace = 'nowrap'));
    }
  });

  // Close the dropdown if user clicks outside
  document.addEventListener('click', (e) => {
    const open = menu.style.display === 'flex';
    if (!open) return;
    const within = menu.contains(e.target) || ham.contains(e.target);
    if (!within) menu.style.display = 'none';
  });
}

// Optional: smooth-scroll for on-page anchor links
function setupSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (id.length > 1) {
        const el = document.querySelector(id);
        if (el) {
          e.preventDefault();
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  setupHamburger();
  setupSmoothScroll();
});
