// Premium AI Energy Core Loader - No text, no percentage

const loaderElement = document.getElementById('loader');
let loadProgress = 0;
const animationDuration = 1800;
const startTime = Date.now();

function animateLoader() {
  const elapsed = Date.now() - startTime;
  const progress = Math.min((elapsed / animationDuration) * 100, 100);
  
  if (progress < 100) {
    requestAnimationFrame(animateLoader);
  } else {
    fadeOutLoader();
  }
}

function fadeOutLoader() {
  loaderElement.style.opacity = '0';
  loaderElement.style.pointerEvents = 'none';
  setTimeout(() => {
    loaderElement.style.display = 'none';
  }, 500);
}

// Start animation
if (loaderElement) {
  animateLoader();
  
  // Ensure loader hides after 2.5 seconds
  setTimeout(() => {
    if (loaderElement && loaderElement.style.opacity !== '0') {
      fadeOutLoader();
    }
  }, 2500);
}
