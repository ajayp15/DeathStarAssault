/*
    obstacles.js: This file handles all of the obstacles
    in the scene.
*/

function Obstacles() {
    this.basicObstacles = []

    this.addBasicObstacle = addBasicObstacle;
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

function addBasicObstacle(startAtFarPlane){
	if (this.basicObstacles.length >= maxBasicObstacles) {
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

	// ground.add(obstacle);

	// push it to the general basicObstacles array
    basicObstacles.push(obstacle);
    
    return obstacle
}

// This removes objects that have gone out of view, and also checks if the
// plane is in contact with the obstacles
function doObjectLogic(){
	var objToRemove = []
	var pos = new THREE.Vector3()
	this.basicObstacles.forEach(function(element, index) {
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
			if (pos.distanceTo(plane.mesh.position) <= 0.6) {
				console.log("hit")
				hasCollided = true;
			}
			// hasCollided = checkIfCollided(plane, element)

		}
	})

	// remove all necessary objects
	objToRemove.forEach(function(element, index) {
		indexInBasicObstacles = this.basicObstacles.indexOf(element)
		this.basicObstacles.splice(indexInBasicObstacles, 1); // remove it

		// remove from the scene as well (use global scene)
		scene.removeMesh(element)
		console.log("Remove object")
	})
}

function handleObstacleMovement() {
	/*
		Go through for each of our obstacles currently, and move them closer to
		the near plane according to the moving speed of the plane
	*/
	for (var i = 0; i < basicObstacles.length; i++) {
		this.basicObstacles[i].position.y += movementSpeed
	}
}