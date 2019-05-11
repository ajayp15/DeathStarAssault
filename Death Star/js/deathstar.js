/*
    deathstar.js: This file defines all of the functions
    necessary to make the deathstar mesh, generate turrets, and
    animate it, etc.
*/

function Deathstar(size, turret_count, smallStructureCount = 1000) {
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
  for (var i = 0; i < turret_count; ++i) {
    var turret = new Turret(
                      Math.random() * shipMaximumPlaneCoord * 2 - shipMaximumPlaneCoord,
                      Math.random() * shipMaximumPlaneCoord * 2 - shipMaximumPlaneCoord
                    )
    scene.addObj(turret.mesh);
    this.turrets.push(turret);
  }

  // add small structures
  var structureTexture = THREE.ImageUtils.loadTexture( 'images/structures_diffuse.jpg' );
  structureTexture.wrapS = structureTexture.wrapT = THREE.RepeatWrapping;
	structureTexture.repeat.set( 1, 1 );
  var structureMaterial = new THREE.MeshPhongMaterial( { map: structureTexture } );

  for (var i = 0; i < smallStructureCount; ++i) {
    var structX = Math.random() * 50 + 25
    var structY = Math.random() * 50 + 25
    var structZ = Math.random() * 5 + 5
    var smallStruct =
      new THREE.Mesh(
        new THREE.BoxGeometry(structX, structZ, structY),
        structureMaterial
      );
    smallStruct.castShadow=true;
    smallStruct.position.copy(
      new THREE.Vector3(
        Math.random() * shipMaximumPlaneCoord * 2 - shipMaximumPlaneCoord,
        structZ / 2,
        Math.random() * shipMaximumPlaneCoord * 2 - shipMaximumPlaneCoord
      )
    );

    if (Math.random() < 0.5) { // half the time, add inner structure
      var innerStruct =
        new THREE.Mesh(
          new THREE.BoxGeometry(structX / 2, structZ * 2, structY / 2),
          structureMaterial
        );
      innerStruct.castShadow=true;
      innerStruct.position.set(smallStruct.position.x, structZ, smallStruct.position.z);
      scene.addObj(innerStruct);
      this.smallStructures.push(innerStruct)
    }
    scene.addObj(smallStruct);
    this.smallStructures.push(smallStruct)
  }

	this.mesh.receiveShadow = true;
	this.mesh.castShadow=false;

  this.update = function(dt) {
    for (var i = 0; i < this.turrets.length; ++i) {
      var turret = this.turrets[i]
      this.turrets[i].update(dt)
    }
  }

  this.handleTurretHit = function(turretIndex) {
    this.turrets[turretIndex].hitCount += 1

  }

}
