// Interactions va hover effects

const avatar = document.querySelector('.avatar-wrapper');
if (avatar && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
  document.addEventListener('mousemove', (e) => {
    const rect = avatar.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const angleX = (e.clientY - centerY) / 40;
    const angleY = (e.clientX - centerX) / 40;

    avatar.style.transform = `perspective(1000px) rotateX(${angleX}deg) rotateY(${angleY}deg)`;
  });

  document.addEventListener('mouseleave', () => {
    avatar.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
  });
}

// Counter animation
function animateCounter(element, target, suffix, duration = 2000) {
  let current = 0;
  const increment = target / (duration / 16);

  const counter = setInterval(() => {
    current += increment;
    if (current >= target) {
      current = target;
      clearInterval(counter);
    }

    if (suffix) {
      element.innerHTML = Math.floor(current) + suffix;
    } else {
      element.textContent = Math.floor(current);
    }
  }, 16);
}

const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const element = entry.target;
      const suffixElement = element.querySelector('span');
      const suffix = suffixElement ? suffixElement.outerHTML : '';
      const number = parseInt(element.textContent.replace(/\D/g, ''), 10);

      if (number && !element.textContent.includes('/')) {
        animateCounter(element, number, suffix);
        counterObserver.unobserve(element);
      }
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('.stat h3, .achievement-card h3').forEach(el => {
  counterObserver.observe(el);
});
