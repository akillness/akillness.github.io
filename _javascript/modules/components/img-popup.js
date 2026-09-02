/**
 * Set up image popup
 *
 * See: https://github.com/dimsemenov/Magnific-Popup
 */

export function imgPopup() {
  const $popups = $('.popup');

  if ($popups.length === 0) {
    return;
  }

  $popups.magnificPopup({
    type: 'image',
    closeOnContentClick: true,
    showCloseBtn: false,
    zoom: {
      enabled: true,
      duration: 300,
      easing: 'ease-in-out'
    }
  });
}
