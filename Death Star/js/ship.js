/*
    ship.js: This file defines all of the functions
    necessary to make the ship mesh, make it move, and
    animate it, etc.
*/

function Ship(position) {
    this.shots = []

    this.rollAngle = 0;
    this.yawAngle = 0;
    this.pitchAngle = 0;

    var bodyGeometry = new THREE.BoxGeometry(2, 2, 2)
    var bodyMaterial = new THREE.MeshStandardMaterial({ color: 0xe5f2f2 })
    var body = new THREE.Mesh(bodyGeometry, bodyMaterial)

    body.geometry.computeBoundingBox()

    var ship = new THREE.Object3D()
    ship.add(body)

    ship.receiveShadow = true;
    ship.castShadow = true;

    this.mesh = ship;
    this.mesh.position.copy(position);

    this.update = function(dt, trackingCamera) {
      // update angles & rotation
      if (keyboard[LEFT] == true) {
    		this.rollAngle = 20 * 3.14 / 180
        this.yawAngle += 50 * 3.14 / 180 * dt
    	}
    	else if (keyboard[RIGHT] == true) {
    		this.rollAngle = -20 * 3.14 / 180
        this.yawAngle -= 50 * 3.14 / 180 * dt
    	} else {
        this.rollAngle = 0;
      }
    	if (keyboard[UP] == true) {
        this.pitchAngle += 50 * 3.14 / 180 * dt
    	}
    	else if (keyboard[DOWN] == true) {
    		this.pitchAngle -= 50 * 3.14 / 180 * dt
    	}
      this.mesh.rotation.z = this.rollAngle;
      this.mesh.rotation.y = this.yawAngle;
      this.mesh.rotation.x = this.pitchAngle + Math.PI / 2;

      // update position on sphere
      var p = this.mesh.position.clone();
      var spherical = new THREE.Spherical().setFromCartesianCoords(p.x, p.y, p.z);
      var phi = spherical.phi;
      var theta = spherical.theta;
      var r = spherical.radius;

      var dphi = Math.sin(this.yawAngle) * dt / r;
      var dtheta = Math.cos(this.yawAngle) * dt / r;
      var dr = Math.sin(this.pitchAngle) * dt;

      var dx = dr * Math.sin(theta) * Math.cos(phi) +
               r * Math.cos(theta) * Math.cos(phi) * dtheta -
               r * Math.sin(theta) * Math.sin(phi) * dphi;
      var dy = dr * Math.sin(theta) * Math.sin(phi) +
               r * Math.cos(theta) * Math.sin(phi) * dtheta +
               r * Math.sin(theta) * Math.cos(phi) * dphi;
      var dz = dr * Math.cos(theta) - r * Math.sin(theta) * dtheta;
      var dp = new THREE.Vector3(dx, dy, dz).normalize().multiplyScalar(movementVelocity);
      this.mesh.position.add(dp);

      trackingCamera.position.copy(p);
    	trackingCamera.position.add(new THREE.Vector3(0, -5, 0));
    	trackingCamera.rotation.copy(this.mesh.rotation);
      trackingCamera.rotation.z = 0;
      //var cameraOffset = new THREE.Vector3().subVectors(pNew, p).multiplyScalar(100);
      //trackingCamera.position.copy(p.add(cameraOffset));
      //trackingCamera.rotation.copy(this.mesh.rotation);
    }
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
