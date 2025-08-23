
import { getCookie, setCookie } from './utils.js';

/* 
   /// DEFININDO AS VARIÁVEIS ////
*/

// Modo de depuração do jogo - Lógico (true or false)
var debugmode = true;

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

// CORES
const blueBgColor = '#005498';
const purpleBgColor = '#8C0A7E';
const pinkBgColor = '#FF0073';

const lightBlueFooterColor = '#668db5';
const lightPurpleFooterColor = '#c573b7';
const lightPinkFooterColor = '#ffacd6';

// Controle de mudança de cor do céu
var skyThemeIndex = -1; // começa sem tema aplicado; o primeiro virá no 3º ponto
var skyHueFilters = ['hue-rotate(20deg)', 'hue-rotate(60deg)', 'hue-rotate(100deg)', 'hue-rotate(160deg)', 'hue-rotate(200deg)', 'hue-rotate(260deg)', 'hue-rotate(320deg)'];
var skyHexColors = [blueBgColor, blueBgColor, blueBgColor, purpleBgColor, purpleBgColor, pinkBgColor, pinkBgColor];
var ceilingHueColors = ['hue-rotate(176deg)', 'hue-rotate(176deg)', 'hue-rotate(176deg)', 'hue-rotate(250deg)', 'hue-rotate(250deg)', 'hue-rotate(300deg)', 'hue-rotate(300deg)'];
var lightHexFooterColors = [lightBlueFooterColor, lightBlueFooterColor, lightBlueFooterColor, lightPurpleFooterColor, lightPurpleFooterColor, lightPinkFooterColor, lightPinkFooterColor];
var skyBgImage = ['../assets/sky-azul.png', '../assets/sky-azul.png', '../assets/sky-azul.png', '../assets/sky-roxo.png', '../assets/sky-roxo.png', '../assets/sky-rosa.png', '../assets/sky-rosa.png'];
var landBgImage = ['../assets/land-azul.png', '../assets/land-azul.png', '../assets/land-azul.png', '../assets/land-roxo.png', '../assets/land-roxo.png', '../assets/land-rosa.png', '../assets/land-rosa.png'];
var pipeBgClass = ['azul', 'azul', 'azul', 'roxo', 'roxo', 'rosa', 'rosa'];
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
      // cria o elemento simples para mostrar apenas o texto da fase
      $('#flyarea-game').append(
         '<div id="phase-label">' +
            '<div class="phase-text"></div>' +
         '</div>'
      );
   }
}

function setPhaseLabel(index) {
   ensurePhaseLabelElement();
   var text = phaseLabels[index] || '';
   $('#phase-label .phase-text').text(text);
   if (text) {
      // Mostrar a palavra sem pausar o jogo
      showPhaseWordWithoutPause();
      spawnPhaseParticles();
   }
}

// Função para mostrar a palavra da fase sem pausar o jogo
function showPhaseWordWithoutPause() {
   // Som especial para destacar a palavra
   soundSwoosh.stop();
   soundSwoosh.play();
   
   // Aplicar animação simples na palavra sem parar o jogo
   animatePhaseLabelSimple();
   
   // Fade out da palavra após 3 segundos
   setTimeout(function() {
      var $label = $('#phase-label');
      $label.transition({ opacity: 0, scale: 0.9 }, 1000, 'ease');
   }, 3000);
}





// Triggers simple word effect animation without pausing the game
function animatePhaseLabelSimple() {
   var $label = $('#phase-label');
   var $text = $('#phase-label .phase-text');
   
   $label.stop(true, true);
   $text.removeClass('word-effect-glow');
   
   // Initial state for entrance
   $label.css({ opacity: 0, scale: 0.85 });
   
   // Animate to appear
   $label.transition({ opacity: 1, scale: 1 }, 350, 'ease');
   
   // Apply shimmer effect to text
   $text.addClass('word-effect-glow');
   $text.one('animationend webkitAnimationEnd oAnimationEnd MSAnimationEnd', function () {
      $text.removeClass('word-effect-glow');
   });
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

function applyThemes(index) {
   const hexColor = skyHexColors[index];
   const bgImage = skyBgImage[index];
   const landImage = landBgImage[index];
   const footerColor = lightHexFooterColors[index];
   const pipeClass = pipeBgClass[index];

   localStorage.setItem('pipeClass', pipeClass);

   if (hexColor) {
      $("#background-game").css('background-color', hexColor);
      $("#background-game").css('background-image', 'url(' + bgImage + ')');
      $("#footer-game").css({
         'background-image': 'url(' + landImage + ')',
         'background-color': footerColor
      });
      $("#ceiling").css('filter', ceilingHueColors[index]);
   }
}

function resetThemes() {
   localStorage.removeItem("pipeClass");
   $("#background-game").css('background-color', blueBgColor);
   $("#background-game").css('background-image', 'url(../assets/sky-azul.png)');
   $("#footer-game").css({
      'background-image': 'url(../assets/land-azul.png)',
      'background-color': lightBlueFooterColor
   });
   $("#ceiling").css('filter', 'hue-rotate(176deg)');
}

// Definição da var de replay
let replayclickable = false;

// Definição dos sons
const volume = 30;
const soundJump = new buzz.sound("assets/sounds/sfx_wing.ogg");
const soundScore = new buzz.sound("assets/sounds/sfx_point.ogg");
const soundHit = new buzz.sound("assets/sounds/sfx_hit.ogg");
const soundDie = new buzz.sound("assets/sounds/sfx_die.ogg");
const soundSwoosh = new buzz.sound("assets/sounds/sfx_swooshing.ogg");
buzz.all().setVolume(volume);

// Definição dos loops do jogo e dos canos
var loopGameloop;
var loopPipeloop;

// Variáveis para controle de timing dos tubos
var lastPipeTime = 0;
var pipeInterval = 1400; // intervalo padrão entre tubos

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
   resetThemes();
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
   if (e.keyCode === 32) {
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

   if (score < 5)
      //signal that no medal has been won
      return false;

   if (score >= 5)
      medal = "bronze";
   if (score >= 10)
      medal = "silver";
   if (score >= 18)
      medal = "gold";
   if (score >= 21)
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
      $("#scoreboard").css({ display: 'none' });
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

$("#replay, #jogar-novamente").click(function () {
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
            applyThemes(skyThemeIndex);
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
   // Existe algum cano para remover?
   $(".pipe").filter(function () { return $(this).position().left <= -100; }).remove()

   // Add um novo cano (top height + bottom height  + pipeheight == 420) e coloca o cano em outra área
   const padding = 80;
   const constraint = 420 - pipeheight - (padding * 2); // duplicando a margem interna
   const topheight = Math.floor((Math.random() * constraint) + padding); // add padding abaixo
   const bottomheight = (420 - pipeheight) - topheight;
   const pipeClass = localStorage.getItem('pipeClass') || 'azul';
   const newpipe = $(`<div class="pipe animated"><div class="pipe_upper ${pipeClass}" style="height: ${topheight}px;"></div><div class="pipe_lower ${pipeClass}" style="height: ${bottomheight}px;"></div></div>`);

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