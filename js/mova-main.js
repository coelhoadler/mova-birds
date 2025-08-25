
// Arquivo principal orquestrador após refatoração modular
import { getCookie } from './utils.js';
import { debugmode, states, START_POSITION } from './constants.js';
import { gameState } from './state.js';
import { soundSwoosh } from './audio.js';
import { updatePipes } from './pipes.js';
import { playerJump, physicsStep, playerDead, updatePlayer } from './player.js';
import { setBigScore, playerScore, resetScoreState, showScore } from './score.js';

// Splash inicial
function showSplash() {
   gameState.currentstate = states.SplashScreen;
   gameState.velocity = 0;
   gameState.position = START_POSITION;
   gameState.rotation = 0;
   resetScoreState();
   $('#player').css({ y: 0, x: 0 });
   updatePlayer($('#player'));
   soundSwoosh.stop(); soundSwoosh.play();
   $('.pipe').remove();
   gameState.pipes = [];
   $('.animated').css({ 'animation-play-state': 'running', '-webkit-animation-play-state': 'running' });
   $('#splash').transition({ opacity: 1, display: 'block' }, 2000, 'ease');
   $('#modal-boas-vindas').transition({ opacity: 1, display: 'block' }, 2000, 'ease');
}

function startGame() {
   gameState.currentstate = states.GameScreen;
   $('#splash').stop().transition({ opacity: 0, display: 'none' }, 500, 'ease');
   $('#modal-boas-vindas').stop().transition({ opacity: 0, display: 'none' }, 500, 'ease');
   setBigScore();
   if (debugmode) $('.boundingbox').show();
   const updaterate = 1000.0 / 60.0;
   gameState.loopGameloop = setInterval(gameloop, updaterate);
   gameState.lastPipeTime = Date.now();
   gameState.loopPipeloop = setInterval(updatePipes, gameState.pipeInterval);
   playerJump();
}

function gameloop() {
   if (gameState.gameIsPausedForWord) return;
   physicsStep();
   const box = document.getElementById('player').getBoundingClientRect();
   const origwidth = 34.0;
   const origheight = 24.0;
   const boxwidth = origwidth - (Math.sin(Math.abs(gameState.rotation) / 90) * 8);
   const boxheight = (origheight + box.height) / 2;
   const boxleft = ((box.width - boxwidth) / 2) + box.left;
   const boxtop = ((box.height - boxheight) / 2) + box.top;
   const boxright = boxleft + boxwidth;
   const boxbottom = boxtop + boxheight;
   if (box.bottom >= $('#footer-game').offset().top) { playerDead(); return; }
   const ceiling = $('#ceiling');
   if (boxtop <= (ceiling.offset().top + ceiling.height())) gameState.position = 0;
   if (gameState.pipes[0] == null) return;
   const nextpipe = gameState.pipes[0];
   const nextpipeupper = nextpipe.children('.pipe_upper');
   const pipetop = nextpipeupper.offset().top + nextpipeupper.height();
   const pipeleft = nextpipeupper.offset().left - 2;
   const piperight = pipeleft + gameState.pipewidth;
   const pipebottom = pipetop + gameState.pipeheight;
   if (boxright > pipeleft) {
      if (!(boxtop > pipetop && boxbottom < pipebottom)) { playerDead(); return; }
   }
   if (boxleft > piperight) {
      gameState.pipes.splice(0, 1);
      playerScore(() => {
         clearInterval(gameState.loopGameloop);
         clearInterval(gameState.loopPipeloop);
         gameState.loopGameloop = null;
         gameState.loopPipeloop = null;
         gameState.currentstate = states.ScoreScreen;
         showScore();
      });
   }
}

function screenClick() {
   if (gameState.currentstate === states.GameScreen && !gameState.gameIsPausedForWord) playerJump();
   else if (gameState.currentstate === states.SplashScreen) startGame();
}

$(document).keydown(function (e) { if (e.keyCode === 32) screenClick(); });
if ('ontouchstart' in window) $(document).on('touchstart', screenClick); else $(document).on('mousedown', screenClick);

$('#replay, #jogar-novamente').click(function () {
   if (!gameState.replayclickable) return;
   gameState.replayclickable = false;
   soundSwoosh.stop(); soundSwoosh.play();
   $('#modal-vencedor').css({ y: '-40px', opacity: 0, display: 'none' }, 1000, 'ease');
   $('#scoreboard').transition({ y: '-40px', opacity: 0 }, 1000, 'ease', function () {
      $('#scoreboard').css('display', 'none');
      showSplash();
   });
});

$('#acessar-quiz').click(function () { location.href = 'https://www.mova.org.br/quiz'; });

$(document).ready(function () {
   const savedscore = getCookie('highscore');
   if (savedscore !== '') gameState.highscore = parseInt(savedscore);
   showSplash();
});
