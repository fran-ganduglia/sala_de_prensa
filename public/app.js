const weather = [
  { place: 'Lanús', temp: '18°', icon: '☀' },
  { place: 'Avellaneda', temp: '17°', icon: '⛅' },
  { place: 'Lomas', temp: '18°', icon: '☀' },
  { place: 'Quilmes', temp: '16°', icon: '☁' },
  { place: 'Almirante Brown', temp: '17°', icon: '⛅' }
];

let weatherIndex = 0;
const weatherValue = document.querySelector('#weather-value');
setInterval(() => {
  weatherValue.classList.add('changing');
  setTimeout(() => {
    weatherIndex = (weatherIndex + 1) % weather.length;
    const item = weather[weatherIndex];
    weatherValue.innerHTML = `${item.place}&nbsp; ${item.temp} <b>${item.icon}</b>`;
    weatherValue.classList.remove('changing');
  }, 260);
}, 3800);

const dialog = document.querySelector('#search-dialog');
const searchInput = document.querySelector('#search-input');
const status = document.querySelector('#search-status');
const results = document.querySelector('#search-results');
const cards = [...document.querySelectorAll('.searchable-card')];

function openSearch() {
  if (!dialog || !searchInput) return;
  dialog.classList.add('open');
  dialog.setAttribute('aria-hidden', 'false');
  setTimeout(() => searchInput.focus(), 40);
}
function closeSearch() {
  if (!dialog || !searchInput) return;
  dialog.classList.remove('open');
  dialog.setAttribute('aria-hidden', 'true');
  searchInput.value = '';
  status.textContent = 'Escribí para buscar entre las notas de ejemplo.';
  results.innerHTML = '';
  cards.forEach(card => card.classList.remove('search-match'));
}
document.querySelectorAll('[data-open-search]').forEach(button => button.addEventListener('click', openSearch));
document.querySelector('.close-search')?.addEventListener('click', closeSearch);
dialog?.addEventListener('click', event => { if (event.target === dialog) closeSearch(); });
document.addEventListener('keydown', event => { if (event.key === 'Escape') closeSearch(); });

searchInput?.addEventListener('input', event => {
  const term = event.target.value.trim().toLowerCase();
  if (!term) {
    status.textContent = 'Escribí para buscar entre las notas de ejemplo.';
    results.innerHTML = '';
    cards.forEach(card => card.classList.remove('search-match'));
    return;
  }
  const matches = cards.filter(card => card.dataset.search.includes(term) || card.textContent.toLowerCase().includes(term));
  cards.forEach(card => card.classList.toggle('search-match', matches.includes(card)));
  status.textContent = matches.length ? `${matches.length} noticia${matches.length === 1 ? '' : 's'} coincidente${matches.length === 1 ? '' : 's'}.` : 'No encontramos coincidencias en esta maqueta.';
  results.innerHTML = matches.slice(0, 8).map(card => {
    const link = card.querySelector('h1 a, h2 a, h3 a, li a, .story-image, .card-image, .wide-image');
    const title = link?.textContent?.trim() || link?.getAttribute('aria-label') || 'Ver noticia';
    const href = link?.getAttribute('href') || '#archivo';
    const category = card.querySelector('.eyebrow, time')?.textContent?.trim() || 'NOTICIA';
    return `<a class="search-result" href="${href}"><span>${category}</span>${title}</a>`;
  }).join('');
});

const loadMore = document.querySelector('#load-more');
if (loadMore) {
  loadMore.addEventListener('click', () => {
    const hidden = document.querySelectorAll('.archive-item.is-hidden');
    hidden.forEach(item => item.classList.remove('is-hidden'));
    loadMore.remove();
  });
}

document.querySelectorAll('[data-share]').forEach(button => button.addEventListener('click', async () => {
  const shareData = { title: document.title, text: 'Los cambios que se vienen en la ciudad', url: window.location.href };
  try {
    if (navigator.share) await navigator.share(shareData);
    else { await navigator.clipboard.writeText(window.location.href); button.textContent = 'Enlace copiado'; setTimeout(() => button.textContent = 'Compartir', 1800); }
  } catch (_) { /* El usuario cerró la acción de compartir. */ }
}));

const toggle = document.querySelector('.menu-toggle');
const mobileMenu = document.querySelector('.mobile-menu');
toggle.addEventListener('click', () => {
  const isOpen = mobileMenu.classList.toggle('open');
  toggle.setAttribute('aria-expanded', String(isOpen));
  mobileMenu.setAttribute('aria-hidden', String(!isOpen));
});
mobileMenu.querySelectorAll('a').forEach(link => link.addEventListener('click', () => { mobileMenu.classList.remove('open'); toggle.setAttribute('aria-expanded', 'false'); }));
window.addEventListener('scroll', () => document.querySelector('.site-header').classList.toggle('scrolled', window.scrollY > 12), { passive: true });
