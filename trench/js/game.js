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
var wallMovementSpeed = 20
var slowDownRate = wallMovementSpeed / 5
var initWallMovementSpeed = wallMovementSpeed

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

function resetGameStateT() {
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
}

function resetToBeginning() {
	location.reload()
}

/*
	Game user inputs
*/
var planeVelocityX = 0
var planeVelocityY = 0
var keyboard = {}

function initT() {
	resetGameStateT();
	setupT();	// set up the game
	animateT();	//call game loop
}

function setupT(){
	/*
		Initialize game variables
	*/
	hasCollided=false
	score=0
	clock=new THREE.Clock()
	clock.start()
	objectiveClock = new THREE.Clock()
	objectiveClock.start()

	scene = new SceneT()
	explosions = new Explosions(scene)
	ground = new Ground(scene)
	walls = new Walls(scene, explosions)
	environment = new EnvironmentT();
	plane = new Plane(scene, walls, ground, explosions)
	enemies = new Enemies(scene, plane, explosions)

	// scene.addMesh(ground.mesh)
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

	document.onkeydown = handleKeyDownT;
	document.onkeyup = handleKeyUpT;

	statusDisplay = createStatusDisplayT(scene)
	scoreText = statusDisplay.score
	HPText = statusDisplay.hpText
	HPBar = statusDisplay.hpBar

	objectiveDialog = createInitialObjectiveDialogT(scene)
}

function dispose3(obj) {
	if (!obj) return
    /**
     *  @author Marco Sulla (marcosullaroma@gmail.com)
     *  @date Mar 12, 2016
     */

    var children = obj.children;
    var child;

    if (children) {
        for (var i=0; i<children.length; i+=1) {
            child = children[i];

            dispose3(child);
        }
    }

    var geometry = obj.geometry;
    var material = obj.material;

    if (geometry) {
        geometry.dispose();
    }

    if (material) {
        var texture = material.map;

        if (texture) {
			if (material.length) {
				for (var i = 0; i < material.length; i++) {
					material[i].map.dispose()
				}
			} else {
				texture.dispose();
			}
        }

		if (material.dispose) {
			material.dispose()
		}
    }
}

function disposeOfGameObjectsT() {
	for (var i = scene.scene.children.length - 1; i >= 0; i--) {
		dispose3(scene.scene.children[i])
	}
}

function restartGameT() {
	console.log("Restarting game.")
	disposeOfGameObjectsT()

	if (document.body.contains(scene.renderer.domElement)) {
		document.body.removeChild(scene.renderer.domElement)
	}
	if (document.body.contains(gameOverDialog)) {
		document.body.removeChild(gameOverDialog)
	}
	if (document.body.contains(document.getElementById("statusDisplay"))) {
		document.body.removeChild(document.getElementById("statusDisplay"))
	}
	resetGameStateT()
	THREE.Cache.clear() // clear cache

	initT()
}

function handleGameOverT() {
	plane.blowUp()
	gameOver = true
	var phase = (inPhase2) ? "phase2" : "default"
	gameOverDialog = showGameOverDialogT(scene, phase)
}

function animateT(){
	var delta = clock.getDelta() // use this to adjust for variable frame rates
	if (showStats) {
		stats.update()
	}
	if (plane.HP <= 0 && !showingGameOverScreen) {
		handleGameOverT()
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
		objectiveDialog = createFinalObjectiveDialogT(scene)
		enemies.reset()
		plane.reset()

		// generate the back wall that you will shoot the proton torpedos into
		walls.createBackWall()

		// and also slowly reduce the movement speed of the walls to make it seem more
		// like slow motion
		objectiveClock.start()
		reducingWallSpeed = true
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
			video.src = "trench/images/giphy.gif"
			// video.style.zIndex = 100

			// remove renderer and play the video
			document.body.removeChild(scene.renderer.domElement)
			document.body.removeChild(document.getElementById("statusDisplay"))
			document.body.appendChild(video)

			// show restart button here TODO, fix this
			setTimeout(function() {
				var video = document.getElementById("video")
				document.body.removeChild(video)

				gameOverDialog = showGameOverDialogT(scene, "deathStarDestroyed")
			}, endGameCutsceneTime)
		}, 1500)
	}

	updateT(delta);
	renderT();
	requestAnimationFrame(animateT);//request next update
}

function updateT(delta) {
	if (finishedShowingObjectivePhase1 && !gameOver &&!finishedPhase1) {
		enemies.handleEnemyMovements(delta)
		enemies.handleLaserCollisions(plane.shots)
		enemies.handleGenericLaserMovements(delta)
	}

	// always do this, so that we don't have frozen explosions
	// enemies.updateEnemyExplosions(delta)
	explosions.updateExplosions(delta)

	// almost always do this, looks cool as movement in the background
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

function renderT(){
	scene.renderer.render(scene.scene, scene.camera);
}

function handleKeyDownT(keyEvent){
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

function handleKeyUpT(keyEvent){
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
