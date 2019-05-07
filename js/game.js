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
	Game Constants
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

/*
	Game user inputs
*/
var planeVelocityX = 0

init();

function init() {
	// set up the scene
	createScene();

	//call game loop
	animate();
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
	addPlane();
	addLight();

	camera.position.z = 6.5;
	camera.position.y = 2.5;

	// TODO: this faces the camera towards the object, is it better?
	camera.lookAt(plane.position)
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

	var texture = new THREE.TextureLoader().load( 'models/ju-87_obj/diff.jpg' );
	var material = new THREE.MeshPhongMaterial( { map: texture } );
	console.log(material);
	var loader = new THREE.OBJLoader();
  loader.load( 'models/ju-87_obj/ju-87.obj', function ( object ) {
		object.traverse( function ( node ) {
    	if ( node.isMesh ) node.material = boxMaterial;
	  } );
    object.rotation.z = Math.PI;
		object.rotation.y = 0 //Math.PI;
		object.scale.set(0.0015, 0.0015, 0.0015);
    scene.add( object );
		plane = object;
		plane.position.set(0, planeInitY, planeInitZ)
    //document.querySelector('h1').style.display = 'none';
  } );
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

function handleObstacleGeneration() {
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
}

function handleObstacleMovement() {
	/*
		Go through for each of our obstacles currently, and move them closer to
		the near plane according to the moving speed of the plane
	*/
	for (var i = 0; i < basicObstacles.length; i++) {
		basicObstacles[i].position.y += movementSpeed
	}
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
	handleObstacleMovement();
	handleObstacleGeneration();
	doObjectLogic();
	handlePlaneMovement();
}


/*
	General HELPER methods
*/
// TODO: would adding in keyUp and keyDown handlers separately make this any smoother?
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

// http://stemkoski.github.io/Three.js/Collision-Detection.html
// ^ that above link might have better movement handling, it is more specific to threejs
function handlePlaneMovement() {
	// based off of this:
	// https://stackoverflow.com/questions/15344104/smooth-character-movement-in-canvas-game-using-keyboard-controls

	// we must move the camera, as well as the plane, since we always want to
	// keep the camera focused on the plane
	plane.position.x += planeVelocityX
	camera.position.x += planeVelocityX

	// for added effect: rotate the plane in the direction it is trying to go
	// TODO: make this effect smoother, round it out
	if (planeVelocityX < 0) {
		plane.rotation.z += turnSpeed;
		plane.rotation.z = Math.min(plane.rotation.z, Math.PI / 4);
	} else if (planeVelocityX > 0) {
		plane.rotation.z -= turnSpeed;
		plane.rotation.z = Math.max(plane.rotation.z, - Math.PI / 4);
	} else {
		plane.rotation.z /= 1.3;
	}
}

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
