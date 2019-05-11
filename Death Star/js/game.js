/*
	game.js
*/

var scene;
var ship;
var deathstar;

var clock;

var cameraLook = new THREE.Vector3();

/*
	Game user inputs
*/
var keyboard = {}

/*
	Game state
*/
var gameOver = false

init();

function init() {
	setup();
	animate();
}

function setup(){
	scene = new Scene()

	var environment = new Environment();
	scene.addObj(environment.mesh);

	var deathstar_position = new THREE.Vector3(0, 0, 0);
	deathstar = new Deathstar(
									deathstarPlaneSize,
									deathstarTurretCount,
									deathstarSmallStructureCount);
	scene.addObj(deathstar.mesh, true);

	ship = new Ship(scene);

	var sunGeo = new THREE.SphereGeometry( 200, 100, 100 );
	var sunMat = new THREE.MeshBasicMaterial( {color: 0xf4b342} );
	var sun = new THREE.Mesh( sunGeo, sunMat );
	sun.position.set(3000, 3000, 3000);
	scene.addObj( sun );

	var ambient = new THREE.AmbientLight( 0xffffff, 0.5 );
	scene.addObj( ambient );

	var directional = new THREE.DirectionalLight( 0xffffff, 1);
	directional.position.set(3000, 3000, 3000);
	directional.castShadow = true;
	scene.addObj( directional );

	document.body.appendChild(scene.renderer.domElement)

	clock = new THREE.Clock();
	clock.start();

	// Add statistics module (shows FPS, etc.)
	if (showStats) {
		stats = new Stats();
		document.body.appendChild(stats.dom);
	}

	document.onkeydown = handleKeyDown;
	document.onkeyup = handleKeyUp;
	window.addEventListener('resize', onWindowResize, false);
}

function animate(){
	if (showStats) {
		stats.update()
	}
	if (!gameOver) {
		update();
	}
	render();
	requestAnimationFrame(animate);
}

function update() {
	if (ship.shipLoaded == false) { return }
	var dt = clock.getDelta();
	ship.update(dt, scene.camera);
	deathstar.update(dt);
	checkSceneForCollisions(ship, deathstar);
}

function render(){
	scene.renderer.render(scene.scene, scene.camera);
}

function handleKeyDown(keyEvent){
	handleKeyEvent(keyEvent, true);
}

function handleKeyUp(keyEvent){
	handleKeyEvent(keyEvent, false);
}

function handleKeyEvent(keyEvent, val) {
	keyboard[keyEvent.keyCode] = val
}

function onWindowResize() {
	scene.sceneHeight = window.innerHeight - windowOffset;
	scene.sceneWidth = window.innerWidth - windowOffset;
	scene.renderer.setSize(scene.sceneWidth, scene.sceneHeight);
	scene.camera.aspect = scene.sceneWidth/scene.sceneHeight;
	scene.camera.updateProjectionMatrix();
}
