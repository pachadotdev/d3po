// Font size control functionality
document.addEventListener('DOMContentLoaded', function() {
  const fontIncreaseBtn = document.getElementById('font-increase');
  const fontDecreaseBtn = document.getElementById('font-decrease');
  const contentArea = document.getElementById('content');
  
  // Default font size (in pixels)
  const defaultFontSize = 16;
  const minFontSize = 12;
  const maxFontSize = 24;
  const step = 2;
  
  // Get saved font size from localStorage or use default
  let currentFontSize = parseInt(localStorage.getItem('fontSize')) || defaultFontSize;
  
  // Function to apply font size
  function applyFontSize(size) {
    if (contentArea) {
      contentArea.style.fontSize = size + 'px';
    }
  }
  
  // Function to update button states
  function updateButtonStates() {
    if (fontDecreaseBtn) {
      fontDecreaseBtn.disabled = currentFontSize <= minFontSize;
    }
    if (fontIncreaseBtn) {
      fontIncreaseBtn.disabled = currentFontSize >= maxFontSize;
    }
  }
  
  // Apply saved font size on load
  applyFontSize(currentFontSize);
  updateButtonStates();
  
  // Increase font size
  if (fontIncreaseBtn) {
    fontIncreaseBtn.addEventListener('click', function() {
      if (currentFontSize < maxFontSize) {
        currentFontSize += step;
        applyFontSize(currentFontSize);
        localStorage.setItem('fontSize', currentFontSize);
        updateButtonStates();
      }
    });
  }
  
  // Decrease font size
  if (fontDecreaseBtn) {
    fontDecreaseBtn.addEventListener('click', function() {
      if (currentFontSize > minFontSize) {
        currentFontSize -= step;
        applyFontSize(currentFontSize);
        localStorage.setItem('fontSize', currentFontSize);
        updateButtonStates();
      }
    });
  }
});
