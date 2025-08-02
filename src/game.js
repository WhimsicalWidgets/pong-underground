class PingPong {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.playerScoreEl = document.getElementById('player-score');
    this.aiScoreEl = document.getElementById('ai-score');

    // Game state
    this.playerScore = 0;
    this.aiScore = 0;

    // Ball properties
    this.ball = {
      x: this.canvas.width / 2,
      y: this.canvas.height / 2,
      dx: 5,
      dy: 3,
      radius: 8,
    };

    // Paddle properties
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
    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      this.mouseY = e.clientY - rect.top;
    });
  }

  update() {
    // Update player paddle position to follow mouse
    this.playerPaddle.y = this.mouseY - this.paddleHeight / 2;

    // Keep player paddle within bounds
    if (this.playerPaddle.y < 0) {
      this.playerPaddle.y = 0;
    }
    if (this.playerPaddle.y > this.canvas.height - this.paddleHeight) {
      this.playerPaddle.y = this.canvas.height - this.paddleHeight;
    }

    // AI paddle follows ball with some lag
    const paddleCenter = this.aiPaddle.y + this.paddleHeight / 2;
    const ballY = this.ball.y;

    if (paddleCenter < ballY - 10) {
      this.aiPaddle.y += this.aiPaddle.speed;
    } else if (paddleCenter > ballY + 10) {
      this.aiPaddle.y -= this.aiPaddle.speed;
    }

    // Keep AI paddle within bounds
    if (this.aiPaddle.y < 0) {
      this.aiPaddle.y = 0;
    }
    if (this.aiPaddle.y > this.canvas.height - this.paddleHeight) {
      this.aiPaddle.y = this.canvas.height - this.paddleHeight;
    }

    // Update ball position
    this.ball.x += this.ball.dx;
    this.ball.y += this.ball.dy;

    // Ball collision with top and bottom walls
    if (
      this.ball.y <= this.ball.radius ||
      this.ball.y >= this.canvas.height - this.ball.radius
    ) {
      this.ball.dy = -this.ball.dy;
    }

    // Ball collision with player paddle
    if (
      this.ball.x - this.ball.radius <=
        this.playerPaddle.x + this.playerPaddle.width &&
      this.ball.x + this.ball.radius >= this.playerPaddle.x &&
      this.ball.y >= this.playerPaddle.y &&
      this.ball.y <= this.playerPaddle.y + this.playerPaddle.height &&
      this.ball.dx < 0
    ) {
      this.ball.dx = -this.ball.dx;

      // Add some angle based on where the ball hits the paddle
      const hitPos = (this.ball.y - this.playerPaddle.y) / this.paddleHeight;
      this.ball.dy = (hitPos - 0.5) * 8;
    }

    // Ball collision with AI paddle
    if (
      this.ball.x + this.ball.radius >= this.aiPaddle.x &&
      this.ball.x - this.ball.radius <= this.aiPaddle.x + this.aiPaddle.width &&
      this.ball.y >= this.aiPaddle.y &&
      this.ball.y <= this.aiPaddle.y + this.aiPaddle.height &&
      this.ball.dx > 0
    ) {
      this.ball.dx = -this.ball.dx;

      // Add some angle based on where the ball hits the paddle
      const hitPos = (this.ball.y - this.aiPaddle.y) / this.paddleHeight;
      this.ball.dy = (hitPos - 0.5) * 8;
    }

    // Ball goes out of bounds - scoring
    if (this.ball.x < 0) {
      this.aiScore++;
      this.aiScoreEl.textContent = this.aiScore;
      this.resetBall();
    } else if (this.ball.x > this.canvas.width) {
      this.playerScore++;
      this.playerScoreEl.textContent = this.playerScore;
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
    // Clear canvas
    this.ctx.fillStyle = '#000';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw center line
    this.ctx.setLineDash([10, 5]);
    this.ctx.strokeStyle = '#333';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.moveTo(this.canvas.width / 2, 0);
    this.ctx.lineTo(this.canvas.width / 2, this.canvas.height);
    this.ctx.stroke();
    this.ctx.setLineDash([]);

    // Draw paddles
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

    // Draw ball
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

// Start the game when the page loads
window.addEventListener('load', () => {
  new PingPong();
});
