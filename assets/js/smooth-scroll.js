/**
 * Smooth Scrolling JavaScript
 * 
 * This script provides smooth scrolling functionality for browsers
 * that don't support the CSS scroll-behavior property.
 * 
 * Include this file on all pages for consistent scrolling behavior.
 */

document.addEventListener('DOMContentLoaded', function () {
    // Get all anchor links that point to IDs on the page
    const anchorLinks = document.querySelectorAll('a[href^="#"]');

    // Add click event listeners to each anchor link
    anchorLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            // Get the target element
            const targetId = this.getAttribute('href');

            // Skip if the link is just "#" or if the browser supports smooth scrolling natively
            if (targetId === '#' || CSS.supports('scroll-behavior', 'smooth')) {
                return;
            }

            const targetElement = document.querySelector(targetId);

            // If the target element exists, scroll to it smoothly
            if (targetElement) {
                e.preventDefault();

                const offsetTop = targetElement.getBoundingClientRect().top + window.pageYOffset - 80;

                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Check for URL hash on page load and scroll to the section
    if (window.location.hash) {
        const targetElement = document.querySelector(window.location.hash);
        if (targetElement) {
            // Delay scroll slightly to ensure page is fully loaded
            setTimeout(() => {
                const offsetTop = targetElement.getBoundingClientRect().top + window.pageYOffset - 80;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }, 100);
        }
    }
}); 