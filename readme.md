<div align="center">

# MOVA Birds 🐦

Uma versão temática e gamificada inspirada no clássico Flappy Bird, adaptada ao contexto da jornada de crédito (Credit as a Service). Cada bloco de 3 pontos avança uma fase da jornada (Onboarding → Cobrança), aplicando efeitos visuais, cores e pausas temáticas para reforçar a narrativa.

HTML5 + CSS3 + JavaScript (ES Modules) – 100% client-side.

</div>

## ✨ Destaques

- Gameplay simples: clique do mouse, toque (mobile) ou barra de espaço.
- Jornadas/Fases: 7 fases com label + pausa temporal + efeito de partículas.
- Mudança dinâmica de tema (sky / pipes / footer) a cada bloco de 3 pontos.
- Sons (wing, point, hit, die, swoosh) via Buzz.js (já empacotado minificado).
- Sistema de medalhas (bronze, silver, gold, platinum) e popup de vitória aos 21 pontos.
- Persistência de High Score com cookie.
- Arquitetura modular (refatoração 2025) para facilitar manutenção e expansão.
- Totalmente responsivo e pronto para rodar em um simples servidor estático.

## 🗂 Estrutura de Pastas

```
index.html                # Entrada principal
css/                      # Estilos (reset, animações, layout, cores)
js/                       # Módulos ES6
    fb-main.js              # Orquestrador (loop, input, inicialização)
    constants.js            # Constantes do jogo (física, temas, enum de estados)
    state.js                # Estado global centralizado
    audio.js                # Inicialização dos sons
    themes.js               # Aplicação / reset de temas visuais
    phases.js               # Lógica de fases (labels, pausa, partículas, countdown)
    pipes.js                # Geração e reciclagem dos canos
    player.js               # Física, salto, morte, bounding box
    score.js                # Pontuação, medalhas, scoreboard
    utils.js                # Cookies (get / set)
assets/                   # Imagens, sprites e sons
```

## 🔁 Fluxo de Jogo Simplificado

1. `showSplash()` exibe a tela inicial.
2. Interação (clique / espaço / toque) dispara `startGame()`.
3. `gameloop` (60 FPS) atualiza física → colisões → pontuação.
4. Pipes gerados em intervalo configurado (`PIPE_INTERVAL`).
5. A cada bloco de 3 pontos: aplica tema + pausa com efeito (`phases.js`).
6. Ao atingir 21 pontos: estado final → modal de vitória.
7. Replay reinicia estado e temas.

## 🛠 Como Executar Localmente

Qualquer servidor estático funciona. Três opções simples:

### 1. VS Code + Live Server (mais simples)
1. Instale a extensão Live Server.
2. Abra o projeto no VS Code.
3. Clique com o botão direito em `index.html` → “Open with Live Server”.

### 2. Python (caso tenha instalado)
```powershell
python -m http.server 8080
```
Acesse: http://localhost:8080

### 3. Node (http-server)
```powershell
npm install -g http-server
http-server -p 8080
```

Se abrir diretamente via file:// alguns navegadores podem bloquear cookies ou comportamentos de áudio automático.

## 🎮 Controles

- Barra de espaço / clique / toque: salto.
- O jogo pausa brevemente (5s) ao mudar de fase para exibir a label.

## 🧩 Modularização (Refatoração 2025)

| Módulo | Responsabilidade |
|--------|------------------|
| `constants.js` | Física, limites, temas, rótulos de fases |
| `state.js` | Estado mutável central (loop IDs, posição, score) |
| `audio.js` | Sons e volume global |
| `themes.js` | Aplicar / resetar skins de céu, pipes e footer |
| `phases.js` | Labels, pausa temporizada, partículas, countdown |
| `pipes.js` | Criação e limpeza de canos animados |
| `player.js` | Física, salto, morte, compatibilidade mobile |
| `score.js` | Score, medalhas, highscore, scoreboard final |
| `utils.js` | Cookies utilitários |
| `fb-main.js` | Orquestra: input, ciclo, transições de estado |

## 🥇 Medalhas

| Pontos | Medalha |
|--------|---------|
| 5+     | Bronze  |
| 10+    | Silver  |
| 18+    | Gold    |
| 21     | Platinum / Vitória |

## 🚀 Ideias Futuras

- Event bus para desacoplar módulos (ex: `emit('PLAYER_DIED')`).
- Conversão gradual para TypeScript ou adição de JSDoc para tipagem.
- Sistema de dificuldade adaptativa (intervalo dinâmico de pipes).
- Persistir configurações (som on/off, modo fácil).
- Testes unitários para funções puras (ex: cálculo de tema por score).

## 🤝 Contribuindo

1. Fork do repositório
2. Crie uma branch: `git checkout -b feat/nome-da-feature`
3. Commits descritivos: `git commit -m "feat: adiciona efeito de..."`
4. Push & abra um Pull Request

Relate bugs ou sugestões em Issues com passos para reproduzir quando possível.

## 📄 Licença

MIT. Veja `LICENSE` (se ainda não existir, pode ser adicionada facilmente).

## 📢 Créditos

- Baseado na mecânica do Flappy Bird (Dong Nguyen) para fins educativos/demonstração.
- Adaptações de arte e identidade conforme tema da jornada de crédito.

---

Se quiser evoluir (TypeScript, testes ou novos power-ups), abra uma issue ou continue a refatoração. Bom jogo! 🐦