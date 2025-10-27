// Theme toggle functionality
document.addEventListener('DOMContentLoaded', function() {
  const themeToggle = document.getElementById('theme-toggle');
  const currentTheme = localStorage.getItem('theme') || 'light';
  
  // Function to update button text
  function updateButtonText(theme) {
    if (themeToggle) {
      themeToggle.textContent = theme === 'dark' ? 'Dark mode off' : 'Dark mode on';
    }
  }
  
  // Apply saved theme
  document.documentElement.setAttribute('data-theme', currentTheme);
  updateButtonText(currentTheme);
  
  if (themeToggle) {
    themeToggle.addEventListener('click', function() {
      const currentTheme = document.documentElement.getAttribute('data-theme');
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      
      document.documentElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('theme', newTheme);
      updateButtonText(newTheme);
    });
  }
});
