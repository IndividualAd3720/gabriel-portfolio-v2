// ── Particle Network Background ──────────────
(function () {
  const canvas = document.createElement('canvas');
  canvas.id = 'particles';
  canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:0;';
  document.body.prepend(canvas);

  const ctx = canvas.getContext('2d');
  let W, H, particles;

  const CONFIG = {
    count: 70,
    maxDist: 130,
    speed: 0.4,
    radius: 1.8,
    color: '167,139,250', // --accent purple in RGB
    lineOpacity: 0.12,
    dotOpacity: 0.45,
  };

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function Particle() {
    this.x = Math.random() * W;
    this.y = Math.random() * H;
    this.vx = (Math.random() - 0.5) * CONFIG.speed;
    this.vy = (Math.random() - 0.5) * CONFIG.speed;
    this.r = CONFIG.radius + Math.random() * 1.2;
    this.opacity = 0.2 + Math.random() * 0.5;
    this.pulse = Math.random() * Math.PI * 2; // phase offset for breathing
  }

  Particle.prototype.update = function () {
    this.x += this.vx;
    this.y += this.vy;
    this.pulse += 0.012;
    // bounce off edges
    if (this.x < 0 || this.x > W) this.vx *= -1;
    if (this.y < 0 || this.y > H) this.vy *= -1;
  };

  function init() {
    resize();
    particles = Array.from({ length: CONFIG.count }, () => new Particle());
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    // Draw connecting lines
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < CONFIG.maxDist) {
          const alpha = CONFIG.lineOpacity * (1 - dist / CONFIG.maxDist);
          ctx.beginPath();
          ctx.strokeStyle = `rgba(${CONFIG.color},${alpha})`;
          ctx.lineWidth = 0.8;
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }

    // Draw dots with breathing opacity
    particles.forEach(p => {
      const breathe = CONFIG.dotOpacity + Math.sin(p.pulse) * 0.15;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${CONFIG.color},${breathe})`;
      ctx.fill();
      p.update();
    });

    requestAnimationFrame(draw);
  }

  window.addEventListener('resize', () => {
    resize();
    // reposition any out-of-bounds particles
    particles.forEach(p => {
      if (p.x > W) p.x = Math.random() * W;
      if (p.y > H) p.y = Math.random() * H;
    });
  });

  // Mouse interaction — particles shy away slightly
  window.addEventListener('mousemove', (e) => {
    particles.forEach(p => {
      const dx = p.x - e.clientX;
      const dy = p.y - e.clientY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 80) {
        p.vx += (dx / dist) * 0.3;
        p.vy += (dy / dist) * 0.3;
        // cap speed
        const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        if (speed > 2) { p.vx = (p.vx / speed) * 2; p.vy = (p.vy / speed) * 2; }
      }
    });
  });

  init();
  draw();
})();

// ── Navigation ──────────────────────────────
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');

if (navToggle) {
  navToggle.addEventListener('click', () => {
    navLinks.classList.toggle('open');
  });
}

document.querySelectorAll('.nav-links a').forEach(link => {
  link.addEventListener('click', () => navLinks.classList.remove('open'));
});

// ── Active nav link on scroll ────────────────
const sections = document.querySelectorAll('section[id]');
window.addEventListener('scroll', () => {
  let current = '';
  sections.forEach(section => {
    if (window.scrollY >= section.offsetTop - 120) current = section.id;
  });
  document.querySelectorAll('.nav-links a').forEach(a => {
    a.style.color = a.getAttribute('href') === `#${current}` ? 'var(--accent)' : '';
  });
});

// ── Blog preview on homepage ─────────────────
const blogPreview = document.getElementById('blogPreview');

if (blogPreview) {
  fetch('blog/posts.json')
    .then(r => r.json())
    .then(posts => {
      const recent = posts.slice(0, 3);
      blogPreview.innerHTML = recent.map(post => `
        <a href="blog/post.html?slug=${post.slug}" class="glass blog-card" style="display:block;text-decoration:none;color:inherit">
          <div class="blog-meta">
            <span class="blog-category">${post.category}</span>
            <span class="blog-date">${post.date}</span>
          </div>
          <div class="blog-title">${post.title}</div>
          <p class="blog-excerpt">${post.excerpt}</p>
          <span class="blog-read-more">Read more →</span>
        </a>
      `).join('');
    })
    .catch(() => {
      blogPreview.innerHTML = `
        <div class="glass blog-card" style="grid-column:1/-1;text-align:center;padding:40px">
          <p>Blog posts coming soon.</p>
        </div>`;
    });
}

// ── Scroll reveal (fade-in) ──────────────────
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.glass').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(20px)';
  el.style.transition = 'opacity 0.5s ease, transform 0.5s ease, background 0.3s ease, border-color 0.3s ease';
  observer.observe(el);
});
