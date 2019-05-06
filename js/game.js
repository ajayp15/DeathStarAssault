/*
	GENERAL TODOS:
		Modularize this code better:
		create more js files, and use a similar type of idea of modularization
		as in assignment 2, where there are scene objects, and variables to the
		objects --> this will allow faster editing for different files concurrently
*/

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
var turnSpeed = 0.25;
var maxVelocity = 0.5;
var windowOffset = 10; // to make it not have scroll bars

/*
	Logical constants/variables
*/
var clock;
var hasCollided;
var stats;
var scoreText;
var score;

var velocity = 0


var gravity=0.005;



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
	// heroRollingSpeed=(rollingSpeed*worldRadius/heroRadius)/5;
	sphericalHelper = new THREE.Spherical();
	pathAngleValues=[1.52,1.57,1.62];

	/*
		Initialize scene general parameters
	*/
	sceneWidth = window.innerWidth - windowOffset;
	sceneHeight = window.innerHeight - windowOffset;
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
	addPlane();
	addLight();
	// addExplosion();

	// TODO: maybe rotate camera more down onto scene, and move it up (to make it more
	// aerial?)
	camera.position.z = 6.5;
	camera.position.y = 2.5;

	// TODO: this faces the camera towards the object, is it better?
	camera.lookAt(plane.position)
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

  // var infoText = document.createElement('div');
	// infoText.style.position = 'absolute';
	// infoText.style.width = 100;
	// infoText.style.height = 100;
	// infoText.style.backgroundColor = "yellow";
	// infoText.innerHTML = "UP - Jump, Left/Right - Move";
	// infoText.style.top = 10 + 'px';
	// infoText.style.left = 10 + 'px';
	// document.body.appendChild(infoText);
}

/*
		HELPER METHODS FOR CREATING SCENE
*/
// creates the main plane
function addPlane(){
	// arbitrary size
	var boxGeometry = new THREE.BoxGeometry(0.4, 0.1, 0.5)
	var boxMaterial = new THREE.MeshStandardMaterial({color: 0xe5f2f2}) // shading: THREE.FlatShading
	var body = new THREE.Mesh(boxGeometry, boxMaterial)

	plane = new THREE.Object3D()
	plane.add(body)

	// TODO: add wing meshes onto this object

	// TODO: look into why shadows are not being cast onto the main floor
	plane.receiveShadow = true;
	plane.castShadow = true;

	// add to scene
	scene.add(plane)

	plane.position.set(0, planeInitY, planeInitZ)
}

// This creates a basic obstacle for the games
function createBasicObstacle(){
	// create a basic box mesh
	var boxGeometry = new THREE.BoxGeometry(1, 1, 1);
	var boxMaterial = new THREE.MeshStandardMaterial( { color: 0xffa500  } ); // shading:THREE.FlatShading
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
	ground.rotation.x += Math.PI / 2; // rotate it to make it appear as expected
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

	// TODO: don't just randomly place them, change the coordinate system of everything
	// to reflect where the plane is now

	// -1 to shift all of them up
	obstacle.position.set(x, y, -1);

	ground.add(obstacle);

	// push it to the general basicObstacles array
	basicObstacles.push(obstacle);
}

function checkIfCollided(plane, object) {
	// console.log("hi")
	// console.log(plane.children)
	// console.log(object)
	// source: https://stackoverflow.com/questions/11473755/how-to-detect-collision-in-three-js
	
	for (var i = 0; i < plane.children; i++) {
		var child = plane.children[i]
		for (var j = 0; j < child.geometry.vertices.length; j++) {
			var localVertex = child.geometry.vertices[vertexIndex].clone();
			var globalVertex = localVertex.applyMatrix4( child.matrix );
			var directionVector = globalVertex.sub( child.position );
			var originPoint = child.position.clone()
			
			var ray = new THREE.Raycaster( originPoint, directionVector.clone().normalize() );
			var collisionResults = ray.intersectObjects( object );
			if ( collisionResults.length > 0 && collisionResults[0].distance < directionVector.length() ) {
				console.log("Hit")
				return true
			}
		}
	}
	return false
}

// This removes objects that have gone out of view, and also checks if the
// plane is in contact with the obstacles
function doObjectLogic(){
	var objToRemove = []
	var pos = new THREE.Vector3()
	basicObstacles.forEach(function(element, index) {
		pos.setFromMatrixPosition(element.matrixWorld);

		// check if this has gone out of view zone
		// TODO: since the plane will be moving, this needs to be done for not only
		// the z planes, but also the x planes
		var outOfView = (pos.z > nearPlane)
		if (outOfView && element.visible) {
			objToRemove.push(element)
		} else { 
			// check if collision occurred with character
			// TODO: should make this more realistic (can check for actual collisiions, instead
			// of some sort of heuristic)
			if (pos.distanceTo(plane.position) <= 0.6) {
				console.log("hit")
				hasCollided = true;
			}
			// hasCollided = checkIfCollided(plane, element)

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

	// if sufficient time has passed, add in a new obstacle (the basic obstacle
	// function will handle if too many obstacles already in the scene)
	// note: this is sort of a heuristic, since we could generate more obstacles
	// when some go out of view?
	// TODO: play around with this generation time, or find a different way to do this
	// because we aren't generating max amount of objects nearly ever
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
// TODO: would adding in keyUp and keyDown handlers separately make this any smoother?
function handleKeyDown(keyEvent){
	if ( keyEvent.keyCode === 37) {//left
		handlePlaneMovement(true) // true == left
	} else if ( keyEvent.keyCode === 39) {//right
		handlePlaneMovement(false) // true == left
	}
}

var friction = 0.98
// TODO: lots of this is heuristic, make this smoother
// http://stemkoski.github.io/Three.js/Collision-Detection.html
// ^ that above link might have better movement handling, it is more specific to threejs
function handlePlaneMovement(left) {
	// based off of this:
	// https://stackoverflow.com/questions/15344104/smooth-character-movement-in-canvas-game-using-keyboard-controls
	var movement = (left) ? -turnSpeed : turnSpeed;

	// turn rapidly
	if (velocity > 0 && left) {
		velocity = 0.1 // make it small enough that it is smooth
	} else if (velocity < 0 && !left) {
		velocity = -0.1
	}

	// add movement to velocity
	if (Math.abs(velocity + movement) <= maxVelocity) {
		velocity += movement
	}

	// velocity *= friction // add friction (?), not sure if necessary

	// we must move the camera, as well as the plane, since we always want to
	// keep the camera focused on the plane
	plane.position.x += velocity
	camera.position.x += velocity

	// for added effect: rotate the plane in the direction it is trying to go
	// TODO: make this effect smoother, round it out
	if (velocity < 0) {
		plane.rotation.z = Math.PI / 4
	} else {
		plane.rotation.z = - Math.PI / 4
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
	// check if game over or not (TODO: this is just a temporary addition to stop animation)
	if (hasCollided) {
		return;
	}

	renderer.render(scene, camera);//draw
}
function gameOver () {
  // cancelAnimationFrame( globalRenderID );
  // window.clearInterval( powerupSpawnIntervalID );
}
function onWindowResize() {
	//resize & align
	sceneHeight = window.innerHeight - windowOffset;
	sceneWidth = window.innerWidth - windowOffset;
	renderer.setSize(sceneWidth, sceneHeight);
	camera.aspect = sceneWidth/sceneHeight;
	camera.updateProjectionMatrix();
}
