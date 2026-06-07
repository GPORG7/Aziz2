// Premium loader with progress animation

const loaderElement = document.getElementById('loader');
const progressFill = document.querySelector('.progress-fill');
const progressText = document.querySelector('.progress-text');
const animationDuration = 1800;
const startTime = Date.now();

function updateProgress(progress) {
  const percent = Math.floor(progress);

  if (progressFill) {
    progressFill.style.width = percent + '%';
  }

  if (progressText) {
    progressText.textContent = percent + '%';
  }
}

function animateLoader() {
  const elapsed = Date.now() - startTime;
  const progress = Math.min((elapsed / animationDuration) * 100, 100);

  updateProgress(progress);

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
