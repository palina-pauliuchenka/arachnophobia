const appView = new View(),
  appModel = new Model(),
  appController = new Controller(),
  container = document.getElementById('app');

appView.init(container);
appModel.init(appView);
appController.init(appModel, container);