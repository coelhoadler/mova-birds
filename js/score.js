import { gameState } from './state.js';
import { soundScore, soundSwoosh } from './audio.js';
import { applyThemes, resetThemes } from './themes.js';
import { setPhaseLabel } from './phases.js';
import { skyHueFilters } from './constants.js';
import { setCookie } from './utils.js';

export function setBigScore(erase) {
  const elemscore = $('#bigscore');
  elemscore.empty();
  if (erase) return;
  gameState.score.toString().split('').forEach(d =>
    elemscore.append("<img src='assets/font_big_" + d + ".png' alt='" + d + "'>")
  );
}

export function setSmallScore() {
  const elem = $('#currentscore');
  elem.empty();
  gameState.score.toString().split('').forEach(d =>
    elem.append("<img src='assets/font_small_" + d + ".png' alt='" + d + "'>")
  );
}

export function setHighScore() {
  const elem = $('#highscore');
  elem.empty();
  gameState.highscore.toString().split('').forEach(d =>
    elem.append("<img src='assets/font_small_" + d + ".png' alt='" + d + "'>")
  );
}

export function setMedal() {
  const elem = $('#medal');
  elem.empty();
  const s = gameState.score;
  if (s < 5) return false;
  if (s >= 21) gameState.medal = 'platinum';
  else if (s >= 18) gameState.medal = 'gold';
  else if (s >= 10) gameState.medal = 'silver';
  else if (s >= 5) gameState.medal = 'bronze';
  elem.append('<img src="assets/medal_' + gameState.medal + '.png" alt="' + gameState.medal + '">');
  return true;
}

export function showScore() {
  $('#scoreboard').css('display', 'flex');
  setBigScore(true);
  if (gameState.score > gameState.highscore) {
    gameState.highscore = gameState.score;
    setCookie('highscore', gameState.highscore, 999);
  }
  setSmallScore();
  setHighScore();
  const wonmedal = setMedal();
  soundSwoosh.stop(); soundSwoosh.play();
  $('#scoreboard').css({ y: '40px', opacity: 0 });
  $('#replay').css({ y: '40px', opacity: 0 });
  if (gameState.score >= gameState.TOTAL_POINTS) {
    $('#scoreboard').css({ display: 'none' });
    $('#modal-vencedor').css({ y: '0px', opacity: 1, display: 'block' }, 600, 'ease');
  }
  $('#scoreboard').transition({ y: '0px', opacity: 1 }, 600, 'ease', function () {
    soundSwoosh.stop(); soundSwoosh.play();
    $('#replay').transition({ y: '0px', opacity: 1 }, 600, 'ease');
    if (wonmedal) {
      $('#medal').css({ scale: 2, opacity: 0 }).transition({ opacity: 1, scale: 1 }, 1200, 'ease');
    }
  });
  gameState.replayclickable = true;
}

export function playerScore(onGameFinished) {
  gameState.score += 1;
  soundScore.stop(); soundScore.play();
  setBigScore();
  if (gameState.score >= 1) {
    const blockIndex = Math.floor((gameState.score - 1) / 3);
    if (blockIndex >= 0 && blockIndex < skyHueFilters.length && blockIndex !== gameState.skyThemeIndex) {
      gameState.skyThemeIndex = blockIndex;
      applyThemes(blockIndex);
      setPhaseLabel(blockIndex);
    }
  }
  if (!gameState.gameFinished && gameState.score >= gameState.TOTAL_POINTS) {
    gameState.gameFinished = true;
    onGameFinished();
  }
}

export function resetScoreState() {
  gameState.score = 0;
  gameState.skyThemeIndex = -1;
  gameState.gameFinished = false;
  resetThemes();
  setPhaseLabel(-1);
}
