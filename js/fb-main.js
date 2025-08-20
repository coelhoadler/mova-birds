
import { getCookie, setCookie } from './utils.js';

/* 
   /// DEFININDO AS VARIÁVEIS ////
*/

// Modo de depuração do jogo - Lógico (true or false)
var debugmode = false;

var medal = '';

// Objeto para congelar dependendo dos estados
var states = Object.freeze({
   SplashScreen: 0,
   GameScreen: 1,
   ScoreScreen: 2
});

// Definição das vars de lógica
var currentstate;
var gravity = 0.25;
var velocity = 0;
var position = 180;
var rotation = 0;
var jump = -4.6;
var TOTAL_POINTS = 21; // total de pontos para finalizar o jogo

// Definição das vars da pontuação min e máxima
var score = 0;
var highscore = 0;

// Definição das vars do cano
var pipeheight = 130;
var pipewidth = 52;
var pipes = new Array();

// Controle de mudança de cor do céu
var skyThemeIndex = -1; // começa sem tema aplicado; o primeiro virá no 3º ponto
var skyHueFilters = ['hue-rotate(20deg)', 'hue-rotate(60deg)', 'hue-rotate(100deg)', 'hue-rotate(160deg)', 'hue-rotate(200deg)', 'hue-rotate(260deg)', 'hue-rotate(320deg)'];
var skyHexColors = ['#2A5595', '#2A5595', '#2A5595', '#6D2077', '#6D2077', '#E43886', '#E43886']; // 7 cores hex para usar no lugar do filtro (preparado para futuro)
var defaultSkyColor = '#2A5595';
var gameFinished = false; // sinaliza finalização no 21º ponto

// Labels de fases (7 fases)
var phaseLabels = [
   'Onboarding do tomador',
   'Análise de crédito',
   'Antifraude',
   'Formalização',
   'Bancarização',
   'Recebimento',
   'Cobrança'
];

