import {
  skyHexColors,
  skyBgImage,
  landBgImage,
  lightHexFooterColors,
  pipeBgClass,
  ceilingHueColors,
  blueBgColor,
  lightBlueFooterColor
} from './constants.js';

export function applyThemes(index) {
  const hexColor = skyHexColors[index];
  if (!hexColor) return;
  const bgImage = skyBgImage[index];
  const landImage = landBgImage[index];
  const footerColor = lightHexFooterColors[index];
  const pipeClass = pipeBgClass[index];

  localStorage.setItem('pipeClass', pipeClass);

  $('#background-game').css({
    'background-color': hexColor,
    'background-image': 'url(' + bgImage + ')'
  });
  $('#footer-game').css({
    'background-image': 'url(' + landImage + ')',
    'background-color': footerColor
  });
  $('#ceiling').css('filter', ceilingHueColors[index]);
}

export function resetThemes() {
  localStorage.removeItem('pipeClass');
  $('#background-game').css({
    'background-color': blueBgColor,
    'background-image': 'url(../assets/sky-azul.png)'
  });
  $('#footer-game').css({
    'background-image': 'url(../assets/land-azul.png)',
    'background-color': lightBlueFooterColor
  });
  $('#ceiling').css('filter', 'hue-rotate(176deg)');
}
