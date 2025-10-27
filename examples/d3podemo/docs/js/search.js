// Search functionality
document.addEventListener('DOMContentLoaded', function() {
  const searchBox = document.getElementById('search-box');
  if (!searchBox) return;

  let searchIndex = [];
  
  // Determine the root path based on current location
  const path = window.location.pathname;
  // Count directory depth from the file location (not including the file itself)
  const pathParts = path.split('/').filter(p => p !== '');
  const fileDepth = pathParts.length - 1; // Subtract 1 for the filename
  const rootPath = fileDepth > 0 ? '../'.repeat(fileDepth) : '';
  
  // Load search index
  fetch(rootPath + 'search.json')
    .then(response => response.json())
    .then(data => {
      searchIndex = data;
    })
    .catch(error => {
      console.log('Search index not available, falling back to simple search');
    });

  searchBox.addEventListener('input', function() {
    const searchTerm = this.value.toLowerCase().trim();
    
    if (searchTerm === '') {
      // Show all items when search is empty
      document.querySelectorAll('#menu .submenu a').forEach(function(link) {
        link.style.display = 'block';
      });
      document.querySelectorAll('#menu .submenu').forEach(function(submenu) {
        submenu.style.display = 'block';
      });
      return;
    }
    
    // Content-based search using search index
    if (searchIndex.length > 0) {
      const matchingUrls = new Set();
      
      searchIndex.forEach(function(item) {
        const searchContent = (item.title + ' ' + item.content).toLowerCase();
        if (searchContent.includes(searchTerm)) {
          matchingUrls.add(item.url);
        }
      });
      
      // Show/hide links based on content matches
      document.querySelectorAll('#menu .submenu a').forEach(function(link) {
        const href = link.getAttribute('href');
        const relativePath = href.replace(/^.*\//, ''); // Get just the filename part
        
        let isMatch = false;
        matchingUrls.forEach(function(url) {
          if (url.includes(relativePath)) {
            isMatch = true;
          }
        });
        
        // Also check link text for simple matches
        if (!isMatch && link.textContent.toLowerCase().includes(searchTerm)) {
          isMatch = true;
        }
        
        link.style.display = isMatch ? 'block' : 'none';
      });
    } else {
      // Fallback to simple name-based search
      document.querySelectorAll('#menu .submenu a').forEach(function(link) {
        const linkText = link.textContent.toLowerCase();
        link.style.display = linkText.includes(searchTerm) ? 'block' : 'none';
      });
    }
    
    // Show/hide entire submenus if no visible links
    document.querySelectorAll('#menu .submenu').forEach(function(submenu) {
      const visibleLinks = submenu.querySelectorAll('a[style*="display: block"]');
      const label = submenu.querySelector('label');
      
      // Don't hide the Home submenu
      if (label && label.textContent.includes('Home')) {
        return;
      }
      
      submenu.style.display = visibleLinks.length > 0 ? 'block' : 'none';
    });
  });
});
