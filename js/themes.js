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

  // Atualiza sprite do jogador nas fases 0–4 para a versão rosa
  const playerSprite = index <= 4
    ? 'assets/fase-rosa/person-rosa.png'
    : 'assets/squircle.png';
  $('#player').css({
    'background-image': 'url(' + playerSprite + ')'
  });
}

export function resetThemes() {
  localStorage.removeItem('pipeClass');
  $('#background-game').css({
    'background-color': blueBgColor,
    'background-image': 'url(assets/sky-azul.png)'
  });
  $('#footer-game').css({
    'background-image': 'url(assets/land-azul.png)',
    'background-color': lightBlueFooterColor
  });
  $('#ceiling').css('filter', 'hue-rotate(176deg)');
  // Reseta sprite do jogador para o padrão
  $('#player').css({
    'background-image': 'url(assets/squircle.png)'
  });
}
