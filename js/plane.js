/*
    plane.js: This file defines all of the functions
    necessary to make the plane mesh, make it move, and
    animate it, etc.
*/

function Plane(scene, walls, ground) {
    this.mesh = createPlaneMesh()
    this.scene = scene
    this.walls = walls
    this.ground = ground
    this.shots = []

    this.handlePlaneMovement = function (planeVelocityX, planeVelocityY, delta) {
        this.mesh.position.x += planeVelocityX * delta
        this.mesh.position.y += planeVelocityY * delta

        // clamp the motion, to prevent it from going too far out from the screen
        // for y coords, compute if the plane is about to go off the screen by projecting
        // its position to screen coordintes
        var screenCoords = this.mesh.position.clone().project(this.scene.camera)
        screenCoords.y = -(screenCoords.y * (this.scene.sceneHeight / 2)) + this.scene.sceneHeight/2

        if (this.mesh.position.x + wallsLeeway >= this.walls.rightWallX 
            || this.mesh.position.x - wallsLeeway <= this.walls.leftWallX) {
          this.mesh.position.x -= planeVelocityX * delta // undo the movement
        }
        if (screenCoords.y <= ceilingLeeway // indexed from 0 at ceiling
          || this.mesh.position.y - groundLeeway <= this.ground.groundTop) { // arbitrary values
          this.mesh.position.y -= planeVelocityY * delta
        }

        // handle x movement
        if (planeVelocityX < 0) {
            this.mesh.rotation.z += turnSpeed * delta;
            this.mesh.rotation.z = Math.min(this.mesh.rotation.z, Math.PI / 4);
        } else if (planeVelocityX > 0) {
            this.mesh.rotation.z -= turnSpeed * delta;
            this.mesh.rotation.z = Math.max(this.mesh.rotation.z, - Math.PI / 4);
        } else {
            this.mesh.rotation.z /= 1.3;
        }

        // handle y movement (flip the directions, seems to work this way, axis flipped)
        if (planeVelocityY > 0) {
          this.mesh.rotation.x += turnSpeed * delta;
          this.mesh.rotation.x = Math.min(this.mesh.rotation.x, Math.PI / 4);
        } else if (planeVelocityY < 0) {
            this.mesh.rotation.x -= turnSpeed * delta;
            this.mesh.rotation.x = Math.max(this.mesh.rotation.x, - Math.PI / 4);
        } else {
            this.mesh.rotation.x /= 1.3;
        }
    }

    this.shootLaser = function() {
      var laserGeometry = new THREE.CylinderGeometry(0.01, 0.01, 1, 4)
      var laserMaterial = new THREE.MeshLambertMaterial({
        color: 0x1bd127,
      })
      let laser = new THREE.Mesh(laserGeometry, laserMaterial);
      laser.rotation.x = Math.PI / 2

      var wpVector = this.mesh.position.clone()
      laser.position.copy(wpVector); // start position - the tip of the weapon
      this.scene.addMesh(laser);
      this.shots.push(laser);
    }

    this.handleLaserMovements = function(delta) {
      var shotsToKeep = []
      for (var i = 0; i < this.shots.length; i++) {
        this.shots[i].translateY(-5 * delta) // y because rotated around x
        
        // check if it has gone out of scene, remove it then
        if (this.shots[i].position.z < farPlane / 16) {  // arbitrary distance to stop them at
          this.scene.removeMesh(this.shots[i])
        } else {
          shotsToKeep.push(this.shots[i])
        }
      }

      this.shots = shotsToKeep
    }
}

function createPlaneMesh() {
    var bodyGeometry = new THREE.BoxGeometry(0.4, 0.1, 0.5)
    var bodyMaterial = new THREE.MeshPhongMaterial({ color: 0xe5f2f2 , side: THREE.DoubleSide})
    var body = new THREE.Mesh(bodyGeometry, bodyMaterial)

    body.geometry.computeBoundingBox()

    var plane = new THREE.Object3D()
    plane.add(body)

    plane.receiveShadow = false;
    plane.castShadow = true;

    plane.position.set(0, center, planeInitZ)

    return plane
}


/*
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
*/
