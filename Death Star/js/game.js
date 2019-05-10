
var altitude = 5;

var scene;
var ship;
var deathstar;

var clock;

var cameraLook = new THREE.Vector3();

/*
	Game user inputs
*/
var keyboard = {}

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
									deathstar_plane_size,
									deathstar_turret_count,
									deathstar_small_structure_count);
	scene.addObj(deathstar.mesh, true);

	var ship_position = new THREE.Vector3(0, altitude, 0);
	ship = new Ship(scene, ship_position);

	var ambient = new THREE.AmbientLight( 0xffffff, 0.35 );
	scene.addObj( ambient );

	var sunGeo = new THREE.SphereGeometry( 200, 100, 100 );
	var sunMat = new THREE.MeshBasicMaterial( {color: 0xf4b342} );
	var sun = new THREE.Mesh( sunGeo, sunMat );
	sun.position.set(3000, 3000, 3000);
	scene.addObj( sun );

	var directional = new THREE.DirectionalLight( 0xffffff, 1);
	directional.position.set(3000, 3000, 3000);
	directional.castShadow = true;
	console.log(directional)
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
	update();
	render();
	requestAnimationFrame(animate);
}

function update() {
	var dt = clock.getDelta()
	ship.update(dt, scene.camera);
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
	/*if ( keyEvent.keyCode === LEFT) { // left
		keyboard[LEFT] = val
	} else if ( keyEvent.keyCode === UP) { // up
		keyboard[UP] = val
	} else if ( keyEvent.keyCode === RIGHT) { // right
		keyboard[RIGHT] = val
	} else if ( keyEvent.keyCode === DOWN) { // down
		keyboard[DOWN] = val
	} else if ( keyEvent.keyCode == SPACE) { // space
		keyboard[SPACE] = val
	} else if ( key)*/
	keyboard[keyEvent.keyCode] = val
}

function onWindowResize() {
	scene.sceneHeight = window.innerHeight - windowOffset;
	scene.sceneWidth = window.innerWidth - windowOffset;
	scene.renderer.setSize(scene.sceneWidth, scene.sceneHeight);
	scene.camera.aspect = scene.sceneWidth/scene.sceneHeight;
	scene.camera.updateProjectionMatrix();
}
