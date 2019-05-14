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

var didSwitchToOtherGame = false

function restartGameDS() {
	/*for (var i = scene.scene.children.length - 1; i >= 0; --i) {
		dispose3(scene.scene.children[i])
	}
	scene.scene.dispose()
	ship.cleanup()
	deathstar.cleanup()
	delete ship
	delete deathstar
	THREE.Cache.clear()*/

	document.body.removeChild(losingDialog)
	document.body.removeChild(scene.renderer.domElement)
	document.body.removeChild(statusDisplay.dialog)
	if (showStats) {
		document.body.removeChild(stats.dom);
	}
	location.reload()
}

function initDS() {
	setupDS();
	animateDS();
}

function setupDS(){
	gameOver = false
	didWin = false
	introComplete = false
	objectiveDialogFinished = false
	losingDialogDisplayed = false
	beganPlayingEnding = false

	turretsDestroyed = 0
	keyboard = {}

	scene = new SceneDS()

	var environment = new EnvironmentDS();
	scene.addObj(environment.mesh);

	var deathstar_position = new THREE.Vector3(0, 0, 0);
	deathstar = new DeathstarDS(
									deathstarPlaneSize,
									deathstarTurretCount,
									deathstarSmallStructureCount);
	scene.addObj(deathstar.mesh, true);

	ship = new ShipDS(scene);

	statusDisplay = new StatusDisplayDS()

	document.body.appendChild(scene.renderer.domElement)

	gameClock = new THREE.Clock();
	gameClock.start();

	// Add statistics module (shows FPS, etc.)
	if (showStats) {
		stats = new Stats();
		document.body.appendChild(stats.dom);
	}

	document.onkeydown = handleKeyDownDS;
	document.onkeyup = handleKeyUpDS;
	window.addEventListener('resize', onWindowResizeDS, false);

	objectiveClock = new THREE.Clock();
	objectiveDialog = createObjectiveDialogDS()
	objectiveClock.start();
}

function animateDS(){
	if (didSwitchToOtherGame) { return }
	if (showStats) {
		stats.update()
	}
	if (!gameOver) {
		updateDS();
	} else {
		if (didWin == true) {
			updateDS();
			if (beganPlayingEnding == false) {
				beganPlayingEnding = true
				playEndingClipDS()
			}
		} else {
			if (losingDialogDisplayed == false) {
				var audio = new Audio('../common/sounds/weeoow.mp3');
	      audio.play();
				losingDialog = createLosingDialogDS()
				losingDialogDisplayed = true
			}
		}
	}

	renderDS();
	requestAnimationFrame(animateDS);
}

function updateDS() {
	if (ship.shipLoaded == false) { return }
	if (!introComplete) {
		handleIntroDS()
	}
	var dt = gameClock.getDelta();
	ship.update(dt, scene.camera);
	if (introComplete) {
		deathstar.update(dt);
		updateExplosionsDS(dt);
		checkSceneForCollisionsDS(ship, deathstar);
	}
}

function handleIntroDS() {
	if (objectiveClock.getElapsedTime() >= timeToShowObjectiveScreen && objectiveDialogFinished == false) {
		document.body.removeChild(objectiveDialog)
		objectiveDialogFinished = true
		sFoilDialog = createSFoilActionDialogDS()
	}
	if (keyboard[SKEY] == true && objectiveDialogFinished == true) {
		document.body.removeChild(sFoilDialog)
		introComplete = true
		ship.toggleSFoils();
		var audio = new Audio('../common/sounds/asteroid.mp3');
		audio.volume = 0.5
		audio.play()
	}
}

function renderDS(){
	scene.renderer.render(scene.scene, scene.camera);
}

function handleKeyDownDS(keyEvent){
	handleKeyEventDS(keyEvent, true);
}

function handleKeyUpDS(keyEvent){
	handleKeyEventDS(keyEvent, false);
}

function handleKeyEventDS(keyEvent, val) {
	keyboard[keyEvent.keyCode] = val
}

function onWindowResizeDS() {
	scene.sceneHeight = window.innerHeight - windowOffset;
	scene.sceneWidth = window.innerWidth - windowOffset;
	scene.renderer.setSize(scene.sceneWidth, scene.sceneHeight);
	scene.camera.aspect = scene.sceneWidth/scene.sceneHeight;
	scene.camera.updateProjectionMatrix();
}

function playEndingClipDS() {
	setTimeout(function() {
		var video = document.createElement('img')
		video.id = "video"
		video.style.width = "100%"
		video.style.height = "100%"
		video.style.position = "fixed"
		video.src = "../surface/images/trench.gif"

		// remove renderer and play the video
		document.body.removeChild(scene.renderer.domElement)
		document.body.removeChild(statusDisplay.dialog)
		document.body.prepend(video)

		setTimeout(function() {
			var video = document.getElementById("video")
			document.body.removeChild(video)
			didSwitchToOtherGame = true
			initT();
		}, 10000)
	}, 1500)
}
