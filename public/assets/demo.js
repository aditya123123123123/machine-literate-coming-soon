(() => {
  'use strict';
  const choices = [...document.querySelectorAll('.shape-choice')];
  const check = document.querySelector('#check-answer');
  const retry = document.querySelector('#try-again');
  const feedback = document.querySelector('#demo-feedback');
  if (!choices.length || !check || !retry || !feedback) return;
  let selected = null;
  let checked = false;

  function select(choice) {
    if (checked) return;
    selected = choice.dataset.shape;
    choices.forEach(button => button.setAttribute('aria-pressed', String(button === choice)));
    check.disabled = false;
  }
  choices.forEach(choice => {
    choice.setAttribute('aria-pressed', 'false');
    choice.disabled = false;
    choice.addEventListener('click', () => select(choice));
  });
  check.addEventListener('click', () => {
    if (!selected || checked) return;
    checked = true;
    feedback.textContent = selected === 'black-triangle'
      ? 'Right. It may think "yellow" means triangle, so a black triangle throws it off.'
      : 'Not quite. It practiced on ones just like that. Try another.';
    choices.forEach(button => { button.disabled = true; });
    check.disabled = true;
    retry.hidden = false;
    retry.focus();
  });
  retry.addEventListener('click', () => {
    selected = null;
    checked = false;
    choices.forEach(button => {
      button.disabled = false;
      button.setAttribute('aria-pressed', 'false');
    });
    feedback.textContent = '';
    check.disabled = true;
    retry.hidden = true;
    choices[0].focus();
  });
  document.documentElement.classList.add('js');
})();
