/* Basic carousel controls + a tiny responsive helper */

function setupCarousels() {
  document.querySelectorAll('.carousel').forEach(carousel => {
    const track = carousel.querySelector('.track');
    const prev = carousel.querySelector('.prev');
    const next = carousel.querySelector('.next');

    // Scroll amount equals roughly one card width * visible cards
    const visible = parseInt(carousel.dataset.cards || '3', 10);
    const scrollAmount = () => {
      const firstCard = track.children[0];
      if (!firstCard) return 300;
      const style = getComputedStyle(track);
      const gap = parseInt(style.columnGap || style.gap || '14', 10);
      return firstCard.getBoundingClientRect().width * Math.max(1, Math.min(visible, 3)) + gap * (Math.max(1, Math.min(visible, 3)) - 1);
    };

    prev.addEventListener('click', () => {
      track.scrollBy({ left: -scrollAmount(), behavior: 'smooth' });
    });
    next.addEventListener('click', () => {
      track.scrollBy({ left:  scrollAmount(), behavior: 'smooth' });
    });
  });
}

function setupHamburger(){
  const ham = document.querySelector('.hamburger');
  const menu = document.querySelector('.menu');
  if(!ham || !menu) return;
  ham.addEventListener('click', () => {
    const open = menu.style.display === 'flex';
    menu.style.display = open ? 'none' : 'flex';
    if(!open){
      menu.style.position='absolute';
      menu.style.top='60px';
      menu.style.right='4%';
      menu.style.flexDirection='column';
      menu.style.gap='10px';
      menu.style.padding='12px';
      menu.style.background='#0b1118';
      menu.style.border='1px solid #1f2834';
      menu.style.borderRadius='12px';
      menu.style.boxShadow='0 10px 25px rgba(0,0,0,.35)';
      menu.querySelectorAll('a').forEach(a => a.style.whiteSpace='nowrap');
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  setupCarousels();
  setupHamburger();
});
