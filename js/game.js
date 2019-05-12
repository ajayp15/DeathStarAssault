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
var explosions

/*
	Game Constants
*/
var showStats = true; // turns stats on and off
var floorWidth = 10
var floorHeight = 50
var wallMovementSpeed = 20
var slowDownRate = wallMovementSpeed / 5
var initWallMovementSpeed = wallMovementSpeed
var phase1RequiredScore = 5

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
var objectiveDialog;
var gameOverDialog;

/*
	Game state variables
*/
var finishedShowingObjectivePhase1 = false
var gameOver = false
var showingGameOverScreen = false
var finishedPhase1 = false
var reducingWallSpeed = false
var destroyedDeathStar = false
var canShootLaser = false
var inPhase2 = false
var canShootTorpedos = true
var handledEndOfGame = false

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
	explosions = new Explosions(scene)
	ground = new Ground(scene)
	walls = new Walls(scene, explosions)
	environment = new Environment();
	plane = new Plane(scene, walls, ground, explosions)
	enemies = new Enemies(scene, plane, explosions)

	scene.addMesh(ground.mesh)
	// scene.addMesh(plane.mesh, false)
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

function restartGame() {
	console.log("Restarting Game.")
	finishedShowingObjectivePhase1 = false
	gameOver = false
	showingGameOverScreen = false
	finishedPhase1 = false

	// call individual functions from each of the enemies, etc. to restart them at
	// their initial locations
	plane.reset()
	enemies.reset()

	// get rid of game over dialog now
	document.body.removeChild(gameOverDialog)

	// reset the status bar with num destroyed and health
	scoreText.innerHTML = "TIEs Destroyed: " + 0
	HPText.innerHTML = "Ship Status: " + initialHP + "%"
	HPBar.value = 100

	// restart the clocks
	clock=new THREE.Clock()
	clock.start()
	objectiveClock = new THREE.Clock()
	objectiveClock.start()

	// display the objective screen again
	objectiveDialog = createInitialObjectiveDialog(scene)
}

function handleGameOver() {
	plane.blowUp()
	gameOver = true
	gameOverDialog = showGameOverDialog(scene)
}

function animate(){
	var delta = clock.getDelta() // use this to adjust for variable frame rates
	if (showStats) {
		stats.update()
	}
	if (plane.HP <= 0 && !showingGameOverScreen) {
		handleGameOver()
		showingGameOverScreen = true
	}
	if (!finishedShowingObjectivePhase1 && objectiveClock.getElapsedTime() > 5 && (!loadModel || plane.loaded)) {
		document.body.removeChild(objectiveDialog)
		finishedShowingObjectivePhase1 = true
		canShootLaser = true
	}
	if (plane.score >= phase1RequiredScore && !finishedPhase1) {
		// move onto phase 2 (shooting the proton torpedos)
		finishedPhase1 = true
		canShootLaser = false // don't need it anymore, proton torpedos now
		
		// start displaying something
		objectiveDialog = createFinalObjectiveDialog(scene)

		// remove the enemies from screen
		enemies.reset()
		plane.reset()

		// generate the back wall that you will shoot the proton torpedos into
		walls.createBackWall()

		// and also slowly reduce the movement speed of the walls to make it seem more
		// like slow motion
		objectiveClock.start()
		reducingWallSpeed = true

		// add in your aiming target mesh (projected onto the backwall)
		plane.addPlaneAim()
	}
	if (reducingWallSpeed) {
		if (objectiveClock.getElapsedTime() > 5 || wallMovementSpeed < initWallMovementSpeed / 5) {
			reducingWallSpeed = false
			inPhase2 = true

			document.body.removeChild(objectiveDialog)
		}

		wallMovementSpeed -= delta * slowDownRate

		// also move the ship to be behind the screen (so that it is pseudo first person)
		plane.mesh.position.z += delta * slowDownRate / 3
	}
	if (destroyedDeathStar && !handledEndOfGame) {
		// console.log("Game completed!")

		// explode back wall
		walls.backWallExplode()
		plane.removeAim()
		handledEndOfGame = true

		// play final cutscene and end
		setTimeout(function() {
			var video = document.createElement('img')
			video.id = "video"
			video.style.width = "100%"
			video.style.height = "100%"
			video.style.position = "fixed"
			video.src = "images/giphy.gif" 
			// video.style.zIndex = 100

			// remove renderer and play the video
			document.body.removeChild(scene.renderer.domElement)
			document.body.removeChild(document.getElementById("statusDisplay"))
			document.body.appendChild(video)

			// show restart button here TODO, fix this
			setTimeout(function() {
				finishedShowingObjectivePhase1 = false
				gameOver = false
				showingGameOverScreen = false
				finishedPhase1 = false
				reducingWallSpeed = false
				destroyedDeathStar = false
				canShootLaser = false
				inPhase2 = false
				canShootTorpedos = true
				handledEndOfGame = false
				wallMovementSpeed = 20
				slowDownRate = wallMovementSpeed / 5
				initWallMovementSpeed = wallMovementSpeed

				var video = document.getElementById("video")
				document.body.removeChild(video)
				init()
			}, 5000)
		}, 1500)
	}

	update(delta);
	render();
	requestAnimationFrame(animate);//request next update
}

function update(delta) {
	if (finishedShowingObjectivePhase1 && !gameOver &&!finishedPhase1) {
		enemies.handleEnemyMovements(delta)
		enemies.handleLaserCollisions(plane.shots)
		enemies.handleGenericLaserMovements(delta)
	}

	// always do this, so that we don't have frozen explosions
	// enemies.updateEnemyExplosions(delta)
	explosions.updateExplosions(delta)
	
	// do this always, looks cool as movement in the background
	walls.handleWallMovements(delta, finishedPhase1)
	ground.handleGroundMovements(delta)

	if (finishedShowingObjectivePhase1 && !gameOver) {
		plane.handlePlaneMovement(planeVelocityX, planeVelocityY, delta);
		scene.handleCameraMovement(planeVelocityX, planeVelocityY, 0, plane, delta, walls, ground);
	}

	if (finishedShowingObjectivePhase1 && !gameOver && !finishedPhase1) {
		plane.handleLaserMovements(delta);
	}
	if (inPhase2) {
		plane.updateProtonTorpedoLocations(delta)
		if (walls.checkIfBlewUpBackWall(plane.protonTorpedos)) {
			destroyedDeathStar = true
		}
	}
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
		if (canShootLaser) {
			plane.shootLaser();
		}
		if (inPhase2 && canShootTorpedos) {
			plane.shootProtonTorpedos()
			canShootTorpedos = false // only allow one shot
		}
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
