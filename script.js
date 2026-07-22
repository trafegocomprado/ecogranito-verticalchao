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

  const form = document.querySelector('[data-whatsapp-form]');
  if (form) {
    const fields = {
      nome: form.elements.nome,
      telefone: form.elements.telefone,
      email: form.elements.email,
      assunto: form.elements.assunto,
      mensagem: form.elements.mensagem,
    };

    const errorFor = (name) => form.querySelector(`[data-error-for="${name}"]`);
    const setError = (name, message) => {
      const field = fields[name];
      const error = errorFor(name);
      field.setAttribute('aria-invalid', message ? 'true' : 'false');
      if (error) error.textContent = message;
    };
    const validate = () => {
      const values = Object.fromEntries(Object.entries(fields).map(([name, field]) => [name, field.value.trim()]));
      const errors = {
        nome: values.nome ? '' : 'Informe seu nome.',
        telefone: values.telefone.replace(/\D/g, '').length >= 10 ? '' : 'Informe um telefone com DDD.',
        email: !values.email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email) ? '' : 'Confira o endereço de e-mail.',
        assunto: values.assunto ? '' : 'Selecione um assunto.',
        mensagem: values.mensagem ? '' : 'Conte o que precisa ser avaliado.',
      };
      Object.entries(errors).forEach(([name, message]) => setError(name, message));
      const firstInvalid = Object.keys(errors).find((name) => errors[name]);
      if (firstInvalid) fields[firstInvalid].focus();
      return { valid: !firstInvalid, values };
    };

    Object.keys(fields).forEach((name) => {
      fields[name].addEventListener('input', () => setError(name, ''));
      fields[name].addEventListener('change', () => setError(name, ''));
    });

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const { valid, values } = validate();
      if (!valid) return;

      const lines = [
        'Olá, preciso de um atendimento!',
        '',
        `Nome: ${values.nome}`,
        `Telefone: ${values.telefone}`,
        values.email ? `E-mail: ${values.email}` : '',
        `Assunto: ${values.assunto}`,
        `Mensagem: ${values.mensagem}`,
      ].filter(Boolean);
      const url = `https://api.whatsapp.com/send?phone=5531996848477&text=${encodeURIComponent(lines.join('\n'))}`;
      track('form_submitted', {
        form_name: 'ecogranito_orcamento',
        contact_method: 'whatsapp',
      });
      window.open(url, '_blank', 'noopener');
    });
  }

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
  const showBanner = () => {
    if (!banner) return;
    banner.hidden = false;
    window.setTimeout(() => accept?.focus(), 0);
  };
  const hideBanner = () => {
    if (!banner) return;
    banner.hidden = true;
    if (returnFocus) returnFocus.focus();
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
    showBanner();
  }));
  if (!readConsent()) showBanner();
})();
