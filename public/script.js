(() => {
  'use strict';

  const CONSENT_KEY = 'verticalchao_consent';
  const dataLayer = window.dataLayer = window.dataLayer || [];
  const track = (event, properties = {}) => dataLayer.push({ event, ...properties });

  const header = document.querySelector('[data-site-header]');
  const hero = document.querySelector('[data-hero]');
  if (header && hero && 'IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => {
      header.classList.toggle('is-scrolled', !entry.isIntersecting);
    }, { rootMargin: '-72px 0px 0px' }).observe(hero);
  }

  document.querySelectorAll('[data-current-year]').forEach((node) => {
    node.textContent = String(new Date().getFullYear());
  });

  document.querySelectorAll('[data-track-cta]').forEach((link) => {
    link.addEventListener('click', () => {
      track('cta_clicked', {
        cta_text: link.textContent.trim().replace(/\s+/g, ' ').slice(0, 80),
        cta_location: link.dataset.ctaLocation || 'unknown',
        contact_method: link.dataset.contactMethod || 'navigation',
      });
    });
  });

  const banner = document.querySelector('[data-consent-banner]');
  const accept = document.querySelector('[data-consent-accept]');
  const reject = document.querySelector('[data-consent-reject]');
  const managers = document.querySelectorAll('[data-consent-manage]');
  let returnFocus = null;

  const readConsent = () => {
    try { return localStorage.getItem(CONSENT_KEY); } catch (_) { return null; }
  };
  const storeConsent = (value) => {
    try { localStorage.setItem(CONSENT_KEY, value); } catch (_) {}
  };
  const showBanner = ({ focus = true } = {}) => {
    if (!banner) return;
    banner.hidden = false;
    if (focus) window.setTimeout(() => accept?.focus(), 0);
  };
  const hideBanner = () => {
    if (!banner) return;
    banner.hidden = true;
    const focusTarget = returnFocus || document.querySelector('#conteudo');
    focusTarget?.focus({ preventScroll: true });
    returnFocus = null;
  };
  const updateConsent = (decision) => {
    const value = decision === 'granted' ? 'granted' : 'denied';
    window.gtag?.('consent', 'update', {
      analytics_storage: value,
      ad_storage: value,
      ad_user_data: value,
      ad_personalization: value,
    });
    storeConsent(decision);
    track('consent_updated', { consent_state: decision });
    hideBanner();
  };

  accept?.addEventListener('click', () => updateConsent('granted'));
  reject?.addEventListener('click', () => updateConsent('denied'));
  managers.forEach((button) => button.addEventListener('click', () => {
    returnFocus = button;
    showBanner({ focus: true });
  }));
  if (!readConsent()) showBanner({ focus: false });
  // Keep the floating contact control clear of the mobile email form.
  const contactForm = document.querySelector('[data-contact-form]');
  const floatingWhatsApp = document.querySelector('[data-whatsapp-widget], .floating-whatsapp, .whatsapp-float');
  if (contactForm && floatingWhatsApp && typeof IntersectionObserver === 'function') {
    new IntersectionObserver(([entry]) => {
      floatingWhatsApp.dataset.contactVisible = entry.isIntersecting ? 'true' : 'false';
    }).observe(contactForm);
  }
})();
