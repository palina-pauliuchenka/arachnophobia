'use strict'

function Model() {
  let myView = null,
      self = this;

  self.init = function (view) {
    myView = view;
    self.settings = {
      links: {
        main: `
        <div id="main">
          <h1>One vs All</h1>
          <div id="main-links" class="d-flex flex-column justify-content-center align-items-center">
            <a href="#game">Play</a>
            <a href="#rules">Rules</a>
            <a href="#results">Results</a>
          </div>
        </div>
        `,
        game: `
        <div id="game">
          <ul class="nav justify-content-center">
            <li class="nav-item">
              <a class="nav-link active" href="#main">Main page</a>
            </li>
            <li class="nav-item">
              <a class="nav-link" href="#rules">Rules</a>
            </li>
            <li class="nav-item">
              <a class="nav-link" href="#results">results</a>
            </li>
          </ul>
          <div id="score"></div>
          <div id="wrapper"><canvas id="canvas"></canvas></div>
          <button id="start" class="btn btn-warning">start</button>
          <button id="pause" class="btn btn-warning">pause</button>
          <button id="resume" class="btn btn-warning">resume</button>
          <div id="modal" class="modal" tabindex="-1" role="dialog">
            <div class="modal-dialog" role="document">
              <div class="modal-content">
                <div class="modal-body">
                <p>Enter your name to save record</p>
                  <input id="playerName"></input>
                </div>
                <div class="modal-footer">
                  <button id="close" type="button" class="btn btn-secondary" data-dismiss="modal">cancel</button>
                  <button id="save" type="button" class="btn btn-warning">save</button>
                </div>  
              </div>
            </div>
          </div>
        </div>
        `,
        rules: `
        <div id="rules">
          <ul class="nav justify-content-center">
            <li class="nav-item">
              <a class="nav-link active" href="#main">Main page</a>
            </li>
            <li class="nav-item">
              <a class="nav-link" href="#game">Play</a>
            </li>
            <li class="nav-item">
              <a class="nav-link" href="#results">Reults</a>
            </li>
          </ul>
          <div class="h-100 d-flex align-items-center justify-content-center">
            <p>The controls are arrow keys and the letters AWDS, the shot is carried out by clicking the left mouse button. The game is about survival: the more enemies you shoot, the higher you will be in the score table. One kill one point.<br>
            <strong>Good luck!</strong></p>
          </div>
        </div>
        `,
        results: `
        <div id="results">
          <ul class="nav justify-content-center">
            <li class="nav-item">
              <a class="nav-link active" href="#main">Main page</a>
            </li>
            <li class="nav-item">
              <a class="nav-link" href="#game">Play</a>
            </li>
            <li class="nav-item">
              <a class="nav-link" href="#rules">Rules</a>
            </li>
          </ul>
          <div id="scoreTable"></div>
        </div>
        `
      },
      canvasWidth: null,
      canvasHeight: null,
      board: null,
      hero: null,
      fireball: null,
      enemies: [],
      boardImg: './assets/img/field2.jpg',
      enemyImg: './assets/img/characters/enemy.png',
      heroImg: './assets/img/characters/hero.png',
      fireballImg: './assets/img/fireball.png',
      fireballSound: './assets/audio/fireball.wav',
      enemyDieSound: './assets/audio/enemiesDie.mp3',
      enemyMoveSound: './assets/audio/enemiesMove.mp3',
      heroDieSound: './assets/audio/heroDie.mp3',
      score: 0,
      playerScore: null,
      resultData: [],
      enemiesTimer: null,
      gameTimer: null,
      paused: null,
      gameOver: null,
    };
  };

  // update state
  self.updateState = function() {
    self.resize();
    let content = self.settings.links[window.location.hash.slice(1)];
    myView.updateState(content, self.settings.links, self.settings.canvasWidth, self.settings.canvasHeight);
    //conditions for the page with the game
    if (content === self.settings.links.game) {
      if (!self.settings.gameOver && !self.settings.paused) {
        myView.hidePauseButton();
        myView.hideResumeButton();
        self.gameInit();
        self.settings.score = 0;
        myView.updateScore(self.settings.score);
      }
      if (self.settings.paused && !self.settings.gameOver) {
        if (self.settings.gameTimer) {
          myView.hidePauseButton();
          myView.showResumeButton();
          myView.hideStartButton();
        } else {
          myView.hidePauseButton();
          myView.showStartButton();
          myView.hideResumeButton()
        }
        self.gameInit();
        myView.updateScore(self.settings.score);
      }
      if (self.settings.gameOver) {
        myView.hidePauseButton();
        myView.hideResumeButton();
        myView.showStartButton();
        self.settings.score = 0;
        self.gameInit();
        myView.updateScore(self.settings.score);
      }
    }
    // if user left game page save the game
    if (content !== self.settings.links.game) {
      self.settings.paused = true;
      cancelAnimationFrame(self.settings.gameTimer);
      clearInterval(self.settings.enemiesTimer);
    }
    if (content === self.settings.links.results) {
      self.getResult();
    }
  };

  // init game
  self.gameInit = function() {
    if (!self.settings.board) {
      self.createBoard();
    } else {
      self.drawBoard();
    }
    if (!self.settings.hero) {
      self.createHero();
    } else {
      self.drawHero();
    }
    if (self.settings.enemies) {
      myView.drawEnemies(self.settings.enemies)
    }
    myView.closeModal();
    myView.draw();
  };

  // game cycle
  self.game = function() {
    self.checkGameOver();
    self.update();
    self.settings.gameTimer = requestAnimationFrame(self.game);
  };

  // update game
  self.update = function () {
    if (!self.settings.gameOver && !self.settings.paused) {
      if (!self.settings.board) {
        self.createBoard();
      } else {
        self.drawBoard();
      }
      self.moveEnemies();
      self.drawHero();
      if (self.settings.fireball) {
        self.moveFireball();
      }
      myView.draw();
    } else if (self.settings.gameOver) {
      myView.draw();
      self.settings.hero = null;
      self.settings.fireball = null;
    } else if (self.settings.paused) {
      if (!self.settings.board) {
        self.createBoard();
      } else {
        self.drawBoard();
      }
      if (!self.settings.hero) {
        self.createHero();
      } else {
        self.drawHero();
      }
      myView.draw();
    }
  };

  // start game
  self.startGame = function() {
    self.settings.paused = false;
    self.settings.gameOver = false;
    self.gameInit();
    self.game();
    self.settings.enemiesTimer = setInterval(self.createEnemies, 1000);
    myView.hideStartButton();
    myView.showPauseButton();
  };

  // pause
  self.pauseGame = function() {
    self.settings.paused = true;
    clearInterval(self.settings.enemiesTimer);
    cancelAnimationFrame(self.settings.gameTimer);
    myView.hidePauseButton();
    myView.showResumeButton();
  };

  // continue game
  self.gameReturn = function() {
    self.settings.paused = false;
    self.settings.gaming = true;
    self.settings.enemiesTimer = setInterval(self.createEnemies, 1000);
    self.settings.gameTimer = requestAnimationFrame(self.game);
    myView.hideResumeButton();
    myView.showPauseButton();
  };

  // gameover
  self.gameOver = function () {
    self.settings.gameOver = true;
    self.settings.playerScore = self.settings.score;
    // show modal
    myView.showModal();
    self.checkGameOver();
  };

  // check for gameover
  self.checkGameOver = function() {
    cancelAnimationFrame(self.settings.gameTimer);
    if (self.settings.gameOver) {
      self.settings.enemies = [];
      self.settings.score = 0;
      myView.updateScore(self.settings.score);
      clearInterval(self.settings.enemiesTimer);
      myView.hidePauseButton();
      myView.showStartButton();
    }
  };

  // collisions
  self.collisions = function(obj1, obj2) {
    return !!(obj1.posX + obj1.width / 2 >= obj2.posX && obj1.posX + obj1.width / 2 <= obj2.posX + obj2.width & obj1.posY + obj1.height / 2 >= obj2.posY && obj1.posY + obj1.height / 2 <= obj2.posY + obj2.height);
  };

  // get random number
  self.getRandom = function(min, max) {
    return Math.floor(Math.random() * (max + 1 - min)) + min;
  };

  // create board
  self.createBoard = function() {
    let settings = self.settings;
    settings.board = new Image();
    settings.board.src = settings.boardImg;
    settings.board.onload = function() {
      self.update()
    }
  };

  //draw board
  self.drawBoard = function() {
    myView.drawBoard(self.settings.board);
  };

  //create hero
  self.createHero = function() {
    self.settings.hero = new Hero(self.settings.heroImg);
    self.drawHero();
  };

  // draw hero
  self.drawHero = function() {
    self.checkBounds();
    self.settings.hero.updateSprite();
    myView.drawHero(self.settings.hero);
  };

  // hero's moves
  self.moveHero = function(keycode) {
    if (!self.settings.gameOver && !self.settings.paused) {
      if (keycode == 37 || keycode == 65) {
        self.moveLeft();
      }
      if (keycode == 38 || keycode == 87) {
        self.moveTop();
      }
      if (keycode == 39 || keycode == 68) {
        self.moveRight();
      }
      if (keycode == 40 || keycode == 83) {
        self.moveBottom();
      }
    }
  };

  // move left
  self.moveLeft = function() {
    let hero = self.settings.hero;
    hero.sprite = hero.spriteLeft;
    hero.moveLeft();
  };

  // move right
  self.moveRight = function() {
    let hero = self.settings.hero;
    hero.sprite = hero.spriteRight;
    hero.moveRight();
  };

  // move up
  self.moveTop = function() {
    let hero = self.settings.hero;
    hero.sprite = hero.spriteUp;
    hero.moveTop();
  };

  // move down
  self.moveBottom = function() {
    let hero = self.settings.hero;
    hero.sprite = hero.spriteDefault;
    hero.moveBottom();
  };

  //create enemies
  self.createEnemies = function() {
    let enemies = self.settings.enemies;
    enemies.push(new Enemy(self.settings.enemyImg));
    let audio = new Audio();
    audio.src = self.settings.enemyMoveSound;
    audio.play();
    for (let i = 0; i < enemies.length; i ++) {
      enemies[i].updateSprite();
    }
  };

  //move enemies
  self.moveEnemies = function() {
    let enemies = self.settings.enemies,
        hero = self.settings.hero;
    if (enemies) {
      for (let i = 0; i < enemies.length; i++) {
        let x0 = enemies[i].posX,
            y0 = enemies[i].posY,
            x1 = hero.posX,
            y1 = hero.posY,
            speed = self.settings.score / 1000 + enemies[i].speed,
            way = Math.sqrt((x1 - x0) * (x1 - x0) + (y1 - y0) * (y1 - y0));
        enemies[i].posX += (x1 - x0) * speed / way;
        enemies[i].posY += (y1 - y0) * speed / way;
        enemies[i].updateSprite();
        if (self.collisions(enemies[i], hero)) {
          let audio = new Audio();
          audio.src = self.settings.heroDieSound;
          audio.play();
          self.gameOver();
        }
      }
    }
    myView.drawEnemies(enemies);
  };

  // check out of the canvas
  self.checkBounds = function() {
    let hero = self.settings.hero,
        width = self.settings.canvasWidth,
        height = self.settings.canvasHeight;

    if (hero.posX + hero.width > width) {
      hero.posX = width - hero.width;
    }
    if (hero.posX < 0) {
      hero.posX = 0;
    }
    if (hero.posY < 0) {
      hero.posY = 0;
    }
    if (hero.posY + hero.height > height) {
      hero.posY = height - hero.height;
    }
  };

  //create fireball
  self.createFireball = function() {
    if (!self.settings.fireball && self.settings.gameTimer) {
      let audio = new Audio();
      audio.src = self.settings.fireballSound;
      audio.play();
      self.settings.fireball = new Fireball(self.settings.fireballImg);
      let fireball = self.settings.fireball,
          hero = self.settings.hero;
      fireball.posX = hero.posX + fireball.width / 3.5;
      fireball.posY = hero.posY + fireball.height / 5;
      fireball.finishPosX = (event.clientX - event.target.getBoundingClientRect().x) - fireball.width / 2;
      fireball.finishPosY = (event.clientY - event.target.getBoundingClientRect().y) - fireball.height / 2;
    }
  };

  // fireball moves
  self.moveFireball = function() {
    let fireball = self.settings.fireball,
        width = self.settings.canvasWidth,
        height = self.settings.canvasHeight;
    if (self.settings.fireball) {
      if (fireball.posX + fireball.width > width || fireball.posX < 0 || fireball.posY + fireball.height > height || fireball.posY < 0) {
        self.settings.fireball = null;
      } else {
        let x0 = fireball.startPosX,
            y0 = fireball.startPosY,
            x1 = fireball.finishPosX,
            y1 = fireball.finishPosY,
            speed = fireball.speed,
            way = Math.sqrt((x1 - x0) * (x1 - x0) + (y1 - y0) * (y1 - y0));
        fireball.posX += (x1 - x0) * speed / way;
        fireball.posY += (y1 - y0) * speed / way;
        if (self.killEnemies()) {
          self.settings.fireball = null;
          self.updateScore();
        } else {
          self.drawFireball();
        }
      }
    }
  };

  // draw fireball
  self.drawFireball = function() {
    self.settings.fireball.updateSprite();
    myView.drawFireball(self.settings.fireball);
  };

  //kill enemies
  self.killEnemies = function() {
    for (let i = 0; i < self.settings.enemies.length; i++) {
      if (self.collisions(self.settings.fireball, self.settings.enemies[i])) {
        let audio = new Audio();
        audio.src = self.settings.enemyDieSound;
        audio.play();
        return self.settings.enemies.splice(i, 1);
      }
    }
  };

  // reset score
  self.updateScore = function() {
    self.settings.score += 1;
    myView.updateScore(self.settings.score);
  };

  // change window size
  self.resize = function() {
    //window.innerWidth/innerHeight saves current browser's window size
    self.settings.canvasWidth = window.innerWidth * 0.8;
    self.settings.canvasHeight = window.innerHeight * 0.7;
    let hero = self.settings.hero,
        enemies = self.settings.enemies,
        fireball = self.settings.fireball;
    if (hero) {
      hero.width = self.settings.canvasWidth / 23;
      hero.height = self.settings.canvasHeight / 17;
      for (let i = 0; i < enemies.length; i++) {
        enemies[i].width = self.settings.canvasWidth / 30;
        enemies[i].height = self.settings.canvasHeight / 20;
      }
    }
    if (fireball) {
      fireball.width = self.settings.canvasWidth / 39;
      fireball.height = self.settings.canvasHeight / 39;
    }
  };

  // check input value
  self.checkValue = function(input) {
    if (input.value && input.value.length > 2) {
      myView.activateButton();
    } else {
      myView.deactivateButton();
    }
  };

  // save data
  self.saveData = function(input) {
    let name = input.value,
        score = self.settings.playerScore;
    myAppDB.collection('results').doc(`player_${name.replace(/\s/g, "").toLowerCase()}`).set({
      player: `${name}`,
      score: `${score}`,
    })
        .then(function() {
          console.log('result saved');
        })
        .catch(function(error) {
          console.log('error cannot save result: ', error);
        });
    myView.clearInput(input);
    myView.closeModal();
  };

  // get result from firebase
  self.getResult = function() {
    self.settings.resultData = [];
    myAppDB.collection('results').get()
        .then(function(querySnapshot) {
          querySnapshot.forEach(function(doc) {
            self.settings.resultData.push(doc.data());
            console.log(`${doc.id} => ${doc.data().player} \(${doc.data().score}\)`);
          });
          self.sortD();
          self.printResult();
        });
  };

  // sort data
  self.sortD = function() {
    let result = self.settings.resultData;
    result.sort(function(a, b) {
      return b.score - a.score;
    })
  };

  // print result
  self.printResult = function() {
    if (self.settings.resultData.length < 10) {
      for (let i = 0; i < self.settings.resultData.length; i ++) {
        myView.printResult(self.settings.resultData[i]);
      }
    } else {
      for (let i = 0; i < 10; i ++) {
        myView.printResult(self.settings.resultData[i]);
      }
    }
  };

  // close modal
  self.closeModal = function() {
    myView.closeModal();
  };

  ////////////////////// Sprites //////////////////////

  function Enemy(url) {
    switch (self.getRandom(1, 4)) {
      case 1:  // left
        this.posX = 0;
        this.posY = self.settings.canvasHeight * Math.random();
        break;
      case 2:  // top
        this.posX = Math.random() * self.settings.canvasWidth;
        this.posY = 0;
        break;
      case 3:  // bottom
        this.posX = Math.random() * self.settings.canvasWidth;
        this.posY = self.settings.canvasHeight - 30;
        break;
      case 4:  // right
        this.posX = self.settings.canvasWidth - 30;
        this.posY = self.settings.canvasHeight * Math.random();
        break;
    }
    this.sizeX = 40;
    this.sizeY = 35.25;
    this.width = self.settings.canvasWidth / 30;
    this.height = self.settings.canvasHeight / 20;
    this.frameMax = 3;
    this.spriteDefault = new Sprite(url, this.sizeX, 0, this.frameMax, this.sizeX, this.sizeY, this.width, this.height);
    this.sprite = this.spriteDefault;
    this.speed = 1;
    this.updateSprite = function () {
      this.sprite.update();
    }
  }

  function Hero(url) {
    this.sizeX = 33;
    this.sizeY = 47;
    this.width = self.settings.canvasWidth / 37;
    this.height = self.settings.canvasHeight / 17;
    this.minWidth = 40;
    this.minHeight = 50;
    this.posX = self.settings.canvasWidth / 2 - this.width / 2;
    this.posY = self.settings.canvasHeight / 2 - this.height / 2;
    this.speed = 5;
    this.frameMax = 3;
    this.spriteDefault = new Sprite(url, this.sizeX, 0, this.frameMax, this.sizeX, this.sizeY, this.width, this.height);
    this.spriteLeft = new Sprite(url, this.sizeX, this.sizeY, this.frameMax, this.sizeX, this.sizeY, this.width, this.height);
    this.spriteRight = new Sprite(url, this.sizeX, this.sizeY * 2, this.frameMax, this.sizeX, this.sizeY, this.width, this.height);
    this.spriteUp = new Sprite(url, this.sizeX, this.sizeY * 3, this.frameMax, this.sizeX, this.sizeY, this.width, this.height);
    this.sprite = this.spriteDefault;
    this.updateSprite = function () {
      this.sprite.update();
    };
    this.moveLeft = function () {
      this.posX -= this.speed;
    };
    this.moveRight = function () {
      this.posX += this.speed;
    };
    this.moveTop = function () {
      this.posY -= this.speed;
    };
    this.moveBottom = function () {
      this.posY += this.speed;
    }
  }

  function Fireball(url) {
    this.sizeX = 133.8;
    this.sizeY = 134.25;
    this.width = self.settings.canvasWidth / 39;
    this.height = this.width;
    this.startPosX = self.settings.hero.posX;
    this.startPosY = self.settings.hero.posY;
    this.posX = null;
    this.posY = null;
    this.finishPosX = null;
    this.finishPosY = null;
    this.speed = 10;
    this.frameMax = 6;
    this.sprite = new Sprite(url, this.sizeX, 0, this.frameMax, this.sizeX, this.sizeY, this.width, this.height);
    this.updateSprite = function () {
      this.sprite.update();
    }
  }

  function Sprite(url, startX, startY, frameMax, frameWidth, frameHeight, width, height) {
    this.img = new Image();
    this.img.src = url;
    this.startY = startY;
    this.frameWidth = frameWidth;
    this.frameHeight = frameHeight;
    this.width = width;
    this.height = height;
    this.interval = 0;
    this.frame = 0;
    this.frameMax = frameMax;
    this.update = function () {
      this.interval++;
      if (this.interval % 12 === 0) {
        this.frame++;
        if (this.frame > this.frameMax - 1) {
          this.frame = 0
        }
      }
    }
  }
}