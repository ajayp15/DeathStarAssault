/*
	Game scene & objects
*/
var scene
var ground
var plane
var obstacles
var environment
var walls
var enemies

/*
	Game Constants
*/
var showStats = true; // turns stats on and off
var floorWidth = 10
var floorHeight = 50

/*
	Game variables
*/
var clock;
var objectiveClock;
var stats;
var statusDisplay;
var HPText;
var HPBar;
var scoreText;
var score;
var finishedShowingObjectivePhase1 = false
var objectiveDialog;

/*
	Game user inputs
*/
var planeVelocityX = 0
var planeVelocityY = 0
var keyboard = {}

init();

function init() {
	setup();	// set up the game
	animate();	//call game loop
}

function setup(){
	/*
		Initialize game variables
	*/
	hasCollided=false
	score=0
	clock=new THREE.Clock()
	clock.start()
	objectiveClock = new THREE.Clock()
	objectiveClock.start()

	scene = new Scene()
	ground = new Ground(scene)
	walls = new Walls(scene)
	environment = new Environment();
	plane = new Plane(scene, walls, ground)
	enemies = new Enemies(scene, plane)

	scene.addMesh(ground.mesh)
	scene.addMesh(plane.mesh, false)
	scene.addMesh(environment.mesh)

	// add the renderer to the actual html
	document.body.appendChild(scene.renderer.domElement)

	// Add statistics module (shows FPS, etc.)
	if (showStats) {
		stats = new Stats();
		document.body.appendChild(stats.dom);
	}

	window.addEventListener('resize', onWindowResize, false);//resize callback

	document.onkeydown = handleKeyDown;
	document.onkeyup = handleKeyUp;

	statusDisplay = createStatusDisplay(scene)
	scoreText = statusDisplay.score
	HPText = statusDisplay.hpText
	HPBar = statusDisplay.hpBar

	objectiveDialog = createInitialObjectiveDialog(scene)
}

function gameOver() {

}

function animate(){
	if (showStats) {
		stats.update()
	}
	if (plane.HP <= 0) {
		gameOver()
		return
	}
	if (!finishedShowingObjectivePhase1 && objectiveClock.getElapsedTime() > 5) {
		document.body.removeChild(objectiveDialog)
		finishedShowingObjectivePhase1 = true
	}

	update();
	render();
	requestAnimationFrame(animate);//request next update
}

function update() {
	var delta = clock.getDelta() // use this to adjust for variable frame rates
	if (finishedShowingObjectivePhase1) {
		enemies.handleEnemyMovements(delta)
		enemies.handleLaserCollisions(plane.shots)
		enemies.handleGenericLaserMovements(delta)
	}
	
	walls.handleWallMovements(delta)
	ground.handleGroundMovements(delta)
	plane.handlePlaneMovement(planeVelocityX, planeVelocityY, delta);
	plane.handleLaserMovements(delta);
	scene.handleCameraMovement(planeVelocityX, planeVelocityY, 0, plane, delta, walls, ground);
}

function render(){
	scene.renderer.render(scene.scene, scene.camera);
}

function handleKeyDown(keyEvent){
	// possible TODO: need to add clock.delta() here? or does velocity solve the issue
	if ( keyEvent.keyCode === 37) { // left
		planeVelocityX = -planeVelocityConst
		keyboard[37] = true
	} else if ( keyEvent.keyCode === 38) { // up
		planeVelocityY = planeVelocityConst
		keyboard[38] = true
	} else if ( keyEvent.keyCode === 39) { // right
		planeVelocityX = planeVelocityConst
		keyboard[39] = true
	} else if ( keyEvent.keyCode === 40) { // down
		planeVelocityY = -planeVelocityConst
		keyboard[40] = true
	} else if ( keyEvent.keyCode == 32) { // space
		keyboard[32] = true
		plane.shootLaser();
	}
}

function handleKeyUp(keyEvent){
	// TODO: there is still a bug if you rapidly press buttons, you might end
	// up going left when you are actually pressing right --> might be because
	// keyboard detection isn't done in the update loop?
	if (keyEvent.keyCode == 37) {
		keyboard[37] = false
	} else if (keyEvent.keyCode == 38) {
		keyboard[38] = false
	}	else if (keyEvent.keyCode == 39) {
		keyboard[39] = false
	} else if (keyEvent.keyCode == 40) {
		keyboard[40] = false
	}

	if (!keyboard[37] && !keyboard[39]) {
		planeVelocityX = 0
	}
	if (!keyboard[38] && !keyboard[40]) {
		planeVelocityY = 0
	}
}

function onWindowResize() {
	scene.sceneHeight = window.innerHeight - windowOffset;
	scene.sceneWidth = window.innerWidth - windowOffset;
	scene.renderer.setSize(scene.sceneWidth, scene.sceneHeight);
	scene.camera.aspect = scene.sceneWidth/scene.sceneHeight;
	scene.camera.updateProjectionMatrix();
}
