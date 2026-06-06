// Interactions va hover effects

const avatar = document.querySelector('.avatar-container');
if (avatar) {
  document.addEventListener('mousemove', (e) => {
    const rect = avatar.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const angleX = (e.clientY - centerY) / 30;
    const angleY = (e.clientX - centerX) / 30;
    
    avatar.style.transform = `perspective(1000px) rotateX(${angleX}deg) rotateY(${angleY}deg)`;
  });
  
  document.addEventListener('mouseleave', () => {
    avatar.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
  });
}

// Counter animation
function animateCounter(element, target, duration = 2000) {
  let current = 0;
  const increment = target / (duration / 16);
  
  const counter = setInterval(() => {
    current += increment;
    if (current >= target) {
      current = target;
      clearInterval(counter);
    }
    element.textContent = Math.floor(current);
  }, 16);
}

const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const text = entry.target.textContent;
      const hasPlus = text.includes('+');
      const hasDivide = text.includes('/');
      
      let number;
      if (hasPlus) {
        number = parseInt(text.replace('+', ''));
      } else if (hasDivide) {
        return;
      } else {
        number = parseInt(text);
      }
      
      if (number) {
        animateCounter(entry.target, number);
        counterObserver.unobserve(entry.target);
      }
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('.stat h3, .achievement-card h3').forEach(el => {
  counterObserver.observe(el);
});
