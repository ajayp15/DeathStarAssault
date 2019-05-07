function Ground(w, h) {
  this.mesh = this.createGround(w, h);
  this.createGround = function(width, height) {
    var geometry = new THREE.PlaneGeometry(width, height);
    var material = new THREE.MeshBasicMaterial( {color: 0x4191E1, side: THREE.DoubleSide} );

    this.mesh = new THREE.Mesh( geometry, material );
    this.mesh.rotation.x += Math.PI / 2;
    this.mesh.position.y = 1

    this.mesh.receiveShadow = true;
    this.mesh.castShadow = false;
  }
}
