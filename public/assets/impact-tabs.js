// Progressive enhancement: all partner sections remain readable without JavaScript.
(() => {
  const list = document.querySelector('[data-partner-tabs]');
  if (!list) return;
  const tabs = [...list.querySelectorAll('button')];
  const panels = tabs.map(tab => document.getElementById(tab.getAttribute('aria-controls')));
  if (panels.some(panel => !panel)) return;
  list.setAttribute('role', 'tablist');
  list.setAttribute('aria-label', 'Partner opportunities');
  tabs.forEach((tab, index) => {
    tab.setAttribute('role', 'tab');
    panels[index].setAttribute('role', 'tabpanel');
    panels[index].setAttribute('aria-labelledby', tab.id);
    panels[index].tabIndex = 0;
    panels[index].querySelector('.panel-heading').hidden = true;
    tab.addEventListener('click', () => activate(index));
    tab.addEventListener('keydown', event => {
      let next;
      if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
      else if (event.key === 'ArrowLeft') next = (index + tabs.length - 1) % tabs.length;
      else if (event.key === 'Home') next = 0;
      else if (event.key === 'End') next = tabs.length - 1;
      else return;
      event.preventDefault();
      activate(next);
      tabs[next].focus();
    });
  });
  function activate(active) {
    tabs.forEach((tab, index) => {
      const selected = index === active;
      tab.setAttribute('aria-selected', String(selected));
      tab.tabIndex = selected ? 0 : -1;
      panels[index].hidden = !selected;
    });
  }
  activate(0);
  document.querySelector('.partner-panels').classList.add('is-enhanced');
  list.hidden = false;
})();
