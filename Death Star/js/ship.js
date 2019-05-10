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

    var loader = new THREE.GLTFLoader();

    // Load a glTF resource
    loader.load(
    	'models/x-wing/scene.gltf',
    	function ( gltf ) {
    		ship.mesh = gltf.scene;
        ship.mesh.position.copy(position);
        ship.mesh.scale.x = shipScale
        ship.mesh.scale.y = shipScale
        ship.mesh.scale.z = shipScale

        var light = new THREE.PointLight( 0xffaaaa, 1, 200 );
        light.position.set( 0, 0, 10);
        light.castShadow = true
        ship.mesh.add( light );

        scene.addObj(ship.mesh);
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

    this.fireLasers = function() {

    }

    this.update = function(dt, trackingCamera) {
      if (this.shipLoaded == false) {
        return;
      }

      // update angles & rotation from user inputs
      if (keyboard[LEFT] == true) {
    		this.rollAngle = Math.min(shipRollVelocity * dt + this.rollAngle, shipRollMaximumAngle)
        this.yawAngle += shipYawVelocity * dt
    	}
    	else if (keyboard[RIGHT] == true) {
    		this.rollAngle = Math.max(-shipRollVelocity * dt + this.rollAngle, -shipRollMaximumAngle)
        this.yawAngle -= shipYawVelocity * dt
    	} else {
        this.rollAngle /= 1.3 ;
      }
      if (keyboard[DOWN] == true || this.mesh.position.y < shipMinimumAltitude) {
    		this.pitchAngle = Math.min(shipPitchVelocity * dt + this.pitchAngle, shipPitchMaximumAngle);
    	} else if (keyboard[UP] == true) {
        this.pitchAngle = Math.max(-shipPitchVelocity * dt + this.pitchAngle, -shipPitchMaximumAngle)
      }

      if (keyboard[SPACE] == true) {
        this.fireLasers();
      }

      var p = this.mesh.position.clone();

      // update mesh rotation and position
      var vx = shipVelocity * Math.cos(this.pitchAngle) * Math.sin(this.yawAngle)
      var vy = shipVelocity * Math.sin(this.pitchAngle);
      var vz = shipVelocity * Math.cos(this.pitchAngle) * Math.cos(this.yawAngle)

      this.mesh.rotation.x = 0
      this.mesh.rotation.y = 0
      this.mesh.rotation.z = 0

      this.mesh.rotation.y = this.yawAngle + Math.PI;
      this.mesh.rotateOnWorldAxis(new THREE.Vector3(-vz, 0, vx).normalize(), this.pitchAngle);
      this.mesh.rotateOnWorldAxis(new THREE.Vector3(vx, vy, vz).normalize(), -this.rollAngle);

      this.mesh.position.x += vx * dt;
      this.mesh.position.y += vy * dt;
      this.mesh.position.z += vz * dt;

      trackingCamera.position.copy(p);
      var vector = new THREE.Vector3(vx, vy, vz).multiplyScalar(1 / shipVelocity);
      trackingCamera.position.add(vector.multiplyScalar(-15));
      trackingCamera.position.y = Math.max(1, trackingCamera.position.y);
      trackingCamera.rotation.copy(this.mesh.rotation);
      trackingCamera.position.add(trackingCamera.up.clone().multiplyScalar(3));
      trackingCamera.lookAt(this.mesh.position);

    }
}
