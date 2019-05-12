/*
	game.js
*/

var gameClock

var objectiveClock
var objectiveDialog
var objectiveDialogFinished
var sFoilDialog
var losingDialog
var losingDialogDisplayed
var beganPlayingEnding

init()

function restartGame() {
	document.body.removeChild(losingDialog)
	document.body.removeChild(scene.renderer.domElement)
	document.body.removeChild(statusDisplay.dialog)
	if (showStats) {
		document.body.removeChild(stats.dom);
	}
	init()
}

function init() {
	setup();
	animate();
}

function setup(){
	gameOver = false
	didWin = false
	introComplete = false
	objectiveDialogFinished = false
	losingDialogDisplayed = false
	beganPlayingEnding = false

	turretsDestroyed = 0
	keyboard = {}

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

	statusDisplay = new StatusDisplay()

	document.body.appendChild(scene.renderer.domElement)

	gameClock = new THREE.Clock();
	gameClock.start();

	// Add statistics module (shows FPS, etc.)
	if (showStats) {
		stats = new Stats();
		document.body.appendChild(stats.dom);
	}

	document.onkeydown = handleKeyDown;
	document.onkeyup = handleKeyUp;
	window.addEventListener('resize', onWindowResize, false);

	objectiveClock = new THREE.Clock();
	objectiveDialog = createObjectiveDialog()
	objectiveClock.start();
}

function animate(){
	if (showStats) {
		stats.update()
	}
	if (!gameOver) {
		update();
	} else {
		if (didWin == true) {
			if (beganPlayingEnding == false) {
				beganPlayingEnding = true
				playEndingClip()
			}
		} else {
			if (losingDialogDisplayed == false) {
				losingDialog = createLosingDialog()
				losingDialogDisplayed = true
			}
		}
	}

	render();
	requestAnimationFrame(animate);
}

function update() {
	if (ship.shipLoaded == false) { return }
	if (!introComplete) {
		handleIntro()
	}
	var dt = gameClock.getDelta();
	ship.update(dt, scene.camera);
	if (introComplete) {
		deathstar.update(dt);
		updateExplosions(dt);
		checkSceneForCollisions(ship, deathstar);
	}
}

function handleIntro() {
	if (objectiveClock.getElapsedTime() >= timeToShowObjectiveScreen && objectiveDialogFinished == false) {
		document.body.removeChild(objectiveDialog)
		objectiveDialogFinished = true
		sFoilDialog = createSFoilActionDialog()
	}
	if (keyboard[SKEY] == true && objectiveDialogFinished == true) {
		document.body.removeChild(sFoilDialog)
		introComplete = true
		ship.toggleSFoils();
	}
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

function playEndingClip() {
	setTimeout(function() {
		var video = document.createElement('img')
		video.id = "video"
		video.style.width = "100%"
		video.style.height = "100%"
		video.style.position = "fixed"
		video.src = "images/trench.gif"

		// remove renderer and play the video
		//document.body.removeChild(scene.renderer.domElement)
		//document.body.removeChild(statusDisplay.dialog)
		document.body.prepend(video)

		setTimeout(function() {
			var video = document.getElementById("video")
			document.body.removeChild(video)
			gameOverDialog = showGameOverDialog(scene, "deathStarDestroyed")
		}, 11000)
	}, 1500)
}
