// Keep initialization external so the site's CSP can continue blocking inline JavaScript.
window.dataLayer = window.dataLayer || [];
window.gtag = function () {
  window.dataLayer.push(arguments);
};
window.gtag('js', new Date());
window.gtag('config', 'G-ZSX50KY090', {
  allow_google_signals: false,
  allow_ad_personalization_signals: false,
});

// Count only explicitly marked sponsor links, including clicks on their images.
// Keep navigation intact; GA4 queues events while its library is loading.
function trackSponsorClick(event) {
  if (event.type === 'auxclick' ? event.button !== 1 : event.button !== 0) return;
  const link = event.target instanceof Element ? event.target.closest('a[data-sponsor-link]') : null;
  if (!link || link.closest('[inert]')) return;
  const sponsor = link.closest('[data-sponsor-name]');
  const placement = link.closest('[data-sponsor-placement]');
  if (!sponsor || !placement) return;

  window.gtag('event', 'sponsor_click', {
    sponsor_name: sponsor.dataset.sponsorName,
    sponsor_placement: placement.dataset.sponsorPlacement,
    sponsor_link: link.dataset.sponsorLink,
    link_url: link.href,
    transport_type: 'beacon',
  });
}

document.addEventListener('click', trackSponsorClick, true);
document.addEventListener('auxclick', trackSponsorClick, true);
