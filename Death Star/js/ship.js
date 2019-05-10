/*
    ship.js: This file defines all of the functions
    necessary to make the ship mesh, make it move, and
    animate it, etc.
*/

function Ship(scene, position) {
    this.shots = []

    this.rollAngle = 0;
    this.yawAngle = 0;
    this.pitchAngle = 0;

    this.shipLoaded = false;

    /*var bodyGeometry = new THREE.BoxGeometry(2, 3, 4)
    var bodyMaterial = new THREE.MeshStandardMaterial({ color: 0xe5f2f2 })
    var body = new THREE.Mesh(bodyGeometry, bodyMaterial)

    body.geometry.computeBoundingBox()

    var ship = new THREE.Object3D()
    ship.add(body)

    ship.receiveShadow = true;
    ship.castShadow = true;

    this.mesh = ship;
    this.mesh.position.copy(position);*/

    var loader = new THREE.GLTFLoader();

    // Load a glTF resource
    loader.load(
    	'models/x-wing/scene.gltf',
    	function ( gltf ) {
    		ship.mesh = gltf.scene;
        ship.mesh.position.copy(position);
        ship.mesh.scale.x = 0.04
        ship.mesh.scale.y = 0.04
        ship.mesh.scale.z = 0.04
        scene.addMesh(ship.mesh);
        console.log(ship.mesh);
        ship.shipLoaded = true;
    	},
    	function ( xhr ) {
    		console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
    	},
    	function ( error ) {
        console.log(error);
    		console.log( 'An error happened' );
    	}
    );

    this.update = function(dt, trackingCamera) {
      if (this.shipLoaded == false) {
        return;
      }
      // update angles & rotation
      if (keyboard[LEFT] == true) {
    		this.rollAngle = 20 * 3.14 / 180
        this.yawAngle += rotationVelocity * dt
    	}
    	else if (keyboard[RIGHT] == true) {
    		this.rollAngle = -20 * 3.14 / 180
        this.yawAngle -= rotationVelocity * dt
    	} else {
        this.rollAngle = 0;
      }
    	if (keyboard[UP] == true) {
        //this.pitchAngle += rotationVelocity * dt
    	}
    	else if (keyboard[DOWN] == true) {
    		//this.pitchAngle -= rotationVelocity * dt
    	}
      var p = this.mesh.position.clone();

      // rotate mesh correctly for position
      this.mesh.rotation.z = this.rollAngle;
      this.mesh.rotation.y = this.yawAngle;
      this.mesh.rotation.x = this.pitchAngle;

      var up = new THREE.Vector3(0, 1, 0);
      var quaternion = new THREE.Quaternion();
      quaternion.setFromUnitVectors(up, p.clone().normalize());
      this.mesh.applyQuaternion(quaternion);

      // update position on sphere
      var spherical = new THREE.Spherical().setFromCartesianCoords(p.x, p.y, p.z);
      var phi = spherical.phi;
      var theta = spherical.theta;
      var r = spherical.radius;

      var xRot = Math.cos(this.yawAngle) / r * movementVelocity * dt
      var yRot = Math.sin(this.yawAngle) / r * movementVelocity * dt
      var zRot = 0;

      this.mesh.position.applyAxisAngle(new THREE.Vector3(1, 0, 0), -xRot);
      this.mesh.position.applyAxisAngle(new THREE.Vector3(0, 1, 0), -yRot);

      //this.mesh.position.multiplyScalar()

      trackingCamera.position.copy(p);
    	trackingCamera.rotation.x = this.mesh.rotation.x
      trackingCamera.rotation.y = this.mesh.rotation.y
      trackingCamera.rotation.z = this.mesh.rotation.z

      var vector = new THREE.Vector3();
      trackingCamera.getWorldDirection( vector );

      trackingCamera.position.add(vector.multiplyScalar(-30));
      trackingCamera.position.multiplyScalar(1.01);
      //trackingCamera.position.add(this.mesh.up.clone().multiplyScalar(10));
      //trackingCamera.rotation.applyQuaternion(quaternion);
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
