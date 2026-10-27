// These exact strings are used in the HTML and hashed into the generated CSP.
// A trusted loader lets AdSense load its changing dependencies with strict-dynamic.
export const integrationsScript = `(function () {
  function load(src, onload, crossOrigin) {
    var script = document.createElement('script');
    script.async = true;
    script.src = src;
    if (onload) script.onload = onload;
    if (crossOrigin) script.crossOrigin = crossOrigin;
    document.head.appendChild(script);
  }
  load('/analytics.js', function () {
    load('https://www.googletagmanager.com/gtag/js?id=G-ZSX50KY090');
  });
  load('https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6812754349304538', null, 'anonymous');
})();`;

export const appScript = `(function () {
  var script = document.createElement('script');
  script.src = '/app.js';
  document.body.appendChild(script);
})();`;
