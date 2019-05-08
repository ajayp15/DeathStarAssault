function Ground(w, h) {
  this.mesh = createGround(w, h);

  this.addMeshToGround = function(m) {
    this.mesh.add(m);
  }

  this.removeMeshFromGround = function(m) {
    this.mesh.remove(m);
  }
}

function createGround(width, height) {
  var geometry = new THREE.PlaneGeometry(width, height);
  var material = new THREE.MeshBasicMaterial( {color: 0x4191E1, side: THREE.DoubleSide} );

  var mesh = new THREE.Mesh( geometry, material );
  mesh.rotation.x += Math.PI / 2;
  mesh.position.y = 1

  mesh.receiveShadow = true;
  mesh.castShadow = false;
  // mesh.visible = false
  return mesh
}
