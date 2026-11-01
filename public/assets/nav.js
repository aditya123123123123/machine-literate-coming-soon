// Progressive enhancement: navigation stays visible if JavaScript is unavailable.
(() => {
  const header = document.querySelector('.site-header');
  const toggle = header?.querySelector('.nav-toggle');
  const nav = header?.querySelector('.site-nav');
  if (!toggle || !nav) return;
  const mobile = matchMedia('(max-width: 800px)');
  function close(restoreFocus = false) {
    nav.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    if (restoreFocus) toggle.focus();
  }
  toggle.hidden = false;
  header.classList.add('nav-ready');
  header.classList.toggle('nav-mobile', mobile.matches);
  toggle.addEventListener('click', () => {
    const open = toggle.getAttribute('aria-expanded') !== 'true';
    toggle.setAttribute('aria-expanded', String(open));
    nav.classList.toggle('is-open', open);
  });
  header.addEventListener('keydown', event => {
    if (event.key === 'Escape' && mobile.matches && nav.classList.contains('is-open')) {
      event.preventDefault();
      close(true);
    }
  });
  document.addEventListener('click', event => {
    if (!header.contains(event.target) && mobile.matches) close(nav.contains(document.activeElement));
  });
  header.addEventListener('focusout', event => {
    // Safari may blur a focused button on pointer activation without focusing
    // another element. That is not a keyboard exit; outside clicks are handled above.
    if (event.relatedTarget && !header.contains(event.relatedTarget)) close();
  });
  nav.addEventListener('click', event => {
    if (event.target.closest('a') && mobile.matches) close(true);
  });
  mobile.addEventListener('change', () => {
    const active = document.activeElement;
    // Move focus before hiding links: CSS breakpoint hiding can otherwise blur
    // the active link before this media-query event reaches JavaScript.
    if (mobile.matches) close(nav.contains(active));
    else {
      close();
      if (active === toggle) nav.querySelector('[aria-current="page"]')?.focus();
    }
    header.classList.toggle('nav-mobile', mobile.matches);
  });
})();
