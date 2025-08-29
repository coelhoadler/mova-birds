import { gameState } from './state.js';
import { soundScore, soundSwoosh } from './audio.js';
import { applyThemes, resetThemes } from './themes.js';
import { setPhaseLabel } from './phases.js';
import { skyHueFilters, phaseLabels } from './constants.js';
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
    // Lógica de temas (independente das palavras)
    let themeIndex;
    if (gameState.score <= 5) {
      themeIndex = gameState.score - 1; // pontos 1-5 = índices 0-4
    } else if (gameState.score >= 10 && gameState.score <= 16) {
      themeIndex = 6 + (gameState.score - 10); // pontos 10-16 = índices 6-12
    } else if (gameState.score >= 17 && gameState.score <= 21) {
      themeIndex = 13 + (gameState.score - 17); // pontos 17-21 = índices 13-17
    } else if (gameState.score >= 6 && gameState.score <= 9) {
      themeIndex = 5; // pontos 6-9 = índice 5 (tema intermediário)
    } else {
      themeIndex = Math.floor((gameState.score - 1) / 3); // lógica antiga para pontos > 21
    }
    
    // Aplica tema se mudou
    if (themeIndex >= 0 && themeIndex < skyHueFilters.length && themeIndex !== gameState.skyThemeIndex) {
      gameState.skyThemeIndex = themeIndex;
      applyThemes(themeIndex);
    }

    // Lógica de palavras: aparecem de 3 em 3 (pontos 1, 4, 7, 10, 13, 16, 19...)
    if ((gameState.score - 1) % 3 === 0) {
      const phaseIndex = Math.floor((gameState.score - 1) / 3);
      if (phaseIndex >= 0 && phaseIndex < phaseLabels.length) {
        setPhaseLabel(phaseIndex);
      }
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
