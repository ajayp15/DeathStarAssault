/*
    deathstar.js: This file defines all of the functions
    necessary to make the deathstar mesh, generate turrets, and
    animate it, etc.
*/

function DeathstarDS(size, turretCount = 10, smallStructureCount = 1000) {
  this.turrets = []
  this.smallStructures = []
  this.orphanedLasers = []

  // add deathstar plane
  var planeGeometry =  new THREE.PlaneGeometry( size, size, 200, 200 );
  var planeTexture = new THREE.TextureLoader().load( 'surface/images/deathstar-diffuse.jpg' );
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

  var singleGeometry = new THREE.Geometry()

  for (var i = 0; i < smallStructureCount; ++i) {
    var sx = Math.random() * 75 + 30
    var sy = Math.random() * 15 + 7
    var sz = Math.random() * 75 + 30

    var px = Math.random() * shipMaximumPlaneCoord * 2 - shipMaximumPlaneCoord
    var py = sy / 2
    var pz = Math.random() * shipMaximumPlaneCoord * 2 - shipMaximumPlaneCoord

    var smallStructure = new Structure(px, py, pz, sx, sy, sz)

    smallStructure.outerStruct.updateMatrix()
    singleGeometry.merge(smallStructure.outerStruct.geometry, smallStructure.outerStruct.matrix)
    // scene.addObj(smallStructure.outerStruct)
    if (smallStructure.innerStruct != undefined) {
      smallStructure.innerStruct.updateMatrix()
      singleGeometry.merge(smallStructure.innerStruct.geometry, smallStructure.innerStruct.matrix)
      // this.mesh.geometry.mergeMesh(smallStructure.innerStruct)
      // scene.addObj(smallStructure.innerStruct)
    }
    this.smallStructures.push(smallStructure)
  }

  var structureMaterial = new THREE.MeshPhongMaterial( { map: structureTexture } );
  var singleMesh = new THREE.Mesh(singleGeometry, structureMaterial)
  scene.addObj(singleMesh)

	//this.mesh.receiveShadow = true;
	//this.mesh.castShadow=false;

  this.update = function(dt) {
    for (var i = this.turrets.length - 1; i >= 0; --i) {
      var turret = this.turrets[i]
      turret.update(dt)
      if (turret.hitCount >= turretHitHealth) {
        statusDisplay.setScore(++turretsDestroyed)
        turret.handleTurretDestroyed()
        //scene.removeObj(turret.mesh) TOO SLOW!
        turret.mesh.visible = false
        for (var j = 0; j < turret.lasers.length; ++j) {
          this.orphanedLasers.push(turret.lasers[j])
        }
        this.turrets.splice(i, 1)
      }
    }
    for (var i = 0; i < this.orphanedLasers.length; ++i) {
      this.orphanedLasers[i].update(dt);
    }
    for (var i = this.orphanedLasers.length - 1; i >= 0; --i) {
      if (this.orphanedLasers[i].alive == false) {
        scene.removeObj(this.orphanedLasers[i].mesh)
        this.orphanedLasers.splice(i, 1)
      }
    }
    if (turretsDestroyed >= turretDestroyCount) {
      gameOver = true
      didWin = true
    }
  }

  this.cleanup = function() {
    for (var i = 0; i < this.turrets.length; ++i) {
      this.turrets[i].cleanup()
    }
    for (var i = 0; i < this.smallStructures.length; ++i) {
      this.smallStructures[i].cleanup()
    }
    for (var i = 0; i < this.orphanedLasers.length; ++i) {
      this.orphanedLasers[i].cleanup()
    }
    dispose3(this.mesh);
  }
}
