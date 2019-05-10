/*
  laser.js
*/

function Laser(position, velocity, color, maximumDistance = 300) {
  var laserGeo = new THREE.SphereGeometry(0.2, 5, 5)
  var laserMat = new THREE.MeshLambertMaterial({
    color: color,
  })
  this.mesh = new THREE.Mesh(laserGeo, laserMat);
  this.mesh.position.copy(position)
  this.mesh.lookAt(velocity)
  this.velocity = velocity

  this.initialPosition = position.clone();
  this.maximumDistance = maximumDistance
  this.alive = true

  this.update = function(dt) {
    if (this.initialPosition.distanceTo(this.mesh.position) >= maximumDistance) {
      this.mesh.visible = false
      this.alive = false
    }
    this.mesh.position.add(this.velocity.clone().multiplyScalar(dt));
  }
}
