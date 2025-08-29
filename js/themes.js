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
import { updateExistingPipesColor } from './pipes.js';

export function applyThemes(index) {
  const hexColor = skyHexColors[index];
  if (!hexColor) return;
  const bgImage = skyBgImage[index];
  const landImage = landBgImage[index];
  const footerColor = lightHexFooterColors[index];
  const pipeClass = pipeBgClass[index];

  localStorage.setItem('pipeClass', pipeClass);

  // Atualiza cores dos tubos existentes na tela
  updateExistingPipesColor(pipeClass);

  $('#background-game').css({
    'background-color': hexColor,
    'background-image': 'url(' + bgImage + ')'
  });
  $('#footer-game').css({
    'background-image': 'url(' + landImage + ')',
    'background-color': footerColor
  });
  $('#ceiling').css('filter', ceilingHueColors[index]);

  // Atualiza sprite do jogador baseado na fase
  let playerSprite;
  if (index <= 4) {
    playerSprite = 'assets/fase-rosa/person-rosa.png';
  } else if (index >= 6 && index <= 12) {
    // Pontos 10-16: person-roxo
    playerSprite = 'assets/fase-roxa/person-roxo.png';
  } else if (index >= 13) {
    // Pontos 17-21: person-blue
    playerSprite = 'assets/fase-azul/person-blue.png';
  } else {
    playerSprite = 'assets/squircle.png';
  }
  $('#player').css({
    'background-image': 'url(' + playerSprite + ')'
  });
}

export function resetThemes() {
  localStorage.removeItem('pipeClass');
  
  // Reseta cores dos tubos existentes para azul (padrão)
  updateExistingPipesColor('azul');
  
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
