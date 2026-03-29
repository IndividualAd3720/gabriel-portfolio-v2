// ── Navigation ──────────────────────────────
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');

if (navToggle) {
  navToggle.addEventListener('click', () => {
    navLinks.classList.toggle('open');
  });
}

// Close nav on link click (mobile)
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

// ── Scroll reveal (simple fade-in) ──────────
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
