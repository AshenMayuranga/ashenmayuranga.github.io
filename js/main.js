const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#navigation');

function closeMenu() {
  navigation.classList.remove('is-open');
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-label', 'Open navigation');
}

menuButton.addEventListener('click', () => {
  const isOpen = menuButton.getAttribute('aria-expanded') !== 'true';
  navigation.classList.toggle('is-open', isOpen);
  menuButton.setAttribute('aria-expanded', String(isOpen));
  menuButton.setAttribute('aria-label', isOpen ? 'Close navigation' : 'Open navigation');
});
navigation.addEventListener('click', (event) => {
  if (event.target.closest('a')) closeMenu();
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') {
    closeMenu();
    menuButton.focus();
  }
});
document.addEventListener('click', (event) => {
  if (!event.target.closest('.site-header')) closeMenu();
});
window.matchMedia('(min-width: 601px)').addEventListener('change', closeMenu);

const cards = [...document.querySelectorAll('.project-card')];
const filters = [...document.querySelectorAll('[data-filter]')];
const filterStatus = document.querySelector('#filter-status');

filters.forEach((button) => {
  button.addEventListener('click', () => {
    const filter = button.dataset.filter;
    filters.forEach((item) => item.setAttribute('aria-pressed', String(item === button)));
    let count = 0;
    cards.forEach((card) => {
      const visible = filter === 'all' || card.dataset.categories.split(' ').includes(filter);
      card.hidden = !visible;
      if (visible) count += 1;
    });
    const label = filter === 'all' ? 'all' : button.textContent.trim().toLowerCase();
    filterStatus.textContent = `Showing ${count} ${label} project${count === 1 ? '' : 's'}.`;
  });
});

document.querySelector('#year').textContent = new Date().getFullYear();

if ('IntersectionObserver' in window) {
  const links = [...navigation.querySelectorAll('a')];
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      links.forEach((link) => {
        if (link.hash === `#${entry.target.id}`) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    }
  }, { rootMargin: '-15% 0px -55% 0px' });
  document.querySelectorAll('main section[id]').forEach((section) => observer.observe(section));
}

// Keep the page's navigation and content independent of the optional 3D renderer.
function loadCompanion() {
  import('../assets/avatar.bundle.js').then(({ initAvatar }) => initAvatar()).catch((error) => {
    console.warn('The 3D companion is unavailable; showing the illustration.', error);
  });
}

// Render the introduction first, then load the optional character when it is nearby.
if ('IntersectionObserver' in window) {
  const companionObserver = new IntersectionObserver(([entry], observer) => {
    if (!entry.isIntersecting) return;
    observer.disconnect();
    if ('requestIdleCallback' in window) window.requestIdleCallback(loadCompanion, { timeout: 1200 });
    else setTimeout(loadCompanion, 100);
  }, { rootMargin: '120px' });
  companionObserver.observe(document.querySelector('#avatar-stage'));
} else loadCompanion();
