/*
  turret.js
*/

var turretClipHeight = 50

var turretTexture = THREE.ImageUtils.loadTexture( 'images/towers_diffuse.jpg' );
turretTexture.wrapS = turretTexture.wrapT = THREE.RepeatWrapping;
turretTexture.repeat.set( 2, 2 );

var turretClippingPlane = new THREE.Plane( new THREE.Vector3( 0, -turretClipHeight, 0 ), 1 );
var turretMaterial = new THREE.MeshPhongMaterial(
  {
    map: turretTexture,
    side: THREE.DoubleSide,
    clippingPlanes: [ turretClippingPlane ],
    clipShadows: true
  } );
var gunBoxMaterial = new THREE.MeshPhongMaterial(
  {
    map: turretTexture,
    side: THREE.DoubleSide,
  } );

function Turret(px, pz) {
  var top_size = 15

  this.lasers = []
  this.laserClock = new THREE.Clock()
  this.laserClock.start()

  this.hitCount = 0

  this.mesh = new THREE.Object3D();
  this.tower = new THREE.Mesh(
    new THREE.ConeGeometry(40, 100, 4),
    turretMaterial
  );
  this.tower.rotation.y = Math.PI / 4 + Math.floor(Math.random() * 5) * Math.PI / 2

  this.gun = new THREE.Object3D();
  this.gunBase = new THREE.Mesh(
    new THREE.BoxGeometry(top_size, top_size, top_size),
    gunBoxMaterial //new THREE.MeshPhongMaterial( { color: 0x111111 } )
  )
  this.gunBarrelLeft = new THREE.Mesh(
    new THREE.CylinderGeometry( 0.5, 0.5, top_size * 2, 32),
    new THREE.MeshPhongMaterial( { color: 0x222222 } )
  )
  this.gunBarrelRight = new THREE.Mesh(
    new THREE.CylinderGeometry( 0.5, 0.5, top_size * 2, 32),
    new THREE.MeshPhongMaterial( { color: 0x222222 } )
  )
  this.gunBarrelLeft.position.z = -top_size;
  this.gunBarrelRight.position.z = -top_size;
  this.gunBarrelLeft.position.x = - top_size / 8;
  this.gunBarrelRight.position.x = top_size / 8;
  this.gunBarrelLeft.rotation.x = Math.PI / 2;
  this.gunBarrelRight.rotation.x = Math.PI / 2;
  this.gun.add(this.gunBase);
  this.gun.add(this.gunBarrelLeft);
  this.gun.add(this.gunBarrelRight);
  this.gun.position.set(0, (turretClipHeight + top_size) / 2 - 5, 0)

  this.mesh.add(this.tower)
  this.mesh.add(this.gun)

  this.boundingBox = new THREE.Mesh(
    new THREE.BoxGeometry(25, 70, 25),
    bbMat
  );
  this.boundingBox.visible = displayBoundingBoxes
  this.mesh.add( this.boundingBox )

  this.mesh.castShadow = true
  this.mesh.position.set(px, 60 / 2, pz);

  this.fireLasers = function(direction) {
    if (this.laserClock.getElapsedTime() < turretMinimumTimeDelay) {
      return
    }
    this.laserClock.start();

    var leftLaserPosition = this.gunBarrelLeft.position.clone()
    this.gunBarrelLeft.localToWorld(leftLaserPosition)
    leftLaserPosition.y -= 15
    leftLaserPosition.add(direction.clone().multiplyScalar(14))

    var rightLaserPosition = this.gunBarrelRight.position.clone()
    this.gunBarrelRight.localToWorld(rightLaserPosition)
    rightLaserPosition.y -= 15
    rightLaserPosition.add(direction.clone().multiplyScalar(14))

    var leftLaser = new Laser(
                  leftLaserPosition,
                  direction.multiplyScalar(turretLaserVelocity),
                  turretLaserColor,
                  turretLaserCutoffDistance,
                  turretLaserSize);
    var rightLaser = new Laser(
                  rightLaserPosition,
                  direction.multiplyScalar(turretLaserVelocity),
                  turretLaserColor,
                  turretLaserCutoffDistance,
                  turretLaserSize);
    scene.addObj(leftLaser.mesh);
    scene.addObj(rightLaser.mesh);
    this.lasers.push(leftLaser);
    this.lasers.push(rightLaser);
  }

  this.update = function(dt) {
    // update lasers fired
    for (var i = 0; i < this.lasers.length; ++i) {
      this.lasers[i].update(dt);
    }
    for (var i = this.lasers.length - 1; i >= 0; --i) {
      if (this.lasers[i].alive == false) {
        scene.removeObj(this.lasers[i].mesh)
        this.lasers.splice(i, 1)
      }
    }

    // can we fire on the ship?
    if (ship.mesh == undefined) { return }

    var turretPosition = this.gunBarrelLeft.position.clone()
    this.gunBarrelLeft.localToWorld(turretPosition)
    turretPosition.y -= 15

    var shipPosition = ship.mesh.position.clone()
    var turretDistanceToShip = turretPosition.distanceTo(shipPosition)

    if (turretDistanceToShip < turretFireRadius) {
      var firingVector = new THREE.Vector3(
                              Math.sin(this.gun.rotation.y),
                              0,
                              Math.cos(this.gun.rotation.y)
                            )
      var targetVector = new THREE.Vector3().subVectors(shipPosition, turretPosition);
      targetVector.y = 0;
      targetVector.normalize()

      // turn guns towards the ship
      var firingAngle = Math.atan2(firingVector.z, firingVector.x)
      var targetAngle = Math.atan2(targetVector.z, targetVector.x)

      // can we fire on target?
      if (Math.abs(firingAngle - targetAngle) % Math.PI < 0.02) {
        firingVector.y = (turretPosition.y - shipPosition.y) / turretDistanceToShip
        if (Math.abs(turretPosition.y - shipPosition.y) < turretDistanceToShip) { // only allow guns to fire at max 45 degrees to the plane
          this.fireLasers(firingVector.multiplyScalar(-1).normalize());
        }
      }
      else if (
        (firingAngle < targetAngle && Math.abs(firingAngle - targetAngle) < Math.PI) ||
        (firingAngle > targetAngle && Math.abs(firingAngle - targetAngle) > Math.PI)
        ) {
        this.gun.rotation.y += turretGunTurnSpeed * dt
      } else {
        this.gun.rotation.y -= turretGunTurnSpeed * dt
      }
    }
  }

  this.handleTurretHitByLaser = function(laser) {
    var explosion = new Explosion(scene, this.mesh.position, 1, 0xff2222)
    explosion.explode()
    laser.alive = false
    this.hitCount += 1
  }

  this.handleTurretDestroyed = function() {
    var randomOffset = 10
    var explosion1 = new Explosion(scene,
                        this.mesh.position.clone().add(new THREE.Vector3(
                          Math.random() * randomOffset,
                          Math.random() * randomOffset,
                          Math.random() * randomOffset)),
                        1, 0xffffff)
    var explosion2 = new Explosion(scene,
                        this.mesh.position.clone().add(new THREE.Vector3(
                          Math.random() * randomOffset,
                          Math.random() * randomOffset,
                          Math.random() * randomOffset)),
                        1, 0xf4a742)
    var explosion3 = new Explosion(scene,
                        this.mesh.position.clone().add(new THREE.Vector3(
                          Math.random() * randomOffset,
                          Math.random() * randomOffset,
                          Math.random() * randomOffset)),
                        1, 0xf4e841)
    var explosion4 = new Explosion(scene,
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
}
