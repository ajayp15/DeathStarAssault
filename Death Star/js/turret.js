/*
  turret.js
*/

function Turret(px, py) {
  var clip_height = 50
  var top_size = 15

  this.lasers = []

  var turretTexture = THREE.ImageUtils.loadTexture( 'images/towers_diffuse.jpg' );
  turretTexture.wrapS = turretTexture.wrapT = THREE.RepeatWrapping;
  turretTexture.repeat.set( 2, 2 );

  var clippingPlane = new THREE.Plane( new THREE.Vector3( 0, -clip_height, 0 ), 1 );
  var turretMaterial = new THREE.MeshPhongMaterial(
    {
      map: turretTexture,
      side: THREE.DoubleSide,
      clippingPlanes: [ clippingPlane ],
      clipShadows: true
    } );

  this.hitCount = 0

  this.mesh = new THREE.Object3D();
  this.tower = new THREE.Mesh(
    new THREE.ConeGeometry(40, 100, 4),
    turretMaterial
  );
  this.tower.rotation.x = Math.PI / 2
  this.tower.rotation.y = Math.PI / 4 + Math.floor(Math.random() * 5) * Math.PI / 2

  this.gun = new THREE.Object3D();
  var gunBase = new THREE.Mesh(
    new THREE.BoxGeometry(top_size, top_size, top_size),
    new THREE.MeshPhongMaterial( { color: 0x111111 } )
  )
  var gunBarrelLeft = new THREE.Mesh(
    new THREE.CylinderGeometry( 0.5, 0.5, top_size * 2, 32),
    new THREE.MeshPhongMaterial( { color: 0x222222 } )
  )
  var gunBarrelRight = new THREE.Mesh(
    new THREE.CylinderGeometry( 0.5, 0.5, top_size * 2, 32),
    new THREE.MeshPhongMaterial( { color: 0x222222 } )
  )
  gunBarrelLeft.position.y = top_size;
  gunBarrelRight.position.y = top_size;
  gunBarrelLeft.position.x = - top_size / 8;
  gunBarrelRight.position.x = top_size / 8;
  this.gun.add(gunBase);
  this.gun.add(gunBarrelLeft);
  this.gun.add(gunBarrelRight);
  this.gun.position.set(0, 0, (clip_height + top_size) / 2 - 5)

  this.mesh.add(this.tower)
  this.mesh.add(this.gun)

  this.gun.rotation.z = Math.random() * 2 * Math.PI

  this.mesh.castShadow = true
  this.mesh.position.set(px, py, 60 / 2);

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
    if (this.mesh.position.distanceTo(ship.mesh.position) < deathstar_turret_fire_radius) {
      var firingVector = new THREE.Vector3()
    }
  }
}
