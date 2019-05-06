/*
	Main game rendering/logic variables
*/
var sceneWidth;
var sceneHeight;
var camera;
var scene;
var renderer;
var dom;
var sun;
var ground;

/*
	Character/obstacles
*/
var plane; // main sprite
var basicObstacles = []
// var basicObstaclesInPath = []
var ground; // main ground
var grid;
var obstaclesInScene = 0;

/*
	Constants
*/
var showStats = true; // turns stats on and off
var maxBasicObstacles = 50;
var floorWidth = 10 // arbitrarily chosen for now
var floorHeight = 50
var objectGenerationTime = 0.5;
var movementSpeed = 0.1
var nearPlane = 6 // sort of arbitrary for detecting if gone out of view
// this causes weird behavior: used to be 1.8
var planeInitY = 1.8 // arbitrary positioning (TODO: figure out for sure which axes are which)
var planeInitZ = 4.5

/*
	Logical constants/variables
*/
var clock;
var hasCollided;
var stats;
var scoreText;
var score;


var rollingGroundSphere;
var heroSphere;
var rollingSpeed=0.008;
var heroRollingSpeed;
var worldRadius=26;
var heroRadius=0.2;
var sphericalHelper;
var pathAngleValues;
var heroBaseY=1.8;
var bounceValue=0.1;
var gravity=0.005;
var leftLane=-1;
var rightLane=1;
var middleLane=0;
var currentLane;
var jumping;
var treeReleaseInterval=0.5;
var lastTreeReleaseTime=0;
var particleGeometry;
var particleCount=20;
var explosionPower =1.06;
var particles;


init();

function init() {
	// set up the scene
	createScene();

	//call game loop
	update();
}

function createScene(){
	/*
		Initialize character-specific variables
	*/
	hasCollided=false;
	score=0;
	treesInPath=[];
	basicObstacles = [];
	clock=new THREE.Clock();
	clock.start();
	heroRollingSpeed=(rollingSpeed*worldRadius/heroRadius)/5;
	sphericalHelper = new THREE.Spherical();
	pathAngleValues=[1.52,1.57,1.62];

	/*
		Initialize scene general parameters
	*/
	sceneWidth = window.innerWidth;
	sceneHeight = window.innerHeight;
	scene = new THREE.Scene(); // the 3d scene

	// this adds an exponentially increasing fog w/ distance (can experiment with scale factor)
	scene.fog = new THREE.FogExp2( 0xffffff, 0.05);
	
	// this adds a general color to the background
	// scene.background = new THREE.Color(0x000000)
	
	camera = new THREE.PerspectiveCamera( 60, sceneWidth / sceneHeight, 0.1, 1000 );//perspective camera
	renderer = new THREE.WebGLRenderer({alpha:true}); // allow somewhat transparent items (alpha buffer)
	renderer.setClearColor(0xfffafa, 1);
	renderer.shadowMap.enabled = true; //enable shadow
	renderer.shadowMap.type = THREE.PCFSoftShadowMap;
	renderer.setSize( sceneWidth, sceneHeight );

	// add the renderer to the actual html
	document.body.appendChild(renderer.domElement)

	/*
		Add statistics module (shows FPS, etc.)
	*/
	if (showStats) {
		stats = new Stats();
		document.body.appendChild(stats.dom);
	}

	/*
		Add objects into the scene
	*/
	createFloor();
	// could not add these initially, and just wait for them to have to be generated
	// by the general game loop
	// createAndAddInitialBasicObstacles(); // adds in basic sprites to block path
	addHero();
	addLight();
	// addExplosion();

	// TODO: maybe rotate camera more down onto scene, and move it up (to make it more
	// aerial?)
	camera.position.z = 6.5;
	camera.position.y = 2.5;
	window.addEventListener('resize', onWindowResize, false);//resize callback

	document.onkeydown = handleKeyDown;

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

  var infoText = document.createElement('div');
	infoText.style.position = 'absolute';
	infoText.style.width = 100;
	infoText.style.height = 100;
	infoText.style.backgroundColor = "yellow";
	infoText.innerHTML = "UP - Jump, Left/Right - Move";
	infoText.style.top = 10 + 'px';
	infoText.style.left = 10 + 'px';
	document.body.appendChild(infoText);
}

