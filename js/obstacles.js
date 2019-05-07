/*
    obstacles.js: This file handles all of the obstacles
    in the scene.
*/

var maxBasicObstacles = 50
var movementSpeed = 0.1
var nearPlane = 6

function Obstacles(scene) {
    this.scene = scene
    this.basicObstacles = []

    this.createBasicObstacle = function() {
        var boxGeometry = new THREE.BoxGeometry(1, 1, 1);
      	var boxMaterial = new THREE.MeshStandardMaterial( { color: 0xffa500  } );
      	var mesh = new THREE.Mesh(boxGeometry, boxMaterial);
      	mesh.position.y = 0.25

      	var obj = new THREE.Object3D();
      	obj.add(mesh);
      	return obj;
    }

    this.addBasicObstacle = function(startAtFarPlane) {
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

      	// -1 to shift all of them up
      	obstacle.position.set(x, y, -1);

        this.scene.addMesh(obstacle);

      	// push it to the general basicObstacles array
        basicObstacles.push(obstacle);
        return obstacle
    }

    // This removes objects that have gone out of view, and also checks if the
    // plane is in contact with the obstacles
    this.doObjectLogic = function(){
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

    this.handleObstacleMovement = function() {
    	for (var i = 0; i < basicObstacles.length; i++) {
    		this.basicObstacles[i].position.y += movementSpeed
    	}
    }
}
