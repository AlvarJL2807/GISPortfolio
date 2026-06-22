Q3D.Config.localMode = true;

var container = document.getElementById("view"),
    app = Q3D.application,
    gui = Q3D.gui;


app.init(container);

app.loadSceneFile("./data/floodmap/scene.js", function (scene) {
  app.start();
}, function (scene) {
  console.log("3D Flooding Map successfully loaded.");
});