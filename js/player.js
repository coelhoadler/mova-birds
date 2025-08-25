import { gameState } from './state.js';
import { GRAVITY, JUMP_VELOCITY, states } from './constants.js';
import { soundJump, soundHit, soundDie } from './audio.js';
import { showScore } from './score.js';

export function updatePlayer(el) {
  gameState.rotation = Math.min((gameState.velocity / 10) * 90, 90);
  $(el).css({ rotate: gameState.rotation, top: gameState.position });
}

export function playerJump() {
  gameState.velocity = JUMP_VELOCITY;
  soundJump.stop(); soundJump.play();
}

export function physicsStep() {
  gameState.velocity += GRAVITY;
  gameState.position += gameState.velocity;
  updatePlayer($('#player'));
}

export function playerDead() {
  $('.animated').css({ 'animation-play-state': 'paused', '-webkit-animation-play-state': 'paused' });
  const playerbottom = $('#player').position().top + $('#player').width();
  const floor = $('#flyarea-game').height();
  const movey = Math.max(0, floor - playerbottom);
  $('#player').transition({ y: movey + 'px', rotate: 90 }, 1000, 'easeInOutCubic');
  gameState.currentstate = states.ScoreScreen;
  clearInterval(gameState.loopGameloop);
  clearInterval(gameState.loopPipeloop);
  gameState.loopGameloop = null;
  gameState.loopPipeloop = null;
  if (isIncompatible.any()) {
    showScore();
  } else {
    soundHit.play().bindOnce('ended', function () {
      soundDie.play().bindOnce('ended', function () { showScore(); });
    });
  }
}

// Compatibilidade (mantido)
var isIncompatible = {
  Android: function () { return navigator.userAgent.match(/Android/i); },
  BlackBerry: function () { return navigator.userAgent.match(/BlackBerry/i); },
  iOS: function () { return navigator.userAgent.match(/iPhone|iPad|iPod/i); },
  Opera: function () { return navigator.userAgent.match(/Opera Mini/i); },
  Safari: function () { return (navigator.userAgent.match(/OS X.*Safari/) && !navigator.userAgent.match(/Chrome/)); },
  Windows: function () { return navigator.userAgent.match(/IEMobile/i); },
  any: function () { return (isIncompatible.Android() || isIncompatible.BlackBerry() || isIncompatible.iOS() || isIncompatible.Opera() || isIncompatible.Safari() || isIncompatible.Windows()); }
};
