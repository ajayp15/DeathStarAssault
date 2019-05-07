function Ground() {
  this.createGround = function(width, height) {
    var geometry = new THREE.PlaneGeometry(width, height);
    var material = new THREE.MeshBasicMaterial( {color: 0x4191E1, side: THREE.DoubleSide} );

    this.ground = new THREE.Mesh( geometry, material );
    this.ground.rotation.x += Math.PI / 2;
    this.ground.position.y = 1

    this.ground.receiveShadow = true;
    this.ground.castShadow = false;
  }
  this.getMesh = function() {
    return this.ground
  }
}
