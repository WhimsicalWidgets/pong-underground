import { ApiException, fromHono } from "chanfana";
import { Hono } from "hono";
import { tasksRouter } from "./endpoints/tasks/router";
import { ContentfulStatusCode } from "hono/utils/http-status";
import { DummyEndpoint } from "./endpoints/dummyEndpoint";
import { GameClickEndpoint } from "./endpoints/gameClick";
import { GameStatsEndpoint } from "./endpoints/gameStats";

// Start a Hono app
const app = new Hono<{ Bindings: Env }>();

// Read the HTML content
const initialHtml = `<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Ping Pong Underground - TEST UPDATE</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');

    .street-font {
      font-family: 'Press Start 2P', cursive;
    }

    .pixel-border {
      border-style: solid;
      border-width: 4px;
      border-image: linear-gradient(135deg, #ff0000, #ff8c00, #ff0000) 1;
    }

    .glow {
      animation: glow 2s ease-in-out infinite alternate;
    }

    @keyframes glow {
      from {
        text-shadow: 0 0 5px #fff, 0 0 10px #fff, 0 0 15px #ff0000, 0 0 20px #ff0000;
      }

      to {
        text-shadow: 0 0 10px #fff, 0 0 20px #ff0000, 0 0 30px #ff0000, 0 0 40px #ff0000;
      }
    }


    .button-press {
      transition: all 0.1s;
    }

    .button-press:active {
      transform: translateY(4px);
    }

    .garage-bg {
      background-image: url('https://images.unsplash.com/photo-1600585152220-90363fe7e115?ixlib=rb-4.0.3');
      background-size: cover;
      background-position: center;
      background-blend-mode: multiply;
    }

    #pongCanvas {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      z-index: -1;
      opacity: 0.2;
    }

    .game-active #pongCanvas {
      opacity: 1;
      z-index: 1;
    }

    .game-active .ui-overlay {
      display: none;
    }

    .score-display {
      position: fixed;
      top: 20px;
      font-family: 'Press Start 2P', cursive;
      font-size: 14px;
      z-index: 1000;
      color: white;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.9);
      background: rgba(0,0,0,0.7);
      padding: 8px 12px;
      border-radius: 4px;
      border: 2px solid currentColor;
    }

    .score-left {
      left: 20px;
      color: #ff0000;
      border-color: #ff0000;
    }

    .score-right {
      right: 20px;
      color: #00ff00;
      border-color: #00ff00;
    }
  </style>
</head>

<body class="bg-gray-900 min-h-screen garage-bg bg-gray-800">
  <!-- Score displays - positioned absolutely on the page -->
  <div id="forPongScore" style="position: fixed; top: 10px; left: 10px; z-index: 99999; color: #00ff00; font-size: 10px; font-family: 'Press Start 2P', monospace;">For ping pong: 0</div>
  <div id="notForPongScore" style="position: fixed; top: 10px; right: 10px; z-index: 99999; color: #00ff00; font-size: 10px; font-family: 'Press Start 2P', monospace;">Not for pong: ??</div>
  
  <!-- Main content container -->
  <div class="min-h-screen flex items-center justify-center p-4">
    <!-- Pong game canvas background -->
    <canvas id="pongCanvas" width="800" height="400"></canvas>
    
    <div class="ui-overlay relative max-w-4xl w-full">
    <!-- Main container -->
    <div class="bg-black bg-opacity-80 p-8 rounded-lg pixel-border shadow-2xl overflow-hidden">
      <!-- Street Fighter style header -->
      <div class="text-center mb-8">
        <h1 class="street-font text-2xl sm:text-4xl md:text-6xl text-red-500 mb-4 glow leading-tight">PING PONG UNDERGROUND</h1>
        <p class="street-font text-yellow-300 text-xs sm:text-sm md:text-base">ATTENTION TOWER CITIZENS</p>
      </div>


      <!-- Main CTA -->
      <div class="text-center mb-8">
        <h2 class="street-font text-sm sm:text-xl md:text-3xl text-white mb-6">WANNA PLAY SOME PING PONG?</h2>

        <div class="flex justify-center">
          <button id="yesBtn"
            class="button-press street-font bg-green-500 hover:bg-green-600 text-white px-4 sm:px-8 py-3 sm:py-4 rounded-lg text-sm sm:text-lg md:text-xl transform transition-all duration-200 hover:scale-105">
            <i class="fas fa-table-tennis-paddle-ball mr-2"></i> LET'S GET ONE!
          </button>
        </div>
      </div>



      <!-- Sound effects -->
      <audio id="fightSound" src="https://www.soundjay.com/mechanical/sounds/ping-pong-ball-1.mp3"></audio>
      <audio id="koSound" src="https://www.soundjay.com/mechanical/sounds/ping-pong-ball-3.mp3"></audio>
    </div>

    <!-- Arcade details -->
    <div class="street-font text-gray-400 text-xs text-center mt-4">
      <p>CASUAL GAMES • GOOD VIBES • FRIENDLY COMPETITION</p>
      <p class="mt-1">LOCATION: THE GARAGE • TIME: WHENEVER</p>
    </div>
    </div>
  </div>

  <script>
    class PingPong {
      constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');

        this.ball = {
          x: this.canvas.width / 2,
          y: this.canvas.height / 2,
          dx: 5,
          dy: 3,
          radius: 8,
        };

        this.paddleHeight = 80;
        this.paddleWidth = 12;

        this.playerPaddle = {
          x: 20,
          y: this.canvas.height / 2 - this.paddleHeight / 2,
          width: this.paddleWidth,
          height: this.paddleHeight,
        };

        this.aiPaddle = {
          x: this.canvas.width - 20 - this.paddleWidth,
          y: this.canvas.height / 2 - this.paddleHeight / 2,
          width: this.paddleWidth,
          height: this.paddleHeight,
          speed: 3,
        };

        this.mouseY = this.canvas.height / 2;
        this.setupEventListeners();
        this.gameLoop();
      }

      setupEventListeners() {
        // Mouse events for desktop
        document.addEventListener('mousemove', (e) => {
          this.updatePaddlePosition(e.clientY);
        });

        // Touch events for mobile
        document.addEventListener('touchmove', (e) => {
          e.preventDefault(); // Prevent scrolling
          if (e.touches.length > 0) {
            this.updatePaddlePosition(e.touches[0].clientY);
          }
        }, { passive: false });

        document.addEventListener('touchstart', (e) => {
          if (e.touches.length > 0) {
            this.updatePaddlePosition(e.touches[0].clientY);
          }
        });
      }

      updatePaddlePosition(clientY) {
        const rect = this.canvas.getBoundingClientRect();
        const relativeY = clientY - rect.top;
        
        // Scale position to canvas height
        this.mouseY = (relativeY / rect.height) * this.canvas.height;
        
        // Keep within bounds
        if (this.mouseY < 0) this.mouseY = 0;
        if (this.mouseY > this.canvas.height) this.mouseY = this.canvas.height;
      }

      update() {
        this.playerPaddle.y = this.mouseY - this.paddleHeight / 2;

        if (this.playerPaddle.y < 0) {
          this.playerPaddle.y = 0;
        }
        if (this.playerPaddle.y > this.canvas.height - this.paddleHeight) {
          this.playerPaddle.y = this.canvas.height - this.paddleHeight;
        }

        const paddleCenter = this.aiPaddle.y + this.paddleHeight / 2;
        const ballY = this.ball.y;

        if (paddleCenter < ballY - 10) {
          this.aiPaddle.y += this.aiPaddle.speed;
        } else if (paddleCenter > ballY + 10) {
          this.aiPaddle.y -= this.aiPaddle.speed;
        }

        if (this.aiPaddle.y < 0) {
          this.aiPaddle.y = 0;
        }
        if (this.aiPaddle.y > this.canvas.height - this.paddleHeight) {
          this.aiPaddle.y = this.canvas.height - this.paddleHeight;
        }

        this.ball.x += this.ball.dx;
        this.ball.y += this.ball.dy;

        if (
          this.ball.y <= this.ball.radius ||
          this.ball.y >= this.canvas.height - this.ball.radius
        ) {
          this.ball.dy = -this.ball.dy;
        }

        if (
          this.ball.x - this.ball.radius <=
            this.playerPaddle.x + this.playerPaddle.width &&
          this.ball.x + this.ball.radius >= this.playerPaddle.x &&
          this.ball.y >= this.playerPaddle.y &&
          this.ball.y <= this.playerPaddle.y + this.playerPaddle.height &&
          this.ball.dx < 0
        ) {
          this.ball.dx = -this.ball.dx;
          const hitPos = (this.ball.y - this.playerPaddle.y) / this.paddleHeight;
          this.ball.dy = (hitPos - 0.5) * 8;
        }

        if (
          this.ball.x + this.ball.radius >= this.aiPaddle.x &&
          this.ball.x - this.ball.radius <= this.aiPaddle.x + this.aiPaddle.width &&
          this.ball.y >= this.aiPaddle.y &&
          this.ball.y <= this.aiPaddle.y + this.aiPaddle.height &&
          this.ball.dx > 0
        ) {
          this.ball.dx = -this.ball.dx;
          const hitPos = (this.ball.y - this.aiPaddle.y) / this.paddleHeight;
          this.ball.dy = (hitPos - 0.5) * 8;
        }

        if (this.ball.x < 0 || this.ball.x > this.canvas.width) {
          this.resetBall();
        }
      }

      resetBall() {
        this.ball.x = this.canvas.width / 2;
        this.ball.y = this.canvas.height / 2;
        this.ball.dx = Math.random() > 0.5 ? 5 : -5;
        this.ball.dy = (Math.random() - 0.5) * 6;
      }

      draw() {
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.setLineDash([10, 5]);
        this.ctx.strokeStyle = '#333';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(this.canvas.width / 2, 0);
        this.ctx.lineTo(this.canvas.width / 2, this.canvas.height);
        this.ctx.stroke();
        this.ctx.setLineDash([]);

        this.ctx.fillStyle = '#fff';
        this.ctx.fillRect(
          this.playerPaddle.x,
          this.playerPaddle.y,
          this.playerPaddle.width,
          this.playerPaddle.height
        );
        this.ctx.fillRect(
          this.aiPaddle.x,
          this.aiPaddle.y,
          this.aiPaddle.width,
          this.aiPaddle.height
        );

        this.ctx.beginPath();
        this.ctx.arc(this.ball.x, this.ball.y, this.ball.radius, 0, Math.PI * 2);
        this.ctx.fill();
      }

      gameLoop() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.gameLoop());
      }
    }

    document.addEventListener('DOMContentLoaded', function () {
      const yesBtn = document.getElementById('yesBtn');
      const fightSound = document.getElementById('fightSound');
      const forPongScore = document.getElementById('forPongScore');
      const notForPongScore = document.getElementById('notForPongScore');
      
      // Initialize background pong game
      const backgroundGame = new PingPong('pongCanvas');

      // Function to update scores
      async function updateScores() {
        try {
          const response = await fetch('/game/stats');
          const data = await response.json();
          forPongScore.textContent = \`For ping pong: \${data.forPong}\`;
          notForPongScore.textContent = \`Not for pong: \${data.notForPong}\`;
        } catch (error) {
          console.error('Failed to fetch scores:', error);
        }
      }

      // Update scores on page load
      updateScores();

      yesBtn.addEventListener('click', async function () {
        fightSound.play();
        yesBtn.innerHTML = '<i class="fas fa-table-tennis-paddle-ball mr-2"></i> GAME ON!';
        yesBtn.classList.remove('bg-green-500', 'hover:bg-green-600');
        yesBtn.classList.add('bg-yellow-500', 'hover:bg-yellow-600');
        
        // Record the click in the database
        try {
          await fetch('/game/click', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              timestamp: new Date().toISOString()
            })
          });
        } catch (error) {
          console.error('Failed to record click:', error);
        }
        
        // Update scores after recording the click
        updateScores();
        
        // Transition to full game mode
        document.body.classList.add('game-active');
      });
    });
  </script>
</body>

</html>`;

