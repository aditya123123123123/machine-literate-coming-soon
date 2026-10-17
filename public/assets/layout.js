/* Connect annotations to live card geometry, including answer-state reflow. */
(() => {
  const root = document.querySelector('.annotated-demo');
  if (!root) return;
  const card = root.querySelector('.lesson-frame');
  function layout() {
    if (innerWidth <= 900) return;
    const origin = root.getBoundingClientRect(), box = card.getBoundingClientRect();
    root.style.setProperty('--card-height', `${box.height}px`);
    const robot = root.querySelector('.hint-robot');
    robot.style.left = `${box.right - origin.left - 22}px`;
    robot.style.top = `${box.bottom - origin.top - robot.getBoundingClientRect().height}px`;
    root.querySelectorAll('.note-connectors path').forEach(path => {
      const note = root.querySelector(path.dataset.note).getBoundingClientRect();
      const target = root.querySelector(path.dataset.target).getBoundingClientRect();
      const left = note.left < box.left;
      const x1 = (left ? note.right + 16 : note.left - 16) - origin.left;
      const y1 = note.top + 5 - origin.top;
      const x2 = (left ? target.left + 2 : target.right - 2) - origin.left;
      const y2 = target.top + target.height / 2 - origin.top;
      const elbow = (left ? box.left - 12 : box.right + 12) - origin.left;
      path.setAttribute('d', `M ${x1} ${y1} H ${elbow} V ${y2} H ${x2}`);
      path.dataset.endpoint = JSON.stringify({x:x2, y:y2});
    });
  }
  new ResizeObserver(layout).observe(card);
  addEventListener('resize', layout);
  document.fonts.ready.then(layout);
})();