/*
		HELPER METHODS FOR CREATING SCENE
*/
// creates the main plane
function addHero(){
	var sphereGeometry = new THREE.DodecahedronGeometry( heroRadius, 1);
	var sphereMaterial = new THREE.MeshStandardMaterial( { color: 0xe5f2f2 ,shading:THREE.FlatShading} )
	jumping=false;
	heroSphere = new THREE.Mesh( sphereGeometry, sphereMaterial );
	heroSphere.receiveShadow = true;
	heroSphere.castShadow=true;
	scene.add( heroSphere );
	heroSphere.position.y = planeInitY;
	heroSphere.position.z = planeInitZ;
	currentLane=middleLane;
	heroSphere.position.x=currentLane;
}

// This creates a basic obstacle for the games
function createBasicObstacle(){
	// create a basic box mesh
	var boxGeometry = new THREE.BoxGeometry(1, 1, 1);
	var boxMaterial = new THREE.MeshStandardMaterial( { color: 0x33ff33, shading:THREE.FlatShading  } );
	var mesh = new THREE.Mesh(boxGeometry, boxMaterial);

	// can move around the mesh position, absolute position
	mesh.position.y = 0.25

	// create an object w/ this box (can add multiple meshes to this)
	var obj = new THREE.Object3D();
	obj.add(mesh);

	return obj;
}

// This function creates all of the initial basic obstacles
function createAndAddInitialBasicObstacles(){
	for(var i = 0; i < maxBasicObstacles; i++){
		addBasicObstacle(true); // could make this false?
	}
}

function createFloor(){
	// adds the main plane of the floor
	// can change floor width if decide to add walls to the scene
	floorWidth = sceneWidth // make it stretch to the whole width of screen
	var geometry = new THREE.PlaneGeometry(floorWidth, floorHeight);
	var material = new THREE.MeshBasicMaterial( {color: 0x4191E1, side: THREE.DoubleSide} );
	
	ground = new THREE.Mesh( geometry, material );
	ground.rotation.x = Math.PI / 2; // rotate it to make it appear as expected
	ground.position.y = 1 // set the plane to be y == 0 (can change)

	ground.receiveShadow = true;
	ground.castShadow = false;

	scene.add( ground );

	// add a grid to the floor
	var size = 50;
	var divisions = 10;

	var white = new THREE.Color(0x000000)
	grid = new THREE.GridHelper(size, divisions, white, white);
	// scene.add( grid );
}

// This adds a basic obstacle to the scene
// TODO: don't add them just randomly, incorporate gaps between them and also
// maybe "lanes" in the floor
function addBasicObstacle(startAtFarPlane){
	if (basicObstacles.length >= maxBasicObstacles) {
		console.log("hit max, size is: " + basicObstacles.length)
		return; // don't create more if we have already hit the max
	}
	
	var obstacle = createBasicObstacle();
	obstacle.visible = true;

	// place randomly across the floor
	var x = (2 * Math.random() - 1) * 10; // arbitrary values for now
	var y = (Math.random() - 1) * 15; // seems like y coords are negative to go forward
	
	if (startAtFarPlane) { // if they should start far away from the player (generated)
		y = -30 // arbitrary, should be based on screen height?
	}

	// -1 to shift all of them up
	obstacle.position.set(x, y, -1);

	ground.add(obstacle);

	// push it to the general basicObstacles array
	basicObstacles.push(obstacle);
}

// This removes objects that have gone out of view, and also checks if the
// plane is in contact with the obstacles
function doObjectLogic(){
	var objToRemove = []
	var pos = new THREE.Vector3()
	basicObstacles.forEach(function(element, index) {
		pos.setFromMatrixPosition(element.matrixWorld);

		// check if this has gone out of view zone
		if (pos.z > nearPlane && element.visible) {
			objToRemove.push(element)
		} else { 
			// check if collision occurred with character
			// TODO: should make this more realistic (can check for actual collisiions, instead
			// of some sort of heuristic)
			if (pos.distanceTo(heroSphere.position) <= 0.6) {
				console.log("hit")
				hasCollided = true;
			}
		}
	})

	// remove all necessary objects
	objToRemove.forEach(function(element, index) {
		indexInBasicObstacles = basicObstacles.indexOf(element)
		basicObstacles.splice(indexInBasicObstacles, 1); // remove it

		// remove from the scene as well
		element.visible = false
		scene.remove(element)
		console.log("Remove object")
	})
}

