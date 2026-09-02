export function back2top() {
  const btn = document.querySelector('#back-to-top');

  if (!btn) {
    return;
  }

  let isVisible = false;
  let scheduled = false;

  function update() {
    scheduled = false;
    const shouldShow = window.scrollY > 50;

    if (shouldShow === isVisible) {
      return;
    }

    isVisible = shouldShow;
    btn.classList.toggle('is-visible', shouldShow);
  }

  window.addEventListener(
    'scroll',
    () => {
      if (!scheduled) {
        scheduled = true;
        window.requestAnimationFrame(update);
      }
    },
    { passive: true }
  );

  update();

  btn.addEventListener('click', () => {
    const behavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
    window.scrollTo({ top: 0, behavior });
  });
}
