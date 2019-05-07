/*
	Game scene & objects
*/
var scene
var ground
var plane
var obstacles

/*
	Game Constants
*/
var showStats = true; // turns stats on and off
var floorWidth = 10
var floorHeight = 50
var objectGenerationTime = 0.5;

/*
	Game variables
*/
var clock;
var hasCollided;
var stats;
var scoreText;
var score;

/*
	Game user inputs
*/
var planeVelocityX = 0

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

	scene = new Scene()
	ground = new Ground(scene.sceneWidth, scene.sceneHeight)
	plane = new Plane()
	obstacles = new Obstacles(scene)

	scene.addMesh(ground.mesh)
	scene.addMesh(plane.mesh, true)

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

	scoreText = document.createElement('div');
	scoreText.style.position = 'absolute';
	//text2.style.zIndex = 1;    // if you still don't see the label, try uncommenting this
	scoreText.style.width = 100;
	scoreText.style.height = 100;
	//scoreText.style.backgroundColor = "blue";
	scoreText.innerHTML = "0";
	scoreText.style.top = 50 + 'px';
	scoreText.style.left = 10 + 'px';
	document.body.appendChild(scoreText);
}

function animate(){
	if (showStats) {
		stats.update()
	}
	update();
	render();
	requestAnimationFrame(animate);//request next update
}

function update() {
	obstacles.handleObstacleMovement();
	obstacles.doObjectLogic();
	plane.handlePlaneMovement();

	if(clock.getElapsedTime() > objectGenerationTime){
		clock.start(); // restart the clock
		obstacles.addBasicObstacle(true)

		// add score if player still hasn't collided with anything
		if(!hasCollided){
			score += 2 * objectGenerationTime;
			scoreText.innerHTML="Score: " + score.toString();
		}
	}
}

function render(){
	if (hasCollided) {
		return;
	}
	renderer.render(scene, camera);
}

function handleKeyDown(keyEvent){
	if ( keyEvent.keyCode === 37) {//left
		planeVelocityX = -0.1
	} else if ( keyEvent.keyCode === 39) {//right
		planeVelocityX = 0.1
	}
}

function handleKeyUp(keyEvent){
	if (keyEvent.keyCode === 37 || keyEvent.keyCode === 39) {
		planeVelocityX = 0
	}
}

function onWindowResize() {
	sceneHeight = window.innerHeight - windowOffset;
	sceneWidth = window.innerWidth - windowOffset;
	renderer.setSize(sceneWidth, sceneHeight);
	camera.aspect = sceneWidth/sceneHeight;
	camera.updateProjectionMatrix();
}
