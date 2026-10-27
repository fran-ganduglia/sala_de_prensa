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
