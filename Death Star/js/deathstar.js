/*
    deathstar.js: This file defines all of the functions
    necessary to make the deathstar mesh, generate turrets, and
    animate it, etc.
*/

function Deathstar(size, turretCount = 10, smallStructureCount = 1000) {
  this.turrets = []
  this.smallStructures = []

  // add deathstar plane
  var planeGeometry =  new THREE.PlaneGeometry( size, size, 200, 200 );
  var planeTexture = THREE.ImageUtils.loadTexture( 'images/deathstar_diffuse.jpg' );
  planeTexture.wrapS = planeTexture.wrapT = THREE.RepeatWrapping;
	planeTexture.repeat.set( 100, 100);
	var planeMaterial = new THREE.MeshPhongMaterial( { map: planeTexture, side: THREE.FrontSide } );
  this.mesh = new THREE.Mesh( planeGeometry, planeMaterial );
  this.mesh.rotation.x = - Math.PI / 2;

  // add turrets to surface
  for (var i = 0; i < turretCount; ++i) {
    var turret = new Turret(
                      Math.random() * shipMaximumPlaneCoord * 2 - shipMaximumPlaneCoord,
                      Math.random() * shipMaximumPlaneCoord * 2 - shipMaximumPlaneCoord
                    )
    scene.addObj(turret.mesh);
    this.turrets.push(turret);
  }

  for (var i = 0; i < smallStructureCount; ++i) {
    var sx = Math.random() * 50 + 25
    var sy = Math.random() * 5 + 5
    var sz = Math.random() * 50 + 25

    var px = Math.random() * shipMaximumPlaneCoord * 2 - shipMaximumPlaneCoord
    var py = sy / 2
    var pz = Math.random() * shipMaximumPlaneCoord * 2 - shipMaximumPlaneCoord

    var smallStructure = new Structure(px, py, pz, sx, sy, sz)
    scene.addObj(smallStructure.outerStruct)
    if (smallStructure.innerStruct != undefined) {
      scene.addObj(smallStructure.innerStruct)
    }
    this.smallStructures.push(smallStructure)
  }

	this.mesh.receiveShadow = true;
	this.mesh.castShadow=false;

  this.update = function(dt) {
    for (var i = this.turrets.length - 1; i >= 0; --i) {
      var turret = this.turrets[i]
      turret.update(dt)
      if (turret.hitCount >= turretHitHealth) {
        var randomOffset = 10
        var explosion1 = new Explosion(scene,
                            turret.mesh.position.clone().add(new THREE.Vector3(
                              Math.random() * randomOffset,
                              Math.random() * randomOffset,
                              Math.random() * randomOffset)),
                            1, 0xffffff)
        var explosion2 = new Explosion(scene,
                            turret.mesh.position.clone().add(new THREE.Vector3(
                              Math.random() * randomOffset,
                              Math.random() * randomOffset,
                              Math.random() * randomOffset)),
                            1, 0xf4a742)
        var explosion3 = new Explosion(scene,
                            turret.mesh.position.clone().add(new THREE.Vector3(
                              Math.random() * randomOffset,
                              Math.random() * randomOffset,
                              Math.random() * randomOffset)),
                            1, 0xf4e841)
        var explosion4 = new Explosion(scene,
                            turret.mesh.position.clone().add(new THREE.Vector3(
                              Math.random() * randomOffset,
                              Math.random() * randomOffset,
                              Math.random() * randomOffset)),
                            2, 0xaaaaaa)
        explosion1.explode()
        explosion2.explode()
        explosion3.explode()
        explosion4.explode()
        scene.removeObj(turret.mesh)
        for (var j = 0; j < turret.lasers.length; ++j) {
          turret.lasers[j].active = false
          scene.removeObj(turret.lasers[j].mesh)
        }
        this.turrets.splice(i, 1)
      }
    }
  }
}
