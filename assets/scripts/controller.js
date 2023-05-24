'use strict';

function Controller() {
  let myModel = null,
      myControllerContainer = null,
      keys = null,
      self = this;

  this.init = function(model, container) {
    myModel = model;
    myControllerContainer = container;
    keys = {};

    // обновление статуса при изменении location.hash
    window.addEventListener('hashchange', self.updateState);
    // обновление состояния при загрузке
    window.addEventListener('load', self.updateState);
    // изменение размеров браузера
    window.addEventListener('resize', self.resize);
    // забираем event.target при клике
    window.addEventListener('click', self.setEventTarget);
  };

  self.updateState = function() {
    myModel.updateState();
    if (myControllerContainer.querySelector('#game')) {
      myControllerContainer.querySelector('#playerName').addEventListener('input', self.checkValue);
    }
  };

  self.resize = function() {
    myModel.updateState();
  };

  self.setEventTarget = function() {
    const {id} = this.event.target;
    if (id === 'start') {
      myModel.startGame();
      window.addEventListener('keydown', self.keyDown);
      window.addEventListener('keyup', self.keyUp);
    }
    if (id === 'pause') {
      myModel.pauseGame();
      window.removeEventListener('keydown', self.keyDown);
      window.removeEventListener('keyup', self.keyUp);
    }
    if (id === 'resume') {
      myModel.gameReturn();
      window.addEventListener('keydown', self.keyDown);
      window.addEventListener('keyup', self.keyUp);
    }
    if (id === 'canvas') {
      self.shot();
    }
    if(id === 'save') {
      self.saveData();
    }
    if (id === 'close') {
      self.closeModal();
    }
  };

  self.shot = function() {
    myModel.createFireball();
  };

  self.keyDown = function() {
    keys[event.keyCode] = 1;
  };

  self.keyUp = function() {
    delete (keys[event.keyCode]);
  };

  self.moveHero = function(keycode) {
    myModel.moveHero(keycode);
  };

  setInterval(function() {
    for (let keycode in keys) {
      self.moveHero(keycode);
    }
  }, 20);

  self.checkValue = function() {
    let input = myControllerContainer.querySelector('#playerName');
    myModel.checkValue(input);
  };

  self.saveData = function() {
    let input = myControllerContainer.querySelector('#playerName');
    myModel.saveData(input);
  };

  self.closeModal = function() {
    myModel.closeModal();
  }
}