function update(){
	if (showStats) {
		stats.update()
	}

	//animate

	/*
		Go through for each of our obstacles currently, and move them closer to
		the near plane according to the moving speed of the plane
	*/
	for (var i = 0; i < basicObstacles.length; i++) {
		basicObstacles[i].position.y += movementSpeed
	}

	// rollingGroundSphere.rotation.x += rollingSpeed;
	heroSphere.rotation.x -= heroRollingSpeed;
	if(heroSphere.position.y<=heroBaseY){
		jumping=false;
		bounceValue=(Math.random()*0.04)+0.005;
	}
	heroSphere.position.y+=bounceValue;
	heroSphere.position.x=THREE.Math.lerp(heroSphere.position.x,currentLane, 2*clock.getDelta());//clock.getElapsedTime());
	bounceValue-=gravity;

	// if sufficient time has passed, add in a new obstacle (the basic obstacle
	// function will handle if too many obstacles already in the scene)
	// note: this is sort of a heuristic, since we could generate more obstacles
	// when some go out of view?
	if(clock.getElapsedTime() > objectGenerationTime){
		clock.start(); // restart the clock
		addBasicObstacle(true)

		// add score if player still hasn't collided with anything
		if(!hasCollided){
			score+= 2 * objectGenerationTime;
			scoreText.innerHTML="Score: " + score.toString();
		}
	}
	doObjectLogic();
	// doExplosionLogic();
	render();
	requestAnimationFrame(update);//request next update
}


/*
	General HELPER methods
*/
function handleKeyDown(keyEvent){
	if(jumping)return;
	var validMove=true;
	if ( keyEvent.keyCode === 37) {//left
		if(currentLane==middleLane){
			currentLane=leftLane;
		}else if(currentLane==rightLane){
			currentLane=middleLane;
		}else{
			validMove=false;
		}
	} else if ( keyEvent.keyCode === 39) {//right
		if(currentLane==middleLane){
			currentLane=rightLane;
		}else if(currentLane==leftLane){
			currentLane=middleLane;
		}else{
			validMove=false;
		}
	}else{
		if ( keyEvent.keyCode === 38){//up, jump
			bounceValue=0.1;
			jumping=true;
		}
		validMove=false;
	}
	//heroSphere.position.x=currentLane;
	if(validMove){
		jumping=true;
		bounceValue=0.06;
	}
}

// function doExplosionLogic(){
// 	if(!particles.visible)return;
// 	for (var i = 0; i < particleCount; i ++ ) {
// 		particleGeometry.vertices[i].multiplyScalar(explosionPower);
// 	}
// 	if(explosionPower>1.005){
// 		explosionPower-=0.001;
// 	}else{
// 		particles.visible=false;
// 	}
// 	particleGeometry.verticesNeedUpdate = true;
// }
// function explode(){
// 	particles.position.y=2;
// 	particles.position.z=4.8;
// 	particles.position.x=heroSphere.position.x;
// 	for (var i = 0; i < particleCount; i ++ ) {
// 		var vertex = new THREE.Vector3();
// 		vertex.x = -0.2+Math.random() * 0.4;
// 		vertex.y = -0.2+Math.random() * 0.4 ;
// 		vertex.z = -0.2+Math.random() * 0.4;
// 		particleGeometry.vertices[i]=vertex;
// 	}
// 	explosionPower=1.07;
// 	particles.visible=true;
// }

// function addExplosion(){
// 	particleGeometry = new THREE.Geometry();
// 	for (var i = 0; i < particleCount; i ++ ) {
// 		var vertex = new THREE.Vector3();
// 		particleGeometry.vertices.push( vertex );
// 	}
// 	var pMaterial = new THREE.ParticleBasicMaterial({
// 	  color: 0xfffafa,
// 	  size: 0.2
// 	});
// 	particles = new THREE.Points( particleGeometry, pMaterial );
// 	scene.add( particles );
// 	particles.visible=false;
// }

function addLight(){
	var hemisphereLight = new THREE.HemisphereLight(0xfffafa,0x000000, .9)
	scene.add(hemisphereLight);
	sun = new THREE.DirectionalLight( 0xcdc1c5, 0.9);
	sun.position.set( 12,6,-7 );
	sun.castShadow = true;
	scene.add(sun);
	//Set up shadow properties for the sun light
	sun.shadow.mapSize.width = 256;
	sun.shadow.mapSize.height = 256;
	sun.shadow.camera.near = 0.5;
	sun.shadow.camera.far = 50 ;
}

function render(){
    renderer.render(scene, camera);//draw
}
function gameOver () {
  //cancelAnimationFrame( globalRenderID );
  //window.clearInterval( powerupSpawnIntervalID );
}
function onWindowResize() {
	//resize & align
	sceneHeight = window.innerHeight;
	sceneWidth = window.innerWidth;
	renderer.setSize(sceneWidth, sceneHeight);
	camera.aspect = sceneWidth/sceneHeight;
	camera.updateProjectionMatrix();
}