function ensurePhaseLabelElement() {
   if ($('#phase-label').length === 0) {
      // cria o elemento uma vez dentro da área de voo com estrutura integrada
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
   
   // Criar overlay para pausa se não existir
   if ($('#word-pause-overlay').length === 0) {
      $('body').append('<div id="word-pause-overlay" class="word-pause-overlay"></div>');
   }
}

function setPhaseLabel(index) {
   ensurePhaseLabelElement();
   var text = phaseLabels[index] || '';
   $('#phase-label .phase-text').text(text);
   if (text) {
      // Usar o novo efeito de pausa e zoom
      pauseGameForWordEffect();
      spawnPhaseParticles();
   }
}

// Função para iniciar a contagem regressiva
function startCountdown() {
   countdownValue = 3;
   var $countdownContainer = $('#countdown-container');
   var $countdown = $('#countdown-timer');
   
   // Mostrar o container e iniciar com 3
   $countdown.text(countdownValue);
   $countdownContainer.transition({ opacity: 1 }, 300, 'ease');
   $countdown.css('animation', 'countdownPulse 0.8s ease-out');
   
   countdownInterval = setInterval(function() {
      countdownValue--;
      
      if (countdownValue > 0) {
         $countdown.text(countdownValue);
         $countdown.css('animation', 'countdownPulse 0.8s ease-out');
      } else {
         // Chegou ao fim, parar contador
         clearInterval(countdownInterval);
         $countdownContainer.transition({ opacity: 0 }, 300, 'ease');
      }
   }, 1000);
}

// Função para pausar o jogo e aplicar efeito de zoom na palavra
function pauseGameForWordEffect() {
   gameIsPausedForWord = true;
   
   // Pausar todas as animações do jogo
   $(".animated").css('animation-play-state', 'paused');
   $(".animated").css('-webkit-animation-play-state', 'paused');
   
   // Pausar temporariamente o loop de criação de tubos
   if (loopPipeloop) {
      pauseStartTime = Date.now();
      clearInterval(loopPipeloop);
      loopPipeloop = null;
   }
   
   // Som especial para destacar a palavra
   soundSwoosh.stop();
   soundSwoosh.play();
   
   // Mostrar overlay escuro
   $('#word-pause-overlay').addClass('active');
   
   // Aplicar zoom na palavra após um pequeno delay
   setTimeout(function() {
      animatePhaseLabelEntryWithZoom();
      // Iniciar contagem regressiva após a palavra aparecer
      setTimeout(function() {
         startCountdown();
      }, 400);
   }, 200);
   
   // Retomar o jogo após 3 segundos
   wordPauseTimeout = setTimeout(function() {
      resumeGameAfterWordEffect();
   }, 3000);
}

// Função para retomar o jogo após o efeito da palavra
function resumeGameAfterWordEffect() {
   gameIsPausedForWord = false;
   
   // Limpar contador se ainda estiver rodando
   if (countdownInterval) {
      clearInterval(countdownInterval);
      countdownInterval = null;
   }
   
   // Esconder container do contador
   $('#countdown-container').transition({ opacity: 0 }, 200, 'ease');
   
   // Retomar todas as animações
   $(".animated").css('animation-play-state', 'running');
   $(".animated").css('-webkit-animation-play-state', 'running');
   
   // Reiniciar o loop de criação de tubos se ainda estivermos no jogo
   if (currentstate === states.GameScreen && !loopPipeloop) {
      // Calcular tempo perdido durante a pausa
      var pauseDuration = Date.now() - pauseStartTime;
      var timeSinceLastPipe = Date.now() - lastPipeTime;
      
      // Se já passou tempo suficiente para um novo tubo, criar imediatamente
      if (timeSinceLastPipe >= pipeInterval) {
         updatePipes();
         lastPipeTime = Date.now();
      }
      
      // Calcular delay para o próximo tubo baseado no tempo perdido
      var nextPipeDelay = Math.max(200, pipeInterval - (timeSinceLastPipe % pipeInterval));
      
      // Reiniciar com delay ajustado
      setTimeout(function() {
         if (currentstate === states.GameScreen && !loopPipeloop) {
            loopPipeloop = setInterval(updatePipes, pipeInterval);
         }
      }, nextPipeDelay);
   }
   
   // Esconder overlay escuro
   $('#word-pause-overlay').removeClass('active');
   
   // Fade out da palavra gradualmente
   var $label = $('#phase-label');
   $label.transition({ opacity: 0, scale: 0.9 }, 1000, 'ease');
   
   if (wordPauseTimeout) {
      clearTimeout(wordPauseTimeout);
      wordPauseTimeout = null;
   }
}

// Triggers word effect animation with shimmer glow and zoom effect
function animatePhaseLabelEntryWithZoom() {
   var $label = $('#phase-label');
   var $text = $('#phase-label .phase-text');
   
   $label.stop(true, true);
   $text.removeClass('word-effect-glow word-effect-zoom');
   
   // Initial state - smaller and transparent
   $label.css({ opacity: 0, scale: 0.5 });
   
   // Animate to appear with zoom effect (escala reduzida)
   $label.transition({ opacity: 1, scale: 1.2 }, 800, 'easeOutBack');
   
   // Apply both shimmer and zoom effects to the text
   $text.addClass('word-effect-glow word-effect-zoom');
   
   // Remove classes after animation
   $text.one('animationend webkitAnimationEnd oAnimationEnd MSAnimationEnd', function () {
      $text.removeClass('word-effect-glow');
   });
   
   setTimeout(function() {
      $text.removeClass('word-effect-zoom');
   }, 2000);
}

// Triggers word effect animation with shimmer glow on center label (função original mantida para compatibilidade)
function animatePhaseLabelEntry() {
   var $label = $('#phase-label');
   var $text = $('#phase-label .phase-text');
   
   $label.stop(true, true);
   $text.removeClass('word-effect-glow');
   // initial state for entrance
   $label.css({ opacity: 0, scale: 0.85 });
   // animate to appear
   $label.transition({ opacity: 1, scale: 1 }, 350, 'ease');
   // apply pulsing shimmer effect to text
   $text.addClass('word-effect-glow');
   $text.one('animationend webkitAnimationEnd oAnimationEnd MSAnimationEnd', function () {
      $text.removeClass('word-effect-glow');
   });
}

// Cria partículas coloridas ao redor do label para efeito de jogo
function spawnPhaseParticles() {
   var $fly = $('#flyarea-game');
   var $label = $('#phase-label');
   if ($label.length === 0) return;

   var flyOffset = $fly.offset();
   var labelOffset = $label.offset();
   var originX = labelOffset.left - flyOffset.left + ($label.outerWidth() / 2);
   var originY = labelOffset.top - flyOffset.top + ($label.outerHeight() / 2);

   var particlesCount = 24;
   for (var i = 0; i < particlesCount; i++) {
      var angle = Math.random() * Math.PI * 2; // 0..2π
      var distance = 40 + Math.random() * 80; // 40..120 px
      var dx = Math.cos(angle) * distance;
      var dy = Math.sin(angle) * distance;

      var size = 4 + Math.random() * 5; // 4..9 px
      var hue = 45 + Math.random() * 60; // amarelos/laranjas vibrantes
      var light = 60 + Math.random() * 20; // 60..80%

      var $p = $('<span class="word-effect-particle"></span>');
      $p.css({
         left: (originX - size / 2) + 'px',
         top: (originY - size / 2) + 'px',
         width: size + 'px',
         height: size + 'px',
         backgroundColor: 'hsl(' + hue + ', 95%,' + light + '%)'
      });

      $fly.append($p);

      // pequena defasagem aleatória para dar naturalidade
      (function (particle, x, y) {
         var duration = 500 + Math.random() * 400; // 500..900ms
         setTimeout(function () {
            particle.transition({
               x: x + 'px',
               y: y + 'px',
               opacity: 0,
               scale: 0.2
            }, duration, 'ease', function () {
               particle.remove();
            });
         }, Math.random() * 80);
      })($p, dx, dy);
   }
}

function applySkyTheme(index) {
   var hexColor = skyHexColors[index];
   if (hexColor) {
      // quando cores HEX forem definidas, usar cor sólida e remover filtros
      $("#background-game").css('background-color', hexColor);
      $("#background-game").css('filter', 'none');
      $("#background-game").css('-webkit-filter', 'none');
   } else {
      // fallback atual: usar filtro de matiz
      var filter = skyHueFilters[index] || 'none';
      $("#background-game").css('background-color', defaultSkyColor);
      $("#background-game").css('filter', filter);
      $("#background-game").css('-webkit-filter', filter);
   }
}

function resetSkyTheme() {
   $("#background-game").css('background-color', defaultSkyColor);
   $("#background-game").css('filter', 'none');
   $("#background-game").css('-webkit-filter', 'none');
}

// Definição da var de replay
var replayclickable = false;

// Definição dos sons
var volume = 30;
var soundJump = new buzz.sound("assets/sounds/sfx_wing.ogg");
var soundScore = new buzz.sound("assets/sounds/sfx_point.ogg");
var soundHit = new buzz.sound("assets/sounds/sfx_hit.ogg");
var soundDie = new buzz.sound("assets/sounds/sfx_die.ogg");
var soundSwoosh = new buzz.sound("assets/sounds/sfx_swooshing.ogg");
buzz.all().setVolume(volume);

// Definição dos loops do jogo e dos canos
var loopGameloop;
var loopPipeloop;

// Variáveis para controle de pausa por palavra
var gameIsPausedForWord = false;
var wordPauseTimeout;
var countdownInterval;
var countdownValue;

// Variáveis para controle de timing dos tubos
var lastPipeTime = 0;
var pipeInterval = 1400; // intervalo padrão entre tubos
var pauseStartTime = 0;

// Assim que o documento carregar começa a depuração do jogo
$(document).ready(function () {
   if (window.location.search == "?easy")
      pipeheight = 200;

   // capturar o highscore pelo cookie
   var savedscore = getCookie("highscore");
   if (savedscore != "")
      highscore = parseInt(savedscore);

   // Começar com a tela inicial
   showSplash();
});

/* 
   /// FUNÇÕES DO JOGO ////
*/

// Função mostrar a splash screen
function showSplash() {
   // variavel para armazenar o estado do jogo e tratar posteriormente os eventos
   currentstate = states.SplashScreen;

   // setar os valores iniciais
   velocity = 0;
   position = 180;
   rotation = 0;
   score = 0;

   // resetar as posições do player para o novo jogo
   $("#player").css({ y: 0, x: 0 });
   updatePlayer($("#player"));

   soundSwoosh.stop();
   soundSwoosh.play();

   // limpar todos os canos para iniciar o novo jogo
   $(".pipe").remove();
   pipes = new Array();

   // reset do tema do céu e status de finalização
   skyThemeIndex = -1;
   resetSkyTheme();
   gameFinished = false;
   setPhaseLabel(-1);

   // começar todas as animações dos sprites novamente
   $(".animated").css('animation-play-state', 'running');
   $(".animated").css('-webkit-animation-play-state', 'running');

   // fade para a splash screen aparecer
   $("#splash").transition({ opacity: 1, display: 'block' }, 2000, 'ease');
   $("#modal-boas-vindas").transition({ opacity: 1, display: 'block' }, 2000, 'ease');
}

// Função para começar o jogo
function startGame() {
   // variavel para armazenar o estado do jogo e tratar posteriormente os eventos
   currentstate = states.GameScreen;

   // fade para a splash screen sumir
   $("#splash").stop();
   $("#splash").transition({ opacity: 0, display: 'none' }, 500, 'ease');

   // fade para o modal de boas-vindas sumir
   $("#modal-boas-vindas").stop();
   $("#modal-boas-vindas").transition({ opacity: 0, display: 'none' }, 500, 'ease');

   // ir mostrando o score no topo do jogo
   setBigScore();

   // debug mode para considerar as bordas ao redor
   if (debugmode) {
      $(".boundingbox").show();
   }

   // começar os loops do jogo - aumentar o tempo e intervalo de canos
   var updaterate = 1000.0 / 60.0; // 60 fps
   loopGameloop = setInterval(gameloop, updaterate);
   
   // Registrar tempo inicial e começar loop de tubos
   lastPipeTime = Date.now();
   loopPipeloop = setInterval(updatePipes, pipeInterval);

   // ação de pulo para começar o jogo
   playerJump();
}

// Função para upar a velocidade e a rotação do palyer
function updatePlayer(player) {
   // Rotação
   rotation = Math.min((velocity / 10) * 90, 90);

   // Aplicando a rotação por css (X,Y)
   $(player).css({ rotate: rotation, top: position });
}

// Função de Game Loop
function gameloop() {
   // Se o jogo está pausado por palavra, não executa o loop
   if (gameIsPausedForWord) {
      return;
   }

   var player = $("#player");

   // Upar a posição e velocidade do player 
   velocity += gravity;
   position += velocity;

   // Aplicar os novos valores do player
   updatePlayer(player);

   // Criar o hack de bouding box para o player
   var box = document.getElementById('player').getBoundingClientRect();
   var origwidth = 34.0;
   var origheight = 24.0;

   var boxwidth = origwidth - (Math.sin(Math.abs(rotation) / 90) * 8);
   var boxheight = (origheight + box.height) / 2;
   var boxleft = ((box.width - boxwidth) / 2) + box.left;
   var boxtop = ((box.height - boxheight) / 2) + box.top;
   var boxright = boxleft + boxwidth;
   var boxbottom = boxtop + boxheight;

   // Se acertar o footer, o player morre e retorna o jogo
   if (box.bottom >= $("#footer-game").offset().top) {
      playerDead();
      return;
   }

   // Se tentar passar pelo topo, zera a posição dele no topo
   var ceiling = $("#ceiling");
   if (boxtop <= (ceiling.offset().top + ceiling.height()))
      position = 0;

   // Se não houver nenhum cano no jogo retorna
   if (pipes[0] == null)
      return;

   // Determina a área para os próximos canos
   var nextpipe = pipes[0];
   var nextpipeupper = nextpipe.children(".pipe_upper");

   var pipetop = nextpipeupper.offset().top + nextpipeupper.height();
   var pipeleft = nextpipeupper.offset().left - 2; // Por algum motivo ele começa no deslocamento dos tubos internos , e não os tubos exteriores 
   var piperight = pipeleft + pipewidth;
   var pipebottom = pipetop + pipeheight;

   // O que acontece se cair dentro do tubo
   if (boxright > pipeleft) {
      // Estamos dentro dos tubos, já passamos pelo tubo superior e inferior?
      if (boxtop > pipetop && boxbottom < pipebottom) {
         // sim, estamos dentro dos limites!

      } else {
         // não podemos pular estando dentro do cano, você morreu! return game!
         playerDead();
         return;
      }
   }


   // Já passamos o cano?
   if (boxleft > piperight) {
      // se sim, remove e aparece outro
      pipes.splice(0, 1);

      // pontua a partir do momento que vai passando
      playerScore();
   }
}

// Permitindo os pulos pela barra de espaço
$(document).keydown(function (e) {

   // usando a barra de espaço
   if (e.keyCode == 32) {
      // pode usar o space para sair da página de replay e começar novamente
      if (currentstate == states.ScoreScreen)
         $("#replay").click();
      else
         screenClick();
   }
});

// Usar o mouse ou o teclado para começar
if ("ontouchstart" in window)
   $(document).on("touchstart", screenClick);
else
   $(document).on("mousedown", screenClick);

function screenClick() {
   if (currentstate == states.GameScreen) {
      playerJump();
   }
   else if (currentstate == states.SplashScreen) {
      startGame();
   }
}

// Função para passar o pulo e o som
function playerJump() {
   velocity = jump;
   // iniciar o som com o pulo
   soundJump.stop();
   soundJump.play();
}

// Função para setar a pontuação e aparecer na tela as imagens grande de pontuação
function setBigScore(erase) {
   var elemscore = $("#bigscore");
   elemscore.empty();

   if (erase)
      return;

   var digits = score.toString().split('');
   for (var i = 0; i < digits.length; i++)
      elemscore.append("<img src='assets/font_big_" + digits[i] + ".png' alt='" + digits[i] + "'>");
}

// Função para setar a pontuação pequena e aparecer na tela as imagens de pequena pontuação
function setSmallScore() {
   // Seta o score obtido pelo jogador com a imagem pequena
   var elemscore = $("#currentscore");
   elemscore.empty();

   var digits = score.toString().split('');
   for (var i = 0; i < digits.length; i++)
      elemscore.append("<img src='assets/font_small_" + digits[i] + ".png' alt='" + digits[i] + "'>");
}

// Função para setar a pontuação pequena e aparecer na tela as imagens de pequena pontuação
function setHighScore() {
   // Seta o maior score já obtido pelo jogador e mostra na tela
   var elemscore = $("#highscore");
   elemscore.empty();

   var digits = highscore.toString().split('');
   for (var i = 0; i < digits.length; i++)
      elemscore.append("<img src='assets/font_small_" + digits[i] + ".png' alt='" + digits[i] + "'>");
}

// Função para setar a medalha de acordo com a pontuação obtida
function setMedal() {
   var elemmedal = $("#medal");
   elemmedal.empty();

   if (score < 10)
      //signal that no medal has been won
      return false;

   if (score >= 10)
      medal = "bronze";
   if (score >= 20)
      medal = "silver";
   if (score >= 30)
      medal = "gold";
   if (score >= 40)
      medal = "platinum";

   elemmedal.append('<img src="assets/medal_' + medal + '.png" alt="' + medal + '">');

   // sinal de que a medalha foi recebida
   return true;
}

// Função para quando o player morrer
function playerDead() {
   // Pausando todas as animações
   $(".animated").css('animation-play-state', 'paused');
   $(".animated").css('-webkit-animation-play-state', 'paused');

   // Dropar o passarinho do footer
   var playerbottom = $("#player").position().top + $("#player").width(); // Usamos porque ele irá rotacionar 90º
   var floor = $("#flyarea-game").height();
   var movey = Math.max(0, floor - playerbottom);
   $("#player").transition({ y: movey + 'px', rotate: 90 }, 1000, 'easeInOutCubic');

   // Este é o tempo para mudar os estados. Vamos considerar a scorescreen para desabilitar o click/jump
   currentstate = states.ScoreScreen;

   // Destroi todos os games loops
   clearInterval(loopGameloop);
   clearInterval(loopPipeloop);
   loopGameloop = null;
   loopPipeloop = null;

   // Mobile browsers não suportam buzz bindOnce event
   if (isIncompatible.any()) {
      // Mostra o score
      showScore();
   }
   else {
      // Começa o hit sound e depois o som de morte e depois mostra o score
      soundHit.play().bindOnce("ended", function () {
         soundDie.play().bindOnce("ended", function () {
            showScore();
         });
      });
   }
}

// Função para mostrar o score
function showScore() {
   // Mostra o quadro do score
   $("#scoreboard").css("display", "flex");

   // Remove o big score da tela
   setBigScore(true);

   // Se o score obtido for maior que o maior score já obtido
   if (score > highscore) {
      // Salva o score
      highscore = score;
      // Salva no cookie
      setCookie("highscore", highscore, 999);
   }

   // Muda o quadro de score
   setSmallScore();
   setHighScore();
   var wonmedal = setMedal();

   // som do SWOOSH!
   soundSwoosh.stop();
   soundSwoosh.play();

   // Mostra o quadro de score
   $("#scoreboard").css({ y: '40px', opacity: 0 });
   $("#replay").css({ y: '40px', opacity: 0 });

   if (score >= TOTAL_POINTS) {
      $("#modal-vencedor").css({ y: '0px', opacity: 1, display: 'block' }, 600, 'ease');
   }

   $("#scoreboard").transition({ y: '0px', opacity: 1 }, 600, 'ease', function () {
      // Qaundo a animação terminar começa o som de SWOOSH!
      soundSwoosh.stop();
      soundSwoosh.play();
      $("#replay").transition({ y: '0px', opacity: 1 }, 600, 'ease');

      // também animal a medalha para aparecer no quadro de score 
      if (wonmedal) {
         $("#medal").css({ scale: 2, opacity: 0 });
         $("#medal").transition({ opacity: 1, scale: 1 }, 1200, 'ease');
      }
   });

   // deixa o botão de replay com clique
   replayclickable = true;
}

$("#replay").click(function () {
   // Podemos deixar a ação de replay com clique também
   if (!replayclickable)
      return;
   else
      replayclickable = false;
   //SWOOSH!
   soundSwoosh.stop();
   soundSwoosh.play();

   // Fade para o quadro de score sumir
   $("#modal-vencedor").css({ y: '-40px', opacity: 0, display: 'none' }, 1000, 'ease');
   $("#scoreboard").transition({ y: '-40px', opacity: 0 }, 1000, 'ease', function () {
      // Esconde o quadro de score
      $("#scoreboard").css("display", "none");

      // começa o game over e mostra a splash screen
      showSplash();
   });
});

$('#acessar-quiz').click(function () {
   // Lógica para acessar o quiz
   location.href = 'https://www.mova.org.br/quiz';
});

// Função para armazenar a pontuação do jogador
function playerScore() {
   score += 1;
   soundScore.stop();
   soundScore.play();
   setBigScore();

   // alterna tema do céu por blocos de 3 pontos (1-3, 4-6, 7-9, ...)
   if (score >= 1) {
      var blockIndex = Math.floor((score - 1) / 3); // 0 para 1-3, 1 para 4-6, ..., 6 para 19-21
      if (blockIndex >= 0 && blockIndex < skyHueFilters.length) {
         if (blockIndex !== skyThemeIndex) {
            skyThemeIndex = blockIndex;
            applySkyTheme(skyThemeIndex);
            setPhaseLabel(skyThemeIndex);
         }
      }
   }

   // fim do jogo ao alcançar 21 pontos
   if (!gameFinished && score >= TOTAL_POINTS) {
      gameFinished = true;
      // pausa o jogo e mostra pop-up de finalização
      clearInterval(loopGameloop);
      clearInterval(loopPipeloop);
      loopGameloop = null;
      loopPipeloop = null;
      currentstate = states.ScoreScreen;

      // mostra score final
      showScore();
   }
}

// Função para ir mostrando e mudar os canos
function updatePipes() {
   // Se o jogo está pausado por palavra, não criar novos tubos
   if (gameIsPausedForWord) {
      return;
   }
   
   // Existe algum cano para remover?
   $(".pipe").filter(function () { return $(this).position().left <= -100; }).remove()

   // Add um novo cano (top height + bottom height  + pipeheight == 420) e coloca o cano em outra área
   var padding = 80;
   var constraint = 420 - pipeheight - (padding * 2); // duplicando a margem interna
   var topheight = Math.floor((Math.random() * constraint) + padding); // add padding abaixo
   var bottomheight = (420 - pipeheight) - topheight;
   var newpipe = $('<div class="pipe animated"><div class="pipe_upper" style="height: ' + topheight + 'px;"></div><div class="pipe_lower" style="height: ' + bottomheight + 'px;"></div></div>');
   $("#flyarea-game").append(newpipe);
   pipes.push(newpipe);
   
   // Registrar tempo de criação do tubo
   lastPipeTime = Date.now();
}


// Definindo o suporte dos navegadores para o event Buzz definido anteriormente
var isIncompatible = {
   Android: function () {
      return navigator.userAgent.match(/Android/i);
   },
   BlackBerry: function () {
      return navigator.userAgent.match(/BlackBerry/i);
   },
   iOS: function () {
      return navigator.userAgent.match(/iPhone|iPad|iPod/i);
   },
   Opera: function () {
      return navigator.userAgent.match(/Opera Mini/i);
   },
   Safari: function () {
      return (navigator.userAgent.match(/OS X.*Safari/) && !navigator.userAgent.match(/Chrome/));
   },
   Windows: function () {
      return navigator.userAgent.match(/IEMobile/i);
   },
   any: function () {
      return (isIncompatible.Android() || isIncompatible.BlackBerry() || isIncompatible.iOS() || isIncompatible.Opera() || isIncompatible.Safari() || isIncompatible.Windows());
   }
};