/*
    plane.js: This file defines all of the functions
    necessary to make the plane mesh, make it move, and
    animate it, etc.
*/

function Plane(scene) {
    this.mesh = createPlaneMesh()
    this.scene = scene
    this.shots = []

    this.handlePlaneMovement = function (planeVelocityX, planeVelocityY) {
        this.mesh.position.x += planeVelocityX
        this.mesh.position.y += planeVelocityY

        // clamp the motion, to prevent it from going too far out from the screen
        // TODO: this is arbitrary for now - you can calculate the range of x and y of 
        // screen using FOV and aspect of the camera (which give angles, etc.)
        if (Math.abs(this.mesh.position.x) >= 1) {
          this.mesh.position.x -= planeVelocityX // undo the movement
        }
        if (this.mesh.position.y >= 4 || this.mesh.position.y <= 1.8) {
          this.mesh.position.y -= planeVelocityY
        }

        // handle x movement
        if (planeVelocityX < 0) {
            this.mesh.rotation.z += turnSpeed;
            this.mesh.rotation.z = Math.min(this.mesh.rotation.z, Math.PI / 4);
        } else if (planeVelocityX > 0) {
            this.mesh.rotation.z -= turnSpeed;
            this.mesh.rotation.z = Math.max(this.mesh.rotation.z, - Math.PI / 4);
        } else {
            this.mesh.rotation.z /= 1.3;
        }

        // handle y movement (flip the directions, seems to work this way, axis flipped)
        if (planeVelocityY > 0) {
          this.mesh.rotation.x += turnSpeed;
          this.mesh.rotation.x = Math.min(this.mesh.rotation.x, Math.PI / 4);
        } else if (planeVelocityY < 0) {
            this.mesh.rotation.x -= turnSpeed;
            this.mesh.rotation.x = Math.max(this.mesh.rotation.x, - Math.PI / 4);
        } else {
            this.mesh.rotation.x /= 1.3;
        }
    }

    this.shootLaser = function() {
      let plasmaBall = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 4), new THREE.MeshBasicMaterial({
        color: "aqua"
      }));
      var wpVector = new THREE.Vector3()
      this.mesh.getWorldPosition(wpVector)
      plasmaBall.position.copy(wpVector); // start position - the tip of the weapon
      plasmaBall.quaternion.copy(this.scene.camera.quaternion); // apply camera's quaternion
      this.scene.addMesh(plasmaBall);
      this.shots.push(plasmaBall);
    }

    this.handleLaserMovements = function() {
      var delta = clock.getDelta()
      this.shots.forEach(b => {
        b.translateZ(-5 * delta)
      })
    }
}

function createPlaneMesh() {
    var bodyGeometry = new THREE.BoxGeometry(0.4, 0.1, 0.5)
    var bodyMaterial = new THREE.MeshStandardMaterial({ color: 0xe5f2f2 })
    var body = new THREE.Mesh(bodyGeometry, bodyMaterial)

    body.geometry.computeBoundingBox()

    var plane = new THREE.Object3D()
    plane.add(body)

    plane.receiveShadow = true;
    plane.castShadow = true;

    // plane.position.set(0, planeInitY, planeInitZ)
    plane.position.set(0, center, planeInitZ) // place it at camera center

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
