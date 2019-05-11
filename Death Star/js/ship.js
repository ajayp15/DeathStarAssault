/*
    ship.js: This file defines all of the functions
    necessary to make the ship mesh, make it move, and
    animate it, etc.
*/

function Ship(scene, position) {
    this.lasers = []

    this.velocity = new THREE.Vector3()

    this.rollAngle = 0;
    this.yawAngle = 0;
    this.pitchAngle = 0;

    this.shipLoaded = false;

    this.laserClock = new THREE.Clock();
    this.laserClock.start();

    var loader = new THREE.GLTFLoader();

    // Load a glTF resource
    loader.load(
    	'models/star_wars_x-wing/scene.gltf',
    	function ( gltf ) {
    		ship.mesh = gltf.scene;
        ship.mesh.position.copy(position);
        ship.mesh.scale.x = shipScale
        ship.mesh.scale.y = shipScale
        ship.mesh.scale.z = shipScale

        ship.animator = gltf.animations[0];

        var light = new THREE.PointLight( 0xffaaaa, 1, 200 );
        light.position.set( 0, 0, 0);
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
      if (this.laserClock.getElapsedTime() < shipWeaponMinimumTimeDelay) {
        return
      }
      this.laserClock.start();
      var laser = new Laser(this.mesh.position, this.velocity.clone().multiplyScalar(5), 0xff2222);
      scene.addObj(laser.mesh);
      this.lasers.push(laser);
    }

    this.update = function(dt, trackingCamera) {
      if (this.shipLoaded == false) {
        return;
      }

      // update any laser positions
      for (var i = 0; i < this.lasers.length; ++i) {
        this.lasers[i].update(dt);
      }
      for (var i = this.lasers.length - 1; i >= 0; --i) {
        if (this.lasers[i].alive == false) {
          scene.removeObj(this.lasers[i].mesh)
          this.lasers.splice(i, 1)
        }
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
      if ((keyboard[DOWN] == true && this.mesh.position.y < shipMaximumAltitude) || this.mesh.position.y <= shipMinimumAltitude) {
    		this.pitchAngle = Math.min(shipPitchVelocity * dt + this.pitchAngle, shipPitchMaximumAngle);
    	} else if (keyboard[UP] == true || this.mesh.position.y >= shipMaximumAltitude) {
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

      this.velocity.set(vx, vy, vz);

      this.mesh.rotation.x = 0
      this.mesh.rotation.y = 0
      this.mesh.rotation.z = 0

      this.mesh.rotation.y = this.yawAngle; //+ Math.PI;
      this.mesh.rotateOnWorldAxis(new THREE.Vector3(-vz, 0, vx).normalize(), this.pitchAngle);
      this.mesh.rotateOnWorldAxis(new THREE.Vector3(vx, vy, vz).normalize(), -this.rollAngle);

      this.mesh.position.x = Math.max(Math.min(this.mesh.position.x + vx * dt, shipMaximumPlaneCoord), -shipMaximumPlaneCoord);
      this.mesh.position.y = Math.max(Math.min(this.mesh.position.y + vy * dt, shipMaximumAltitude), shipMinimumAltitude);
      this.mesh.position.z = Math.max(Math.min(this.mesh.position.z + vz * dt, shipMaximumPlaneCoord), -shipMaximumPlaneCoord);

      trackingCamera.position.copy(p);
      var vector = new THREE.Vector3(vx, vy, vz).normalize().multiplyScalar(1 / shipVelocity);

      var cameraConst = undefined
      if (keyboard[FRONT] == true) {
        cameraConst = 800
      } else {
        cameraConst = -800
      }
      trackingCamera.position.add(vector.multiplyScalar(cameraConst));
      trackingCamera.position.y = Math.max(1, trackingCamera.position.y);
      trackingCamera.rotation.copy(this.mesh.rotation);
      trackingCamera.position.add(trackingCamera.up.clone().multiplyScalar(5));
      trackingCamera.lookAt(this.mesh.position);
    }

    this.handleShipHit = function() {
      
    }
}
