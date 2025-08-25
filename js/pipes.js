import { gameState } from './state.js';

export function updatePipes() {
  if (gameState.gameIsPausedForWord) return;
  $('.pipe').filter(function () { return $(this).position().left <= -100; }).remove();
  const padding = 80;
  const constraint = 420 - gameState.pipeheight - (padding * 2);
  const topheight = Math.floor((Math.random() * constraint) + padding);
  const bottomheight = (420 - gameState.pipeheight) - topheight;
  const pipeClass = localStorage.getItem('pipeClass') || 'azul';
  const newpipe = $(
    `<div class="pipe animated">
        <div class="pipe_upper ${pipeClass}" style="height:${topheight}px;"></div>
        <div class="pipe_lower ${pipeClass}" style="height:${bottomheight}px;"></div>
     </div>`
  );
  $('#flyarea-game').append(newpipe);
  gameState.pipes.push(newpipe);
  gameState.lastPipeTime = Date.now();
}
