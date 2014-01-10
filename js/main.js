var camera, scene, renderer, gameTimer;

/**
 * Garbage loader-specific logic, bleh
 */
var loaderEnc = {
  geometry: null,
  material: null,
  mesh: null,
  spinVelocity: 0.12,
  ticks: 0,
  theta: 0.0,
};


function init() {
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1,10000);
  camera.position.z = 250;
  camera.position.y = 100;
  camera.position.x = 100;

  scene = new THREE.Scene();

  loaderEnc.geometry = new THREE.TextGeometry("Loading...",
                                              {
                                                size: 40,
                                                height: 10,
                                                curveSegments: 1,
                                                font: "helvetiker",
                                                weight: "normal",
                                                style: "normal",
                                                bevelEnabled: false,
                                                bevelThickness: 10,
                                                bevelSize: 8
                                              });
  loaderEnc.geometry.computeBoundingBox();

  loaderEnc.material = new THREE.MeshBasicMaterial(
    { color: 0xAADDFF, wireframe: false }
  );

  loaderEnc.mesh = new THREE.Mesh(loaderEnc.geometry, loaderEnc.material);
  loaderEnc.mesh.position.z -= 15;
  scene.add(loaderEnc.mesh);

  renderer = new THREE.WebGLRenderer({canvas: document.getElementById('renderCanvas')});
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMapEnabled = true;
  //renderer.shadowMapType = THREE.PCFSoftShadowMap;
  gameTimer = new THREE.Clock();
  gameTimer.start();
}

var ranOnce = false;
function runOnce() {
  if (ranOnce) {
    return;
  }
  ranOnce = true;
  camera.position.y = 200;

  scene.remove(loaderEnc.mesh);

  scene.add(g.currentMazeMesh);
  scene.add(g.playerMesh);




  //generate giant background plane
  var bg2 = new THREE.Mesh(new THREE.PlaneGeometry(bgsx * 2, bgsz * 2),
                           new THREE.MeshLambertMaterial({color: 0x111111, wireframe: false}));
  bg2.rotation.x = Math.PI * 3/2;
  bg2.position.y = -25;
  bg2.position.x += bgsx / 2;
  bg2.position.z += bgsz / 2;
  scene.add(bg2);

  scene.add(g.playerLight);
}


var camAngleOff = 0;

function animate() {
  requestAnimationFrame(animate);
  var delta = gameTimer.getDelta();

  //If the game's not loaded, spin the loader.
  if (!g.loaded) {
    loaderEnc.ticks++;
    if (loaderEnc.ticks >= 90) {
      loaderEnc.ticks = 0;
      loaderEnc.spinVelocity = 0.12;
    }

    if (loaderEnc.spinVelocity > 0.0) {
      loaderEnc.spinVelocity -= 0.001;
    }

    if (loaderEnc.spinVelocity < 0) {
      loaderEnc.spinVelocity = 0;
    }


    var tmpV3;

    //Get the centered position vector of the text and look at it as we fly around.
    tmpV3 = new THREE.Vector3();
    tmpV3.copy(loaderEnc.mesh.geometry.boundingBox.max);
    tmpV3.sub(loaderEnc.mesh.geometry.boundingBox.min);
    tmpV3.multiplyScalar(0.5);
    tmpV3.add(loaderEnc.mesh.position);


    //Wobble
    loaderEnc.theta += loaderEnc.spinVelocity / 4.5;
    camera.position.set(tmpV3.x, 25 * Math.sin(loaderEnc.theta), 150);

    camera.lookAt(tmpV3);


    renderer.render(scene, camera);
    return;
  }


  runOnce();

  camera.position.x = g.playerMesh.position.x;
  camera.position.y = 200 * Math.cos(camAngleOff);
  camera.position.z = g.playerMesh.position.z + 10 + 35 * Math.sin(camAngleOff);
  camera.lookAt(g.playerMesh.position);
  camera.rotation.z = 0;

  if (keymap.pressed['goUp']) {
    if (!wouldPlayerCollideWithMaze(new THREE.Vector3(0, 0, -1), delta * 40 + 1.5)) {
      g.playerMesh.position.z -= delta * 40;
    }
  }
  if (keymap.pressed['goRight']) {
    if (!wouldPlayerCollideWithMaze(new THREE.Vector3(1, 0, 0), delta * 40 + 1.5)) {
      g.playerMesh.position.x += delta * 40;
    }
  }
  if (keymap.pressed['goLeft']) {
    if (!wouldPlayerCollideWithMaze(new THREE.Vector3(-1, 0, 0), delta * 40 + 1.5)) {
      g.playerMesh.position.x -= delta * 40;
    }
  }
  if (keymap.pressed['goDown']) {
    if (!wouldPlayerCollideWithMaze(new THREE.Vector3(0, 0, 1), delta * 40 + 1.5)) {
      g.playerMesh.position.z += delta * 40;
    }
  }


  if (keymap.pressed['camDown']) {
    if (camAngleOff < Math.PI / 2) {
      camAngleOff += 0.01;
    }
    //camera.position.setY(camera.position.y - 0.5);
   // camera.position.setZ(camera.position.z - 5);
  }

  if (keymap.pressed['camUp']) {
    if (camAngleOff > 0) {
      camAngleOff -= 0.01;
    }
    //camera.position.setY(camera.position.y - 0.5);
   // camera.position.setZ(camera.position.z - 5);
  }

  g.playerMesh.rotation.y += 0.01;
  g.playerMesh.rotation.x += 0.02;


  //g.playerMesh.position.add(new THREE.Vector3(keymap.mX(), 0, keymap.mY()));
  g.crosshairMesh.position.set(g.playerMesh.position.x + 20 * keymap.mX(), 9, g.playerMesh.position.z + 20 * keymap.mY());
  g.playerLight.position.set(g.playerMesh.position.x + 5 * keymap.mX(), 10, g.playerMesh.position.z + 5 * keymap.mY());
  g.playerLight.target = g.crosshairMesh;

 // g.playerLight2.position.set(g.playerMesh.position.x, 20, g.playerMesh.position.z);

  renderer.render(scene, camera);



}

var g = new game();
init();
animate();
