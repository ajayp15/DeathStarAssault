/*
  laser.js
*/

function Laser(position, velocity, color, maximumDistance = 300, size = 0.2) {
  var laserGeo = new THREE.CylinderGeometry(size, size, 15)
  var laserMat = new THREE.MeshLambertMaterial({
    color: color,
  })
  this.mesh = new THREE.Mesh(laserGeo, laserMat);
  this.mesh.position.copy(position)

  var quaternion = new THREE.Quaternion();
  var currentAxis = new THREE.Vector3(0, 1, 0);
  var targetAxis = new THREE.Vector3().copy(velocity).normalize()
  quaternion.setFromUnitVectors(currentAxis, targetAxis)
  this.mesh.applyQuaternion(quaternion)

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
