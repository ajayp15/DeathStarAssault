/*
    ship.js: This file defines all of the functions
    necessary to make the ship mesh, make it move, and
    animate it, etc.
*/



function ShipDS(scene) {
    this.lasers = []

    this.hitCount = 0

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
    	'common/models/x-wing/scene.gltf',
    	function ( gltf ) {
    		ship.mesh = gltf.scene;
        ship.mesh.scale.x = shipScaleDS
        ship.mesh.scale.y = shipScaleDS
        ship.mesh.scale.z = shipScaleDS

        ship.animationMixer = new THREE.AnimationMixer( ship.mesh );
        ship.sFoilAction = ship.animationMixer.clipAction( gltf.animations[0] );
        ship.sFoilAction.repetitions = 1
        ship.sFoilAnimationCutoffTime = gltf.animations[0].duration / 2

        var light = new THREE.PointLight( 0xffaaaa, 1, 200 );
        light.position.set( 0, 0, 0);
        //light.castShadow = true
        ship.mesh.add( light );

        ship.boundingBox = new THREE.Mesh(
          new THREE.BoxGeometry(1, 0.2, 0.7),
          bbMat
        );
        ship.boundingBox.position.z -= 0.25
        ship.boundingBox.visible = false


        ship.mesh.add( ship.boundingBox )
        ship.mesh.position.set(0, shipStartingAltitude, 0)
        ship.mesh.rotation.x = Math.PI / 2

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

      var audio = new Audio('common/sounds/laser.mp3');
      audio.volume = 0.5
      audio.play();

      this.laserClock.start();
      var laser = new Laser(
                    this.mesh.position.clone().add(this.velocity.clone().normalize().multiplyScalar(5)),
                    this.velocity.clone().normalize().multiplyScalar(shipLaserVelocity),
                    shipLaserColor,
                    shipLaserCutoffDistance);
      scene.addObj(laser.mesh);
      this.lasers.push(laser);
    }

    this.toggleSFoils = function() {
      this.sFoilAction.play();
    }


    this.update = function(dt, trackingCamera) {
      if (this.shipLoaded == false || gameOver) {
        return;
      }

      this.animationMixer.update(dt)
      if (this.sFoilAction.time >= this.sFoilAnimationCutoffTime) {
        this.sFoilAction.paused = true
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
      if (introComplete) { // only enable controls when intro is complete
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

      trackingCamera.position.copy(this.mesh.position);
      var vector = new THREE.Vector3(vx, vy, vz).normalize().multiplyScalar(1 / shipVelocity);

      var cameraConst = undefined
      if (keyboard[FKEY] == true) {
        cameraConst = 1200
      } else {
        cameraConst = -1200
      }
      trackingCamera.position.add(vector.multiplyScalar(cameraConst));
      trackingCamera.position.y = Math.max(1, trackingCamera.position.y);
      trackingCamera.rotation.copy(this.mesh.rotation);
      trackingCamera.position.add(trackingCamera.up.clone().multiplyScalar(5));
      trackingCamera.lookAt(this.mesh.position);
    }
    this.handleShipHitByLaser = function(laser) {
      var pos = this.mesh.position.clone().add(new THREE.Vector3(Math.random(), Math.random(), Math.random()))
      var explosion = new ExplosionDS(scene, pos, 0.3, 0xf4bc42, this.velocity)
      explosion.explode()
      laser.alive = false
      this.hitCount += 1
      var health = (1 - this.hitCount / shipHitCountHealth) * 100
      statusDisplay.setHealthPct(health)

      if (this.hitCount >= shipHitCountHealth && !gameOver) {
        this.explodeShip()
        gameOver = true
      }
    }
    this.handleShipCollidedWithTurret = function(turret) {
      if (!gameOver) {
        statusDisplay.setHealthPct(0)
        this.hitCount = shipHitCountHealth
        this.explodeShip()
        gameOver = true
      }
    }
    this.handleShipCollidedWithStructure = function(structure) {
      if (!gameOver) {
        statusDisplay.setHealthPct(0)
        this.hitCount = shipHitCountHealth
        this.explodeShip()
        gameOver = true
      }
    }
    this.explodeShip = function() {
      var audio = new Audio('common/sounds/explosion.mp3');
    	audio.play();
      this.mesh.visible = false
      var randomOffset = 10
      var explosion1 = new ExplosionDS(scene,
                          this.mesh.position.clone().add(new THREE.Vector3(
                            Math.random() * randomOffset,
                            Math.random() * randomOffset,
                            Math.random() * randomOffset)),
                          1, 0xffffff)
      var explosion2 = new ExplosionDS(scene,
                          this.mesh.position.clone().add(new THREE.Vector3(
                            Math.random() * randomOffset,
                            Math.random() * randomOffset,
                            Math.random() * randomOffset)),
                          1, 0xf4a742)
      var explosion3 = new ExplosionDS(scene,
                          this.mesh.position.clone().add(new THREE.Vector3(
                            Math.random() * randomOffset,
                            Math.random() * randomOffset,
                            Math.random() * randomOffset)),
                          1, 0xf4e841)
      var explosion4 = new ExplosionDS(scene,
                          this.mesh.position.clone().add(new THREE.Vector3(
                            Math.random() * randomOffset,
                            Math.random() * randomOffset,
                            Math.random() * randomOffset)),
                          2, 0xaaaaaa)
      explosion1.explode()
      explosion2.explode()
      explosion3.explode()
      explosion4.explode()
    }
    this.cleanup = function() {
      for (var i = 0; i < this.lasers.length; ++i) {
        this.lasers[i].cleanup()
      }
      dispose3(this.mesh)
    }

}
