document.addEventListener('DOMContentLoaded', () => {
    const tocElement = document.querySelector('.patoc-toc');
    const tocList = document.querySelector('.patoc-list');
    const contentArea = document.querySelector('.entry-content'); 

    // Exit early if required elements don't exist
    if (!tocElement || !tocList || !contentArea) {
        return;
    }

    // Read settings from the data attribute
    const settings = JSON.parse(tocElement.dataset.headings || '{}');
    const enableIndentation = tocElement.dataset.indent === 'true';
    
    const includedHeadings = Object.keys(settings).filter(level => settings[level]);

    // If no headings are selected in the settings, hide TOC
    if (includedHeadings.length === 0) {
        tocElement.style.display = 'none';
        return;
    }

    // Dynamically create the selector string (e.g., "h2, h3")
    const selector = includedHeadings.join(', ');
    const headings = contentArea.querySelectorAll(selector);

    // If no headings found in content, hide TOC
    if (headings.length === 0) {
        tocElement.style.display = 'none';
        return;
    }

    // Build the TOC links with hierarchy support
    const fragment = document.createDocumentFragment();
    const usedIds = new Set(); // Track used IDs to avoid duplicates

    headings.forEach((heading, index) => {
        let id = heading.getAttribute('id');
        
        // Generate semantic ID if heading doesn't have one
        if (!id) {
            const text = heading.textContent;
            let generatedId = text
                .toLowerCase()
                .trim()
                .replace(/[^\w\s-]/g, '')  // Remove special characters
                .replace(/\s+/g, '-')       // Replace spaces with hyphens
                .replace(/-+/g, '-')        // Replace multiple hyphens with single
                .replace(/^-+|-+$/g, '');   // Remove leading/trailing hyphens
            
            // Ensure uniqueness by adding number if needed
            let uniqueId = generatedId || `heading-${index}`;
            let counter = 1;
            while (usedIds.has(uniqueId)) {
                uniqueId = `${generatedId}-${counter}`;
                counter++;
            }
            
            id = uniqueId;
            usedIds.add(id);
            heading.setAttribute('id', id);
        } else {
            usedIds.add(id);
        }
        
        const text = heading.textContent;
        const headingLevel = heading.tagName.toLowerCase();
        const listItem = document.createElement('li');
        const link = document.createElement('a');
        
        // Add data attribute for hierarchy styling
        if (enableIndentation) {
            listItem.setAttribute('data-level', headingLevel);
        }
        
        link.setAttribute('href', `#${id}`);
        link.textContent = text;
        
        // Add click handler for smooth scrolling
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetElement = document.getElementById(id);
            if (targetElement) {
                targetElement.scrollIntoView({ 
                    behavior: 'smooth',
                    block: 'start'
                });
                // Update URL without triggering scroll
                if (history.pushState) {
                    history.pushState(null, null, `#${id}`);
                } else {
                    location.hash = `#${id}`;
                }
            }
        });
        
        listItem.appendChild(link);
        fragment.appendChild(listItem);
    });
    
    tocList.appendChild(fragment);

    // Create and add the progress dot
    const progressDot = document.createElement('div');
    progressDot.className = 'patoc-progress-dot';
    tocList.appendChild(progressDot);

    // Get the updated list of TOC links after they've been added
    const tocLinks = tocElement.querySelectorAll('a');
    if (tocLinks.length === 0) return;

    // Function to update progress bar and dot position
    function updateProgressBar(activeLink) {
        if (!activeLink) return;
        
        // Calculate the position relative to the TOC list
        const listRect = tocList.getBoundingClientRect();
        const linkRect = activeLink.getBoundingClientRect();
        
        // Calculate the center point of the active link relative to the list
        const linkCenter = (linkRect.top - listRect.top) + (linkRect.height / 2);
        
        // Set the CSS custom property for progress bar height
        tocList.style.setProperty('--progress-bar-height', `${linkCenter}px`);
        
        // Update the dot position
        const progressDot = tocList.querySelector('.patoc-progress-dot');
        if (progressDot) {
            progressDot.style.transform = `translateY(${linkCenter - 4}px)`;
        }
    }

    // Initialize the first link as active and set initial progress bar
    tocLinks[0].classList.add('active');
    
    // Small delay to ensure layout is complete before calculating positions
    setTimeout(() => {
        updateProgressBar(tocLinks[0]);
    }, 100);

    // Set up intersection observer for scroll tracking
    const observerOptions = { 
        root: null, 
        rootMargin: '0px 0px -60% 0px', 
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        // Find the most visible entry
        let mostVisibleEntry = null;
        let maxRatio = 0;

        entries.forEach(entry => {
            if (entry.isIntersecting && entry.intersectionRatio > maxRatio) {
                maxRatio = entry.intersectionRatio;
                mostVisibleEntry = entry;
            }
        });

        // Update active link and progress bar
        if (mostVisibleEntry) {
            const id = mostVisibleEntry.target.getAttribute('id');
            const activeLink = tocElement.querySelector(`a[href="#${id}"]`);
            
            if (activeLink) {
                // Remove active class from all links
                tocLinks.forEach(link => link.classList.remove('active'));
                
                // Add active class to current link
                activeLink.classList.add('active');
                
                // Update progress bar position
                updateProgressBar(activeLink);
            }
        }
    }, observerOptions);

    // Observe all headings
    headings.forEach(heading => {
        observer.observe(heading);
    });

    // Handle initial hash in URL
    const initialHash = window.location.hash;
    if (initialHash) {
        const targetElement = document.querySelector(initialHash);
        if (targetElement) {
            // Small delay to ensure page is fully loaded
            setTimeout(() => {
                const targetLink = tocElement.querySelector(`a[href="${initialHash}"]`);
                if (targetLink) {
                    tocLinks.forEach(link => link.classList.remove('active'));
                    targetLink.classList.add('active');
                    updateProgressBar(targetLink);
                }
            }, 200);
        }
    }

    // Handle window resize to recalculate progress bar positions
    window.addEventListener('resize', () => {
        const activeLink = tocElement.querySelector('a.active');
        if (activeLink) {
            updateProgressBar(activeLink);
        }
    });
});
