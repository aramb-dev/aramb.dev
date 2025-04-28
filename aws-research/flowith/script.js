document.addEventListener('DOMContentLoaded', function () {
  // Initialize Lucide icons - fix the initialization
  if (window.lucide) {
    lucide.createIcons();
  } else {
    // Fallback to load lucide if not loaded properly
    const lucideScript = document.createElement('script');
    lucideScript.src = 'https://unpkg.com/lucide@latest';
    lucideScript.onload = function () {
      if (window.lucide) {
        lucide.createIcons();
      } else {
        console.error('Failed to load Lucide icons');
      }
    };
    document.head.appendChild(lucideScript);
  }

  // Animation for sections on scroll
  const sections = document.querySelectorAll('section');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = 1;
      }
    });
  }, { threshold: 0.1 });

  sections.forEach(section => {
    observer.observe(section);
  });

  // Dark mode toggle
  const darkModeToggle = document.getElementById('darkModeToggle');
  if (darkModeToggle) {
    const icon = darkModeToggle.querySelector('[data-lucide]');

    // Check for saved theme preference or respect OS preference
    const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const savedTheme = localStorage.getItem('theme');

    if (savedTheme === 'dark' || (!savedTheme && prefersDarkMode)) {
      document.body.classList.add('dark-mode');
      if (icon) icon.setAttribute('data-lucide', 'moon');
    } else {
      if (icon) icon.setAttribute('data-lucide', 'sun');
    }

    if (window.lucide) lucide.createIcons();

    darkModeToggle.addEventListener('click', () => {
      document.body.classList.toggle('dark-mode');

      if (document.body.classList.contains('dark-mode')) {
        if (icon) icon.setAttribute('data-lucide', 'moon');
        localStorage.setItem('theme', 'dark');
      } else {
        if (icon) icon.setAttribute('data-lucide', 'sun');
        localStorage.setItem('theme', 'light');
      }

      if (window.lucide) lucide.createIcons();
    });
  }

  // Fix copy buttons functionality
  const setupCopyButton = (buttonId, selector) => {
    const button = document.getElementById(buttonId);
    if (!button) return;

    button.addEventListener('click', () => {
      // Get the content to copy
      let content = '';

      // Handle different selectors
      const elements = document.querySelectorAll(selector);
      elements.forEach(el => {
        if (el.textContent) {
          content += el.textContent + '\n\n';
        }
      });

      if (!content) {
        console.error(`No content found for selector: ${selector}`);
        return;
      }

      // Copy to clipboard
      navigator.clipboard.writeText(content).then(() => {

        const originalText = button.innerHTML;

        button.innerHTML = `<i data-lucide="check" class="h-4 w-4 mr-2"></i>Copied!`;
        button.classList.add('copy-success');
        if (window.lucide) lucide.createIcons();

        setTimeout(() => {
          button.innerHTML = originalText;
          button.classList.remove('copy-success');
          if (window.lucide) lucide.createIcons();
        }, 2000);
      }).catch(err => {
        console.error('Failed to copy:', err);
        alert('Failed to copy to clipboard. Please try again.');
      });
    });
  };

  // Set up all copy buttons
  setupCopyButton('copyDeploymentBtn', '#deployment .bg-gray-900 pre');
  setupCopyButton('copyNginxConfigBtn', '#nginx .bg-gray-900 pre');
  setupCopyButton('copyAutoStartBtn', '#auto-start .bg-gray-900 pre');
  setupCopyButton('copyShutdownScriptBtn', '#auto-shutdown .bg-gray-900 pre:nth-of-type(2)');

  // Fix the cost calculator
  const costCalculator = document.getElementById('costCalculator');
  if (costCalculator) {
    const hoursPerDayInput = document.getElementById('hoursPerDay');
    const hoursValue = document.getElementById('hoursValue');
    const storageGBInput = document.getElementById('storageGB');
    const instanceTypeSelect = document.getElementById('instanceType');
    const totalCostDisplay = document.getElementById('totalCost');

    if (hoursPerDayInput && hoursValue && storageGBInput && instanceTypeSelect && totalCostDisplay) {
      const instanceCosts = {
        'g4dn.xlarge': 0.526,
        'g5.xlarge': 1.006,
        'g5.2xlarge': 1.13,
        'g5.4xlarge': 1.352,
        'g5.8xlarge': 2.704,
        'g5.16xlarge': 5.408
      };

      const calculateCost = () => {
        const hoursPerDay = parseInt(hoursPerDayInput.value);
        const daysPerMonth = 30;
        const storageGB = parseInt(storageGBInput.value);
        const instanceType = instanceTypeSelect.value;
        const hourlyRate = instanceCosts[instanceType];

        if (isNaN(hoursPerDay) || isNaN(storageGB) || !hourlyRate) {
          console.error('Invalid inputs for cost calculation');
          return;
        }

        // Calculate instance cost (hours per day × days × hourly rate)
        const instanceCost = hoursPerDay * daysPerMonth * hourlyRate;

        // Calculate storage cost ($0.08 per GB)
        const storageCost = storageGB * 0.08;

        // Add data transfer estimate ($0.09/GB, assuming 50 GB for active instance)
        const dataTransferGB = Math.max(10, Math.round((hoursPerDay / 24) * 50));
        const dataTransferCost = dataTransferGB * 0.09;

        // Calculate total
        const totalCost = instanceCost + storageCost + dataTransferCost;

        // Update the display
        totalCostDisplay.textContent = `$${totalCost.toFixed(2)}`;
        hoursValue.textContent = `${hoursPerDay}h`;
      };

      // Initial calculation
      calculateCost();

      // Add event listeners
      hoursPerDayInput.addEventListener('input', calculateCost);
      storageGBInput.addEventListener('input', calculateCost);
      instanceTypeSelect.addEventListener('change', calculateCost);
    } else {
      console.error('One or more cost calculator elements not found');
    }
  }

  // Fix Instance Calculator Modal button
  const calculateInstanceBtn = document.getElementById('calculateInstanceBtn');
  if (calculateInstanceBtn) {
    calculateInstanceBtn.addEventListener('click', () => {
      const costSection = document.getElementById('cost-estimate');
      if (costSection) {
        costSection.scrollIntoView({ behavior: 'smooth' });
      } else {
        console.error('Cost estimate section not found');
      }
    });
  }

  // Navigation highlighting based on scroll position
  const navLinks = document.querySelectorAll('nav a');
  const navSections = document.querySelectorAll('section[id]');

  window.addEventListener('scroll', () => {
    let current = '';
    const scrollPosition = window.scrollY;

    navSections.forEach(section => {
      const sectionTop = section.offsetTop - 100;
      const sectionHeight = section.offsetHeight;

      if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('nav-active');
      const href = link.getAttribute('href').substring(1);

      if (href === current) {
        link.classList.add('nav-active');
      }
    });
  });

  // Smooth scrolling for anchor links
  const anchorLinks = document.querySelectorAll('a[href^="#"]');

  anchorLinks.forEach(link => {
    link.addEventListener('click', function (e) {
      e.preventDefault();

      const targetId = this.getAttribute('href').substring(1);
      const targetElement = document.getElementById(targetId);

      if (targetElement) {
        window.scrollTo({
          top: targetElement.offsetTop - 20,
          behavior: 'smooth'
        });
      }
    });
  });
});
