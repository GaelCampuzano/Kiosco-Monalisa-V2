if (!self.define) {
  let e,
    s = {};
  const n = (n, a) => (
    (n = new URL(n + '.js', a).href),
    s[n] ||
      new Promise((s) => {
        if ('document' in self) {
          const e = document.createElement('script');
          ((e.src = n), (e.onload = s), document.head.appendChild(e));
        } else ((e = n), importScripts(n), s());
      }).then(() => {
        let e = s[n];
        if (!e) throw new Error(`Module ${n} didn’t register its module`);
        return e;
      })
  );
  self.define = (a, t) => {
    const c = e || ('document' in self ? document.currentScript.src : '') || location.href;
    if (s[c]) return;
    let i = {};
    const r = (e) => n(e, c),
      o = { module: { uri: c }, exports: i, require: r };
    s[c] = Promise.all(a.map((e) => o[e] || r(e))).then((e) => (t(...e), i));
  };
}
define(['./workbox-f1770938'], function (e) {
  'use strict';
  (importScripts(),
    self.skipWaiting(),
    e.clientsClaim(),
    e.precacheAndRoute(
      [
        { url: '/_next/static/chunks/139.7a5a8e93a21948c1.js', revision: '7a5a8e93a21948c1' },
        { url: '/_next/static/chunks/143-f90e48190af20fe2.js', revision: 'f90e48190af20fe2' },
        { url: '/_next/static/chunks/204.2046ce5e91d8b594.js', revision: '2046ce5e91d8b594' },
        { url: '/_next/static/chunks/229.ff1c756b6aca8be7.js', revision: 'ff1c756b6aca8be7' },
        { url: '/_next/static/chunks/239-653569d93218237a.js', revision: '653569d93218237a' },
        { url: '/_next/static/chunks/348.cfb4657245ebba62.js', revision: 'cfb4657245ebba62' },
        { url: '/_next/static/chunks/457-0d6efcb0bf834cb9.js', revision: '0d6efcb0bf834cb9' },
        { url: '/_next/static/chunks/4bd1b696-c023c6e3521b1417.js', revision: 'c023c6e3521b1417' },
        { url: '/_next/static/chunks/521-c035d35436e55e40.js', revision: 'c035d35436e55e40' },
        { url: '/_next/static/chunks/580-460025b8726ef8a6.js', revision: '460025b8726ef8a6' },
        { url: '/_next/static/chunks/6.b1814e6479b66c6b.js', revision: 'b1814e6479b66c6b' },
        { url: '/_next/static/chunks/646.f342b7cffc01feb0.js', revision: 'f342b7cffc01feb0' },
        { url: '/_next/static/chunks/696-bae8d9912ba22447.js', revision: 'bae8d9912ba22447' },
        { url: '/_next/static/chunks/720-8d5292a2a76a19bb.js', revision: '8d5292a2a76a19bb' },
        { url: '/_next/static/chunks/76-78983b11373f29c1.js', revision: '78983b11373f29c1' },
        {
          url: '/_next/static/chunks/app/_not-found/page-e39a4b7674d7ceb1.js',
          revision: 'e39a4b7674d7ceb1',
        },
        {
          url: '/_next/static/chunks/app/admin/layout-0156847187666437.js',
          revision: '0156847187666437',
        },
        {
          url: '/_next/static/chunks/app/admin/page-0125a668aa3356c0.js',
          revision: '0125a668aa3356c0',
        },
        { url: '/_next/static/chunks/app/error-cba4e8d7b2493e2d.js', revision: 'cba4e8d7b2493e2d' },
        {
          url: '/_next/static/chunks/app/layout-3d0cf038abcd4891.js',
          revision: '3d0cf038abcd4891',
        },
        {
          url: '/_next/static/chunks/app/login/page-2639a666e19fe07a.js',
          revision: '2639a666e19fe07a',
        },
        { url: '/_next/static/chunks/app/page-f253b935da7315fd.js', revision: 'f253b935da7315fd' },
        { url: '/_next/static/chunks/framework-d7de93249215fb06.js', revision: 'd7de93249215fb06' },
        { url: '/_next/static/chunks/main-2ed3316b9594d1b3.js', revision: '2ed3316b9594d1b3' },
        { url: '/_next/static/chunks/main-app-6fd38212b6ed03ae.js', revision: '6fd38212b6ed03ae' },
        {
          url: '/_next/static/chunks/pages/_app-82835f42865034fa.js',
          revision: '82835f42865034fa',
        },
        {
          url: '/_next/static/chunks/pages/_error-013f4188946cdd04.js',
          revision: '013f4188946cdd04',
        },
        {
          url: '/_next/static/chunks/polyfills-42372ed130431b0a.js',
          revision: '846118c33b2c0e922d7b3a7676f81f6f',
        },
        { url: '/_next/static/chunks/webpack-dd19bfccc15b0a20.js', revision: 'dd19bfccc15b0a20' },
        { url: '/_next/static/css/8cebc41138fd6ab3.css', revision: '8cebc41138fd6ab3' },
        {
          url: '/_next/static/h0IcY406qJ6zinPkPTwZM/_buildManifest.js',
          revision: '3a3068f6f8e9452cf5dad264f3ec2238',
        },
        {
          url: '/_next/static/h0IcY406qJ6zinPkPTwZM/_ssgManifest.js',
          revision: 'b6652df95db52feb4daf4eca35380933',
        },
        {
          url: '/_next/static/media/76bccc7e155d9e3c-s.p.ttf',
          revision: '0aa580cc3b39c3a9ae1cc1a6509e1b6a',
        },
        { url: '/bkg.jpg', revision: 'eec6dc5f698dc78e377e6dd75f20df99' },
        { url: '/logo-monalisa.svg', revision: '5bdab7646e2e37e227a523ffee9ccd93' },
        { url: '/manifest.json', revision: 'f86cbe81801fba5d9a8498803dd76197' },
        { url: '/swe-worker-5c72df51bb1f6ee0.js', revision: '76fdd3369f623a3edcf74ce2200bfdd0' },
      ],
      { ignoreURLParametersMatching: [/^utm_/, /^fbclid$/] }
    ),
    e.cleanupOutdatedCaches(),
    e.registerRoute(
      '/',
      new e.NetworkFirst({
        cacheName: 'start-url',
        plugins: [
          {
            cacheWillUpdate: function (e) {
              var s = e.response;
              return _async_to_generator(function () {
                return _ts_generator(this, function (e) {
                  return [
                    2,
                    s && 'opaqueredirect' === s.type
                      ? new Response(s.body, { status: 200, statusText: 'OK', headers: s.headers })
                      : s,
                  ];
                });
              })();
            },
          },
        ],
      }),
      'GET'
    ),
    e.registerRoute(
      /^https:\/\/fonts\.(?:gstatic)\.com\/.*/i,
      new e.CacheFirst({
        cacheName: 'google-fonts-webfonts',
        plugins: [new e.ExpirationPlugin({ maxEntries: 4, maxAgeSeconds: 31536e3 })],
      }),
      'GET'
    ),
    e.registerRoute(
      /^https:\/\/fonts\.(?:googleapis)\.com\/.*/i,
      new e.StaleWhileRevalidate({
        cacheName: 'google-fonts-stylesheets',
        plugins: [new e.ExpirationPlugin({ maxEntries: 4, maxAgeSeconds: 604800 })],
      }),
      'GET'
    ),
    e.registerRoute(
      /\.(?:eot|otf|ttc|ttf|woff|woff2|font.css)$/i,
      new e.StaleWhileRevalidate({
        cacheName: 'static-font-assets',
        plugins: [new e.ExpirationPlugin({ maxEntries: 4, maxAgeSeconds: 604800 })],
      }),
      'GET'
    ),
    e.registerRoute(
      /\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,
      new e.StaleWhileRevalidate({
        cacheName: 'static-image-assets',
        plugins: [new e.ExpirationPlugin({ maxEntries: 64, maxAgeSeconds: 2592e3 })],
      }),
      'GET'
    ),
    e.registerRoute(
      /\/_next\/static.+\.js$/i,
      new e.CacheFirst({
        cacheName: 'next-static-js-assets',
        plugins: [new e.ExpirationPlugin({ maxEntries: 64, maxAgeSeconds: 86400 })],
      }),
      'GET'
    ),
    e.registerRoute(
      /\/_next\/image\?url=.+$/i,
      new e.StaleWhileRevalidate({
        cacheName: 'next-image',
        plugins: [new e.ExpirationPlugin({ maxEntries: 64, maxAgeSeconds: 86400 })],
      }),
      'GET'
    ),
    e.registerRoute(
      /\.(?:mp3|wav|ogg)$/i,
      new e.CacheFirst({
        cacheName: 'static-audio-assets',
        plugins: [
          new e.RangeRequestsPlugin(),
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
        ],
      }),
      'GET'
    ),
    e.registerRoute(
      /\.(?:mp4|webm)$/i,
      new e.CacheFirst({
        cacheName: 'static-video-assets',
        plugins: [
          new e.RangeRequestsPlugin(),
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
        ],
      }),
      'GET'
    ),
    e.registerRoute(
      /\.(?:js)$/i,
      new e.StaleWhileRevalidate({
        cacheName: 'static-js-assets',
        plugins: [new e.ExpirationPlugin({ maxEntries: 48, maxAgeSeconds: 86400 })],
      }),
      'GET'
    ),
    e.registerRoute(
      /\.(?:css|less)$/i,
      new e.StaleWhileRevalidate({
        cacheName: 'static-style-assets',
        plugins: [new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 })],
      }),
      'GET'
    ),
    e.registerRoute(
      /\/_next\/data\/.+\/.+\.json$/i,
      new e.StaleWhileRevalidate({
        cacheName: 'next-data',
        plugins: [new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 })],
      }),
      'GET'
    ),
    e.registerRoute(
      /\.(?:json|xml|csv)$/i,
      new e.NetworkFirst({
        cacheName: 'static-data-assets',
        plugins: [new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 })],
      }),
      'GET'
    ),
    e.registerRoute(
      function (e) {
        var s = e.sameOrigin,
          n = e.url.pathname;
        return !(!s || n.startsWith('/api/auth/callback') || !n.startsWith('/api/'));
      },
      new e.NetworkFirst({
        cacheName: 'apis',
        networkTimeoutSeconds: 10,
        plugins: [new e.ExpirationPlugin({ maxEntries: 16, maxAgeSeconds: 86400 })],
      }),
      'GET'
    ),
    e.registerRoute(
      function (e) {
        var s = e.request,
          n = e.url.pathname,
          a = e.sameOrigin;
        return (
          '1' === s.headers.get('RSC') &&
          '1' === s.headers.get('Next-Router-Prefetch') &&
          a &&
          !n.startsWith('/api/')
        );
      },
      new e.NetworkFirst({
        cacheName: 'pages-rsc-prefetch',
        plugins: [new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 })],
      }),
      'GET'
    ),
    e.registerRoute(
      function (e) {
        var s = e.request,
          n = e.url.pathname,
          a = e.sameOrigin;
        return '1' === s.headers.get('RSC') && a && !n.startsWith('/api/');
      },
      new e.NetworkFirst({
        cacheName: 'pages-rsc',
        plugins: [new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 })],
      }),
      'GET'
    ),
    e.registerRoute(
      function (e) {
        var s = e.url.pathname;
        return e.sameOrigin && !s.startsWith('/api/');
      },
      new e.NetworkFirst({
        cacheName: 'pages',
        plugins: [new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 })],
      }),
      'GET'
    ),
    e.registerRoute(
      function (e) {
        return !e.sameOrigin;
      },
      new e.NetworkFirst({
        cacheName: 'cross-origin',
        networkTimeoutSeconds: 10,
        plugins: [new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 3600 })],
      }),
      'GET'
    ),
    (self.__WB_DISABLE_DEV_LOGS = !0));
});
