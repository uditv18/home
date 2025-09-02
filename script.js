document.addEventListener('DOMContentLoaded', () => {
  const header = document.querySelector('.site-header');
  const modalContainer = document.getElementById('modal-container');
  const modalBody = document.getElementById('modal-body'); // May not exist in target HTML
  const closeBtn = document.querySelector('.close-btn'); // May not exist in target HTML

  // --- Header Collapsing & Content Reveal Logic ---
  if (header) {
    let contentActivated = false; // Flag to lock the header state
    const scrollThreshold = 10;

    const activateContentAndScroll = () => {
      if (contentActivated) return;
      contentActivated = true;

      document.body.classList.add('content-active');

      // After the content is active, auto-scroll to the top of the main content area.
      // The CSS padding-top will handle the spacing below the header.
      setTimeout(() => {
        const mainElement = document.querySelector('main');
        if (mainElement) {
          // This scrolls the top of the <main> element to the top of the viewport.
          // The `padding-top` on `main` will ensure content starts below the fixed header.
          mainElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 150); // A small delay to let the CSS transitions begin
    };

    // Listen for the end of the header's collapse transition to trigger content reveal
    header.addEventListener('transitionend', (event) => {
      if (event.propertyName === 'height' && header.classList.contains('collapsed')) {
        activateContentAndScroll();
      }
    });

    // Handle scroll behavior
    const handleScroll = () => {
      if (window.scrollY > scrollThreshold) {
        header.classList.add('collapsed');
      } else if (!contentActivated) {
        // Only un-collapse if content hasn't been activated.
        // This prevents the full-screen header from reappearing on scroll to top.
        header.classList.remove('collapsed');
      }
    };

    // Handle click behavior
    const handleClick = () => {
      // On click, if the header is full-screen, collapse it.
      if (!header.classList.contains('collapsed')) {
        header.classList.add('collapsed');
      }
    };

    window.addEventListener('scroll', handleScroll);
    header.addEventListener('click', handleClick);
  }

  // --- Modal Window Logic ---
  // This logic is for a modal that may not be in the final HTML.
  // Guarding to prevent errors if elements are not found.
  if (modalContainer && modalBody && closeBtn) {
    document.querySelectorAll('nav a').forEach(link => {
      // Exclude the resume link and external links from the modal logic
      if (link.getAttribute('href') !== 'resume/cards/cv/Udit.pdf' && !link.getAttribute('href').startsWith('http')) {
        link.addEventListener('click', function (event) {
          event.preventDefault();

          // Get the target content ID from the link's href
          const targetId = this.getAttribute('href').substring(1);
          const targetSection = document.getElementById(targetId);

          if (targetSection) {
            modalBody.innerHTML = targetSection.innerHTML;
            modalContainer.style.display = 'flex';
            document.body.classList.add('modal-open');
            // Add a slight delay to allow the modal to appear before the animation starts
            setTimeout(() => modalContainer.classList.add('is-visible'), 10);
          }
        });
      }
    });

    // Function to close the modal
    const closeModal = () => {
      modalContainer.classList.remove('is-visible');
      document.body.classList.remove('modal-open');
      // Wait for the animation to finish before hiding the modal
      setTimeout(() => {
        modalContainer.style.display = 'none';
        modalBody.innerHTML = '';
      }, 400); // This should match your CSS transition time
    };

    // Close the modal when the 'x' button is clicked
    closeBtn.addEventListener('click', closeModal);

    // Close the modal when the user clicks outside of the modal content
    window.addEventListener('click', (event) => {
      if (event.target === modalContainer) {
        closeModal();
      }
    });

    // Close the modal on the Escape key
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && document.body.classList.contains('modal-open')) {
        closeModal();
      }
    });
  }

  // Slide tracking on scroll
  function updateActiveSlide() {
    const slides = document.querySelectorAll('.slide');
    const viewportCenter = window.innerHeight / 2;

    let closestSlide = null;
    let minDistance = Infinity;

    slides.forEach(slide => {
      const rect = slide.getBoundingClientRect();
      const slideCenter = rect.top + rect.height / 2;
      const distance = Math.abs(slideCenter - viewportCenter);

      if (distance < minDistance) {
        minDistance = distance;
        closestSlide = slide;
      }
    });

    slides.forEach(slide => {
      if (slide === closestSlide) {
        slide.classList.add('is-active');
        slide.classList.remove('card-shrink');
      } else {
        slide.classList.remove('is-active');
        slide.classList.add('card-shrink');
      }
    });
  }

  window.addEventListener('scroll', updateActiveSlide);
  window.addEventListener('resize', updateActiveSlide);
  document.addEventListener('DOMContentLoaded', updateActiveSlide);


  // --- VFX Canvas Background Logic ---
  const canvas = document.getElementById('spaceCanvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');

    let width, height;
    let stars = [];
    let numStars = 9000;
    const maxDepth = 1000;
    let densityGradient = 1 / 2;

    // ===================== SPEED & ANIMATION SETTINGS =====================
    let speed = 4.0;
    const acceleration = 0.03;
    const deceleration = 0.005; // Rate at which the speed decreases
    const finalSpeed = 0.5; // The slow, constant speed you want to maintain

    // Animation phases for the flash effect
    let flashTriggered = false;
    let flashStartTime = null;
    const flashDuration = 800;
    let transitionDuration = 1000;
    const hyperspaceDuration = 3000;

    // Constants for the star density
    const flashStarCount = numStars * 10;
    const initialStarCount = 9000;
    let postFlash = false;
    let animationStartTime = null;

    function setup() {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;

      stars = [];
      for (let i = 0; i < numStars; i++) {
        stars.push(createStar());
      }
    }

    function createStar() {
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.pow(Math.random(), densityGradient) * Math.max(width, height) / 2;
      return {
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius,
        z: Math.random() * maxDepth,
        baseSize: 0.1 + Math.random() * 0.4,
        color: getRandomColor()
      };
    }

    function getRandomColor() {
      const colors = ["#ffffff", "#ffd27f", "#ffae42", "#ff8c00", "#ff4500"];
      return colors[Math.floor(Math.random() * colors.length)];
    }

    function resetStar(star) {
      Object.assign(star, createStar());
      star.z = maxDepth;
    }

    function animate(timestamp) {
      if (!animationStartTime) animationStartTime = timestamp;
      const elapsedTotal = timestamp - animationStartTime;

      if (!flashTriggered && elapsedTotal >= hyperspaceDuration) {
        flashTriggered = true;
        flashStartTime = timestamp;
      }

      ctx.fillStyle = 'rgba(0, 0, 10, 0.2)';
      ctx.fillRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height / 2;

      ctx.beginPath();

      for (const star of stars) {
        star.z -= speed;

        if (star.z <= 0) {
          resetStar(star);
          continue;
        }

        const scale = maxDepth / (maxDepth / 4 + star.z);
        const screenX = centerX + star.x * scale;
        const screenY = centerY + star.y * scale;

        let size = (1 - star.z / maxDepth) * star.baseSize * 5;
        size = Math.max(0.1, Math.min(size, 1.5));

        if (screenX > -size && screenX < width + size && screenY > -size && screenY < height + size) {
          ctx.fillStyle = star.color;
          ctx.moveTo(screenX + size, screenY);
          ctx.arc(screenX, screenY, size, 0, Math.PI * 2);
        }
      }

      ctx.fill();

      if (flashTriggered && !postFlash) {
        const elapsed = timestamp - flashStartTime;
        if (elapsed < transitionDuration) {
          densityGradient = 1 / 4;
          const starsToAdd = Math.floor((flashStarCount - initialStarCount) * (elapsed / transitionDuration));
          while (stars.length < initialStarCount + starsToAdd) {
            stars.push(createStar());
          }
        } else if (elapsed < transitionDuration + flashDuration) {
          // Peak flash density
        } else if (elapsed < transitionDuration + flashDuration + transitionDuration) {
          const elapsedDecay = elapsed - (transitionDuration + flashDuration);
          numStars = 6000;
          const targetStarCount = flashStarCount - (flashStarCount - numStars) * (elapsedDecay / transitionDuration);
          while (stars.length > targetStarCount) {
            stars.pop();
          }
        } else {
          postFlash = true;
          speed = 3.0;
          densityGradient = 1 / 2;

          // --- REVEAL SITE CONTENT ---
          // When the post-flash/deceleration phase begins, fade in the website content.
          document.body.classList.add('content-visible');

        }
      } else if (postFlash) {
        if (speed > finalSpeed) {
          speed -= deceleration;
        } else {
          speed = finalSpeed;
        }
      } else {
        speed += acceleration;
      }

      requestAnimationFrame(animate);
    }

    // Initial setup and start animation
    setup();
    animate();
    window.addEventListener('resize', setup);
  }
});