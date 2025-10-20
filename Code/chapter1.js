// ====== HAMBURGER TOGGLE ======
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('nav-menu');
hamburger.addEventListener('click', () => {
  navMenu.classList.toggle('active');
});

// ====== SLIDER ======
const slider = document.getElementById('scrollWrapper');
const btnLeft = document.getElementById('scrollLeft');
const btnRight = document.getElementById('scrollRight');
const pageWidth = window.innerWidth;

// Arrow buttons scrolling
btnLeft.addEventListener('click', () => {
  slider.scrollBy({ left: -pageWidth, behavior: 'smooth' });
});
btnRight.addEventListener('click', () => {
  slider.scrollBy({ left: pageWidth, behavior: 'smooth' });
});

// Mouse‑drag support
let isDown = false;
let startX = 0;
let scrollLeft = 0;

slider.addEventListener('mousedown', e => {
  isDown = true;
  startX = e.pageX - slider.offsetLeft;
  scrollLeft = slider.scrollLeft;
  slider.style.cursor = 'grabbing';
});
slider.addEventListener('mouseleave', () => {
  isDown = false;
  slider.style.cursor = 'grab';
});
slider.addEventListener('mouseup', () => {
  isDown = false;
  slider.style.cursor = 'grab';
});
slider.addEventListener('mousemove', e => {
  if (!isDown) return;
  e.preventDefault();
  const x = e.pageX - slider.offsetLeft;
  const walk = (x - startX) * 1.5;
  slider.scrollLeft = scrollLeft - walk;
});

// Touch‑drag support (for finer control)
slider.addEventListener('touchstart', e => {
  startX = e.touches[0].pageX - slider.offsetLeft;
  scrollLeft = slider.scrollLeft;
});
slider.addEventListener('touchmove', e => {
  const x = e.touches[0].pageX - slider.offsetLeft;
  const walk = (x - startX) * 1.5;
  slider.scrollLeft = scrollLeft - walk;
});
