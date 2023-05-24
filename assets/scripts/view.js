'use strict';

function View() {
    let myViewContainer = null,
        settings = {};

    this.init = function(container) {
        myViewContainer = container;
        settings = {
            canvas: null,
            context: null,
        }
    };

    this.updateState = function(content, links, width, height) {
        myViewContainer.innerHTML = content || links.main;
        if (content === links.game) {
            settings.canvas = document.getElementById('canvas');
            settings.context = settings.canvas.getContext('2d');
            settings.context.canvas.width = width;
            settings.context.canvas.height = height;
        }
    };

    this.showStartButton = function() {
        myViewContainer.querySelector('#start').style.display = 'block';
    };

    this.hideStartButton = function() {
        myViewContainer.querySelector('#start').style.display = 'none';
    };

    this.showPauseButton = function() {
        myViewContainer.querySelector('#pause').style.display = 'block';
    };

    this.hidePauseButton = function() {
        myViewContainer.querySelector('#pause').style.display = 'none';
    };

    this.showResumeButton = function() {
        myViewContainer.querySelector('#resume').style.display = 'block';
    };

    this.hideResumeButton = function() {
        myViewContainer.querySelector('#resume').style.display = 'none';
    };

    this.closeModal= function() {
        myViewContainer.querySelector('#modal').style.display = 'none';
    };

    this.showModal = function() {
        myViewContainer.querySelector('#modal').style.display = 'block';
        myViewContainer.querySelector('#save').disabled = true;
    };

    this.activateButton = function() {
        myViewContainer.querySelector('#save').disabled = false;
    };

    this.deactivateButton = function() {
        myViewContainer.querySelector('#save').disabled = true;
    };

    this.clearInput = function(input) {
        input.value = '';
    };

    this.printResult = function(player) {
        let playerResults = document.getElementById('player-results'),
            row = document.createElement('tr'),
            td1 = document.createElement('td'),
            td2 = document.createElement('td');
        td1.innerHTML = player.player;
        td2.innerHTML = player.score;
        row.appendChild(td1);
        row.appendChild(td2);
        if (playerResults) {
            playerResults.appendChild(row);
        } else {
            document.getElementById('scoreTable').innerHTML += `
              <table class="table">
                <thead>
                  <tr>
                    <th>Player name</th>
                    <th>Result</th>
                  </tr>
                </thead>
                <tbody id="player-results"></tbody>
              </table>
              `;
            playerResults = document.getElementById('player-results');
            playerResults.appendChild(row);
        }
    };

    this.updateScore = function(score) {
        myViewContainer.querySelector('#score').innerHTML = 'Score: ' + score;
    };

    this.drawBoard = function(board) {
        settings.context.drawImage(board, 0, 0, settings.canvas.width, settings.canvas.height);
    };

    this.drawEnemies = function(enemies) {
        if (enemies) {
            for (let i = 0; i < enemies.length; i ++) {
                settings.context.drawImage(enemies[i].sprite.img, enemies[i].sprite.frame * enemies[i].sprite.frameWidth, enemies[i].sprite.startY, enemies[i].sprite.frameWidth, enemies[i].sprite.frameHeight, enemies[i].posX, enemies[i].posY, enemies[i].width, enemies[i].height, enemies[i].sprite.frameWidth, enemies[i].sprite.frameHeight);
            }
        }
    };

    this.drawHero = function(hero) {
        settings.context.drawImage(hero.sprite.img, hero.sprite.frame * hero.sprite.frameWidth, hero.sprite.startY, hero.sprite.frameWidth, hero.sprite.frameHeight, hero.posX, hero.posY, hero.width, hero.height, hero.sprite.frameWidth, hero.sprite.frameHeight);
    };

    this.drawFireball = function(bullet) {
        settings.context.drawImage(bullet.sprite.img, bullet.sprite.frame * bullet.sprite.frameWidth, bullet.sprite.startY, bullet.sprite.frameWidth, bullet.sprite.frameHeight, bullet.posX, bullet.posY, bullet.width, bullet.height, bullet.sprite.frameWidth, bullet.sprite.frameHeight);
    };

    this.draw = function() {
        settings.context.drawImage(settings.canvas, 0, 0, settings.canvas.width, settings.canvas.height)
    };
}