// Sons do jogo (Buzz já está carregado globalmente)
const volume = 30;
export const soundJump = new buzz.sound('assets/sounds/sfx_wing.ogg');
export const soundScore = new buzz.sound('assets/sounds/sfx_point.ogg');
export const soundHit = new buzz.sound('assets/sounds/sfx_hit.ogg');
export const soundDie = new buzz.sound('assets/sounds/sfx_die.ogg');
export const soundSwoosh = new buzz.sound('assets/sounds/sfx_swooshing.ogg');
buzz.all().setVolume(volume);
