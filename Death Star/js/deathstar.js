/*
    deathstar.js: This file defines all of the functions
    necessary to make the deathstar mesh, generate turrets, and
    animate it, etc.
*/

function Deathstar(size, turret_count, small_structure_count = 1000) {
  this.turrets = []
  this.shots = []

  var planeGeometry =  new THREE.PlaneGeometry( size, size, 200, 200 );
  var planeTexture = THREE.ImageUtils.loadTexture( 'images/deathstar_diffuse.jpg' );
  planeTexture.wrapS = planeTexture.wrapT = THREE.RepeatWrapping;
	planeTexture.repeat.set( 100, 100);
	var planeMaterial = new THREE.MeshPhongMaterial( { map: planeTexture, side: THREE.FrontSide } );
  this.mesh = new THREE.Mesh( planeGeometry, planeMaterial );
  this.mesh.rotation.x = - Math.PI / 2;

  var towerTexture = THREE.ImageUtils.loadTexture( 'images/towers_diffuse.jpg' );
	towerTexture.wrapS = towerTexture.wrapT = THREE.RepeatWrapping;
	towerTexture.repeat.set( 2, 2 );
	var towerMaterial = new THREE.MeshPhongMaterial( { map: towerTexture } );
  for (var i = 0; i < turret_count; ++i) {
    var turret =
      new THREE.Mesh(
        new THREE.BoxGeometry(10, 10, 60),
        towerMaterial
      );
    turret.castShadow=true;
    turret.position.copy(new THREE.Vector3(Math.random() * size - size / 2, Math.random() * size - size / 2, 30));
    this.mesh.add(turret);
    this.turrets.push(turret);
  }

  var structureTexture = THREE.ImageUtils.loadTexture( 'images/structures_diffuse.jpg' );
  structureTexture.wrapS = structureTexture.wrapT = THREE.RepeatWrapping;
	structureTexture.repeat.set( 2, 2 );
  var structureMaterial = new THREE.MeshPhongMaterial( { map: structureTexture } );
  for (var i = 0; i < small_structure_count; ++i) {
    var structX = Math.random() * 50 + 25
    var structY = Math.random() * 50 + 25
    var structZ = Math.random() * 5 + 5
    var small_struct =
      new THREE.Mesh(
        new THREE.BoxGeometry(structX, structY, structZ),
        structureMaterial
      );
    small_struct.castShadow=true;
    small_struct.position.copy(new THREE.Vector3(Math.random() * size - size / 2, Math.random() * size - size / 2, structZ / 2));

    if (Math.random() < 0.5) {
      var inner_struct =
        new THREE.Mesh(
          new THREE.BoxGeometry(structX / 2, structY / 2, structZ * 2),
          structureMaterial
        );
      inner_struct.castShadow=true;
      inner_struct.position.set(small_struct.position.x, small_struct.position.y, structZ);
      this.mesh.add(inner_struct);
    }
    this.mesh.add(small_struct);
  }

	this.mesh.receiveShadow = true;
	this.mesh.castShadow=false;

  this.update = function() {

  }

}
