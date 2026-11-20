(() => {
  const config = document.currentScript.dataset;
  const allowedHosts = new Set(['benohanlon.md', 'sovereignharness.io']);
  if (!allowedHosts.has(location.hostname) || navigator.globalPrivacyControl || navigator.doNotTrack === '1') return;

  // The random ID exists only for this page load.
  const distinctId = crypto.randomUUID();
  const currentUrl = location.origin + location.pathname;
  const events = new Set([
    '$pageview', 'cyoa_starter_click', 'adventure_entry',
    'prompt_copy', 'substack_signup_click', 'substack_updates_preferences_click'
  ]);

  function capture(event) {
    if (!events.has(event)) return;
    void fetch(new URL('/i/v0/e/', config.host), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'omit',
      referrerPolicy: 'no-referrer',
      keepalive: true,
      body: JSON.stringify({
        api_key: config.projectToken,
        event,
        distinct_id: distinctId,
        properties: {
          $current_url: currentUrl,
          $host: location.hostname,
          $pathname: location.pathname,
          $process_person_profile: false,
          $geoip_disable: true
        }
      })
    }).catch(() => {});
  }

  window.captureSiteEvent = capture;
  function captureLink(event) {
    const link = event.target.closest('a[data-site-event]');
    if (link) capture(link.dataset.siteEvent);
  }
  document.addEventListener('click', captureLink);
  document.addEventListener('auxclick', event => {
    if (event.button === 1) captureLink(event);
  });
  capture('$pageview');
})();
