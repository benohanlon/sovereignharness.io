/*
 * SPDX-FileCopyrightText: 2026 Ben O’Hanlon
 * SPDX-License-Identifier: MIT
 */
(() => {
  const config = document.currentScript.dataset;
  const allowedHosts = new Set(['benohanlon.md', 'sovereignharness.io']);
  if (!allowedHosts.has(location.hostname)) return;

  const preferenceKey = 'site-analytics-disabled';
  const browserOptOut = navigator.globalPrivacyControl || navigator.doNotTrack === '1';
  let optedOut = false;
  try {
    optedOut = localStorage.getItem(preferenceKey) === '1';
  } catch {
    // Some browsers block storage even for site preferences.
  }

  const preference = document.querySelector('#analytics-opt-out');
  if (preference) {
    const status = document.querySelector('#analytics-preference-status');
    preference.checked = Boolean(browserOptOut || optedOut);
    preference.disabled = Boolean(browserOptOut);
    status.textContent = browserOptOut ? 'Your browser has requested that analytics stay off.' : '';
    preference.addEventListener('change', () => {
      try {
        if (preference.checked) localStorage.setItem(preferenceKey, '1');
        else localStorage.removeItem(preferenceKey);
        status.textContent = preference.checked ? 'Analytics are off in this browser.' : 'Analytics are on in this browser.';
      } catch {
        preference.checked = optedOut;
        status.textContent = 'This browser blocked saving your preference. You can use a browser privacy setting to block analytics.';
      }
    });
    return;
  }
  if (browserOptOut || optedOut) return;

  // The random ID exists only for this page load.
  const distinctId = crypto.randomUUID();
  const currentUrl = location.origin + location.pathname;
  const events = new Set([
    '$pageview', 'cyoa_starter_click', 'adventure_entry',
    'prompt_copy', 'substack_signup_click', 'substack_updates_preferences_click'
  ]);

  function capture(event) {
    if (!events.has(event)) return;
    try {
      if (localStorage.getItem(preferenceKey) === '1') return;
    } catch {
      // The browser may block local storage.
    }
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
