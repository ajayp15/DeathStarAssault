/*
    deathstar.js: This file defines all of the functions
    necessary to make the deathstar mesh, generate turrets, and
    animate it, etc.
*/

function Deathstar(radius, position, turret_count, small_structure_count = 1000) {
  this.radius = radius
  this.turrets = []

  var sphereGeometry =  new THREE.SphereGeometry( this.radius, 200, 200 );
  var sphereTexture = THREE.ImageUtils.loadTexture( 'images/deathstar_diffuse.jpg' );
	sphereTexture.wrapS = sphereTexture.wrapT = THREE.RepeatWrapping;
	sphereTexture.repeat.set( 200, 200 );
	var sphereMaterial = new THREE.MeshBasicMaterial( { map: sphereTexture } );
  this.mesh = new THREE.Mesh( sphereGeometry, sphereMaterial );


  var towerTexture = THREE.ImageUtils.loadTexture( 'images/towers_diffuse.jpg' );
	towerTexture.wrapS = towerTexture.wrapT = THREE.RepeatWrapping;
	towerTexture.repeat.set( 1, 1 );
	var towerMaterial = new THREE.MeshBasicMaterial( { map: towerTexture } );
  for (var i = 0; i < turret_count; ++i) {
    var turret =
      new THREE.Mesh(
        new THREE.BoxGeometry(2, 2, 6),
        towerMaterial
      );
    turret.position.setFromSphericalCoords(
      radius + 3,
      THREE.Math.degToRad(Math.random() * 360),
      THREE.Math.degToRad(Math.random() * 360));
    turret.lookAt(this.mesh.position);
    scene.addMesh(turret);
  }

  for (var i = 0; i < small_structure_count; ++i) {
    var turret =
      new THREE.Mesh(
        new THREE.BoxGeometry(5 + 10 * Math.random(), 5 + 10 * Math.random(), 2),
        towerMaterial
      );
    turret.position.setFromSphericalCoords(
      radius + 0.5,
      THREE.Math.degToRad(Math.random() * 360),
      THREE.Math.degToRad(Math.random() * 360));
    turret.lookAt(this.mesh.position);
    scene.addMesh(turret);
  }

	this.mesh.receiveShadow = true;
	this.mesh.castShadow=false;
	this.mesh.position.copy(position);
}
