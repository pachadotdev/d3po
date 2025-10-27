// Load and display last updated timestamp
document.addEventListener('DOMContentLoaded', function() {
  // Determine the root path based on current location
  const path = window.location.pathname;
  // Count directory depth from the file location (not including the file itself)
  const pathParts = path.split('/').filter(p => p !== '');
  const fileDepth = pathParts.length - 1; // Subtract 1 for the filename
  const rootPath = fileDepth > 0 ? '../'.repeat(fileDepth) : '';
  
  // Load last updated timestamp
  fetch(rootPath + 'last-updated.json')
    .then(response => response.json())
    .then(data => {
      const lastUpdatedElement = document.getElementById('last-updated');
      if (lastUpdatedElement) {
        lastUpdatedElement.textContent = data.last_updated;
      }
    })
    .catch(error => {
      console.log('Last updated timestamp not available');
      const lastUpdatedElement = document.getElementById('last-updated');
      if (lastUpdatedElement) {
        lastUpdatedElement.textContent = '';
      }
    });
});
