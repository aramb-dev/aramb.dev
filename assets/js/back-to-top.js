/**
 * Back to Top Button JavaScript
 * 
 * This script creates and controls a "Back to Top" button
 * that appears when the user scrolls down the page.
 */

document.addEventListener('DOMContentLoaded', function () {
    // Create the back to top button element
    const backToTopButton = document.createElement('a');
    backToTopButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m18 15-6-6-6 6"/></svg>';
    backToTopButton.className = 'back-to-top';
    backToTopButton.href = '#';
    backToTopButton.setAttribute('aria-label', 'Back to top');
    backToTopButton.setAttribute('title', 'Back to top');

    // Add the button to the document
    document.body.appendChild(backToTopButton);

    // Add click event listener
    backToTopButton.addEventListener('click', function (e) {
        e.preventDefault();

        // If native smooth scrolling is supported (modern browsers)
        if (CSS.supports('scroll-behavior', 'smooth')) {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        } else {
            // Fallback for browsers that don't support smooth scrolling
            const scrollToTop = function () {
                const currentPosition = window.pageYOffset;
                if (currentPosition > 0) {
                    window.requestAnimationFrame(scrollToTop);
                    window.scrollTo(0, currentPosition - currentPosition / 8);
                }
            };
            scrollToTop();
        }
    });

    // Show or hide the button based on scroll position
    const toggleBackToTopButton = function () {
        if (window.pageYOffset > 300) {
            backToTopButton.classList.add('show');
        } else {
            backToTopButton.classList.remove('show');
        }
    };

    // Add scroll event listener
    window.addEventListener('scroll', toggleBackToTopButton);

    // Initial check to see if the button should be visible
    toggleBackToTopButton();
}); 