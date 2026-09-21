const weatherLocations = [
  { place: 'Lanús', latitude: -34.702, longitude: -58.391 },
  { place: 'Lanús Este', latitude: -34.700, longitude: -58.377 },
  { place: 'Lanús Oeste', latitude: -34.700, longitude: -58.405 },
  { place: 'Remedios de Escalada', latitude: -34.721, longitude: -58.393 },
  { place: 'Valentín Alsina', latitude: -34.675, longitude: -58.413 },
  { place: 'Monte Chingolo', latitude: -34.731, longitude: -58.358 },
  { place: 'Gerli', latitude: -34.685, longitude: -58.382 },
  { place: 'Avellaneda', latitude: -34.662, longitude: -58.365 },
  { place: 'Banfield', latitude: -34.746, longitude: -58.391 },
  { place: 'Lomas de Zamora', latitude: -34.761, longitude: -58.403 },
  { place: 'Quilmes', latitude: -34.724, longitude: -58.252 },
  { place: 'Adrogué', latitude: -34.801, longitude: -58.391 }
];

let weather = [];
let weatherIndex = 0;
const weatherValue = document.querySelector('#weather-value');

function weatherIcon(code, isDay) {
  if (code === 0) return isDay ? '☀' : '☾';
  if ([1, 2].includes(code)) return isDay ? '⛅' : '☁';
  if (code === 3) return '☁';
  if ([45, 48].includes(code)) return '🌫';
  if ([51, 53, 55, 56, 57, 80, 81, 82].includes(code)) return '🌦';
  if ([61, 63, 65, 66, 67].includes(code)) return '🌧';
  if ([71, 73, 75, 77, 85, 86].includes(code)) return '❄';
  if ([95, 96, 99].includes(code)) return '⛈';
  return '☁';
}

function renderWeather(item) {
  if (!weatherValue) return;
  weatherValue.replaceChildren(document.createTextNode(`${item.place} ${item.temp}`));
  const icon = document.createElement('b');
  icon.textContent = item.icon;
  weatherValue.append(' ', icon);
}

function rotateWeather() {
  if (!weather.length || !weatherValue) return;
  weatherValue.classList.add('changing');
  setTimeout(() => {
    weatherIndex = (weatherIndex + 1) % weather.length;
    renderWeather(weather[weatherIndex]);
    weatherValue.classList.remove('changing');
  }, 260);
}

async function loadWeather() {
  const query = new URLSearchParams({
    latitude: weatherLocations.map(location => location.latitude).join(','),
    longitude: weatherLocations.map(location => location.longitude).join(','),
    current: 'temperature_2m,weather_code,is_day',
    timezone: 'America/Argentina/Buenos_Aires'
  });

  try {
    const response = await fetch(`https://api.open-meteo.com/v1/forecast?${query}`);
    if (!response.ok) throw new Error(`Open-Meteo respondió ${response.status}`);
    const readings = await response.json();
    const results = Array.isArray(readings) ? readings : [readings];
    weather = results.map((reading, index) => {
      const current = reading.current;
      if (!current) return null;
      return {
        place: weatherLocations[index].place,
        temp: `${Math.round(current.temperature_2m)}°`,
        icon: weatherIcon(current.weather_code, current.is_day === 1)
      };
    }).filter(Boolean);

    if (!weather.length) throw new Error('Open-Meteo no devolvió condiciones actuales');
    weatherIndex = 0;
    renderWeather(weather[weatherIndex]);
  } catch (error) {
    if (weatherValue) weatherValue.textContent = 'Clima no disponible';
    console.warn('No se pudo actualizar el clima:', error);
  }
}

loadWeather();
setInterval(rotateWeather, 3800);
setInterval(loadWeather, 15 * 60 * 1000);

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
