// Constantes e enums do jogo
export const debugmode = true;

export const states = Object.freeze({
  SplashScreen: 0,
  GameScreen: 1,
  ScoreScreen: 2
});

// Física / Player
export const GRAVITY = 0.25;
export const JUMP_VELOCITY = -4.6;
export const START_POSITION = 180;
export const TOTAL_POINTS = 21; // Pontos para finalizar o jogo

// Pipes
export const PIPE_HEIGHT = 130;
export const PIPE_WIDTH = 52;
export const PIPE_INTERVAL = 1400; // ms

// Cores / Temas
export const blueBgColor = '#005498';
export const purpleBgColor = '#8C0A7E';
export const pinkBgColor = '#FF0073';

export const lightBlueFooterColor = '#668db5';
export const lightPurpleFooterColor = '#c573b7';
export const lightPinkFooterColor = '#ffacd6';

export const skyHueFilters = ['hue-rotate(20deg)', 'hue-rotate(60deg)', 'hue-rotate(100deg)', 'hue-rotate(160deg)', 'hue-rotate(200deg)', 'hue-rotate(260deg)', 'hue-rotate(320deg)'];
export const skyHexColors = [blueBgColor, blueBgColor, blueBgColor, blueBgColor, blueBgColor, pinkBgColor, pinkBgColor];
export const ceilingHueColors = ['hue-rotate(176deg)', 'hue-rotate(176deg)', 'hue-rotate(176deg)', 'hue-rotate(176deg)', 'hue-rotate(176deg)', 'hue-rotate(300deg)', 'hue-rotate(300deg)'];
export const lightHexFooterColors = [lightPinkFooterColor, lightPinkFooterColor, lightPinkFooterColor, lightPinkFooterColor, lightPinkFooterColor, lightPinkFooterColor, lightPinkFooterColor];
export const skyBgImage = ['assets/sky-azul.png', 'assets/sky-azul.png', 'assets/sky-azul.png', 'assets/sky-azul.png', 'assets/sky-azul.png', 'assets/sky-rosa.png', 'assets/sky-rosa.png'];
export const landBgImage = ['assets/fase-rosa/land-rosa.png', 'assets/fase-rosa/land-rosa.png', 'assets/fase-rosa/land-rosa.png', 'assets/fase-rosa/land-rosa.png', 'assets/fase-rosa/land-rosa.png', 'assets/land-rosa.png', 'assets/land-rosa.png'];
export const pipeBgClass = ['rosa', 'rosa', 'rosa', 'rosa', 'rosa', 'rosa', 'rosa'];

// Fases
export const phaseLabels = [
  'Onboarding do tomador',
  'Análise de crédito',
  'Antifraude',
  'Formalização',
  'Bancarização',
  'Recebimento',
  'Cobrança'
];
