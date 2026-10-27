// The shared head loader already loads adsbygoogle.js once per page.
document.querySelectorAll('ins.adsbygoogle[data-manual-ad]').forEach((ad) => {
  if (ad.dataset.adQueued || ad.hasAttribute('data-adsbygoogle-status')) return;
  ad.dataset.adQueued = 'true';
  (window.adsbygoogle = window.adsbygoogle || []).push({});
});