// Serve the ping pong game at root
app.get("/", (c) => {
  return c.html(initialHtml);
});

// Also serve at /initial for direct access
app.get("/initial", (c) => {
  return c.html(initialHtml);
});

app.onError((err, c) => {
  if (err instanceof ApiException) {
    // If it's a Chanfana ApiException, let Chanfana handle the response
    return c.json(
      { success: false, errors: err.buildResponse() },
      err.status as ContentfulStatusCode,
    );
  }

  console.error("Global error handler caught:", err); // Log the error if it's not known

  // For other errors, return a generic 500 response
  return c.json(
    {
      success: false,
      errors: [{ code: 7000, message: "Internal Server Error" }],
    },
    500,
  );
});

// Setup OpenAPI registry
const openapi = fromHono(app, {
  docs_url: "/docs",
  schema: {
    info: {
      title: "Ping Pong Underground API",
      version: "2.0.0",
      description: "Backend API for the Ping Pong Underground game.",
    },
  },
});

// Register Tasks Sub router
openapi.route("/tasks", tasksRouter);

// Register other endpoints
openapi.post("/dummy/:slug", DummyEndpoint);
openapi.post("/game/click", GameClickEndpoint);
openapi.get("/game/stats", GameStatsEndpoint);

// Export the Hono app
export default app;
