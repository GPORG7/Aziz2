// Header scroll effect va mobile menu

const header = document.querySelector('.header');
const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
const navbar = document.querySelector('.navbar');

// Header scroll effect
window.addEventListener('scroll', () => {
  if (window.scrollY > 50) {
    header?.classList.add('scrolled');
  } else {
    header?.classList.remove('scrolled');
  }
});

// Mobile menu toggle
mobileMenuBtn?.addEventListener('click', () => {
  navbar?.classList.toggle('mobile-active');
  
  const spans = mobileMenuBtn.querySelectorAll('span');
  spans.forEach((span, index) => {
    if (navbar.classList.contains('mobile-active')) {
      if (index === 0) {
        span.style.transform = 'rotate(45deg) translateY(10px)';
      } else if (index === 1) {
        span.style.opacity = '0';
      } else {
        span.style.transform = 'rotate(-45deg) translateY(-10px)';
      }
    } else {
      span.style.transform = 'none';
      span.style.opacity = '1';
    }
  });
});

// Close mobile menu when link clicked
document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', () => {
    navbar?.classList.remove('mobile-active');
    const spans = mobileMenuBtn?.querySelectorAll('span');
    spans?.forEach(span => {
      span.style.transform = 'none';
      span.style.opacity = '1';
    });
  });
});
