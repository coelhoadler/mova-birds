import { phaseLabels } from './constants.js';
import { gameState } from './state.js';
import { soundSwoosh } from './audio.js';
import { updatePipes } from './pipes.js';
import { states } from './constants.js';

function ensurePhaseLabelElement() {
  if ($('#phase-label').length === 0) {
    $('#flyarea-game').append(
      '<div id="phase-label">' +
        '<div class="phase-text"></div>' +
        '<div id="countdown-container">' +
          '<span class="restart-label">Recomeça:</span>' +
          '<span id="countdown-timer"></span>' +
        '</div>' +
      '</div>'
    );
  }
  if ($('#word-pause-overlay').length === 0) {
    $('body').append('<div id="word-pause-overlay" class="word-pause-overlay"></div>');
  }
}

export function setPhaseLabel(index) {
  ensurePhaseLabelElement();
  const text = phaseLabels[index] || '';
  $('#phase-label .phase-text').text(text);
  if (text) {
    pauseGameForWordEffect();
    spawnPhaseParticles();
  }
}

function startCountdown() {
  gameState.countdownValue = 5;
  const $countdownContainer = $('#countdown-container');
  const $countdown = $('#countdown-timer');
  $countdown.text(gameState.countdownValue);
  $countdownContainer.transition({ opacity: 1 }, 300, 'ease');
  $countdown.css('animation', 'countdownPulse 0.8s ease-out');
  gameState.countdownInterval = setInterval(function () {
    gameState.countdownValue--;
    if (gameState.countdownValue > 0) {
      $countdown.text(gameState.countdownValue);
      $countdown.css('animation', 'countdownPulse 0.8s ease-out');
    } else {
      clearInterval(gameState.countdownInterval);
      gameState.countdownInterval = null;
      $countdownContainer.transition({ opacity: 0 }, 300, 'ease');
    }
  }, 1000);
}

function pauseGameForWordEffect() {
  gameState.gameIsPausedForWord = true;
  $('.animated').css({ 'animation-play-state': 'paused', '-webkit-animation-play-state': 'paused' });
  if (gameState.loopPipeloop) {
    gameState.pauseStartTime = Date.now();
    clearInterval(gameState.loopPipeloop);
    gameState.loopPipeloop = null;
  }
  soundSwoosh.stop();
  soundSwoosh.play();
  $('#word-pause-overlay').addClass('active');
  setTimeout(function () {
    animatePhaseLabelEntryWithZoom();
    setTimeout(startCountdown, 400);
  }, 200);
  gameState.wordPauseTimeout = setTimeout(resumeGameAfterWordEffect, 5000);
}

function resumeGameAfterWordEffect() {
  gameState.gameIsPausedForWord = false;
  if (gameState.countdownInterval) {
    clearInterval(gameState.countdownInterval);
    gameState.countdownInterval = null;
  }
  $('#countdown-container').transition({ opacity: 0 }, 200, 'ease');
  $('.animated').css({ 'animation-play-state': 'running', '-webkit-animation-play-state': 'running' });
  if (gameState.currentstate === states.GameScreen && !gameState.loopPipeloop) {
    const timeSinceLastPipe = Date.now() - gameState.lastPipeTime;
    const lost = Math.floor(timeSinceLastPipe / gameState.pipeInterval);
    if (lost >= 1) {
      updatePipes();
      gameState.lastPipeTime = Date.now();
      gameState.loopPipeloop = setInterval(updatePipes, gameState.pipeInterval);
    } else {
      const remaining = gameState.pipeInterval - (timeSinceLastPipe % gameState.pipeInterval);
      const nextDelay = Math.max(500, remaining);
      setTimeout(function () {
        if (gameState.currentstate === states.GameScreen && !gameState.loopPipeloop) {
          gameState.loopPipeloop = setInterval(updatePipes, gameState.pipeInterval);
        }
      }, nextDelay);
    }
  }
  $('#word-pause-overlay').removeClass('active');
  $('#phase-label').transition({ opacity: 0, scale: 0.9 }, 1000, 'ease');
  if (gameState.wordPauseTimeout) {
    clearTimeout(gameState.wordPauseTimeout);
    gameState.wordPauseTimeout = null;
  }
}

function animatePhaseLabelEntryWithZoom() {
  const $label = $('#phase-label');
  const $text = $('#phase-label .phase-text');
  $label.stop(true, true);
  $text.removeClass('word-effect-glow word-effect-zoom');
  $label.css({ opacity: 0, scale: 0.5 });
  $label.transition({ opacity: 1, scale: 1.2 }, 800, 'easeOutBack');
  $text.addClass('word-effect-glow word-effect-zoom');
  $text.one('animationend webkitAnimationEnd oAnimationEnd MSAnimationEnd', function () {
    $text.removeClass('word-effect-glow');
  });
  setTimeout(() => $text.removeClass('word-effect-zoom'), 2000);
}

function spawnPhaseParticles() {
  const $fly = $('#flyarea-game');
  const $label = $('#phase-label');
  if ($label.length === 0) return;
  const flyOffset = $fly.offset();
  const labelOffset = $label.offset();
  const originX = labelOffset.left - flyOffset.left + ($label.outerWidth() / 2);
  const originY = labelOffset.top - flyOffset.top + ($label.outerHeight() / 2);
  const particlesCount = 24;
  for (let i = 0; i < particlesCount; i++) {
    const angle = Math.random() * Math.PI * 2;
    const distance = 40 + Math.random() * 80;
    const dx = Math.cos(angle) * distance;
    const dy = Math.sin(angle) * distance;
    const size = 4 + Math.random() * 5;
    const hue = 45 + Math.random() * 60;
    const light = 60 + Math.random() * 20;
    const $p = $('<span class="word-effect-particle"></span>').css({
      left: (originX - size / 2) + 'px',
      top: (originY - size / 2) + 'px',
      width: size + 'px',
      height: size + 'px',
      backgroundColor: 'hsl(' + hue + ',95%,' + light + '%)'
    });
    $fly.append($p);
    (function (particle, x, y) {
      const duration = 500 + Math.random() * 400;
      setTimeout(function () {
        particle.transition({ x: x + 'px', y: y + 'px', opacity: 0, scale: 0.2 }, duration, 'ease', function () {
          particle.remove();
        });
      }, Math.random() * 80);
    })($p, dx, dy);
  }
}
