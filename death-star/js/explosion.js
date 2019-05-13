/*
  explosion.js
*/

var activeExplosions = []

function updateExplosions(dt) {
  for (var i = 0; i < activeExplosions.length; ++i) {
    activeExplosions[i].update(dt)
  }
}

function Explosion(scene, center, particleSize, color, velocityBias = zeroVec3) {
  this.scene = scene
  this.center = center

  this.explode = function () {
      var geometry = new THREE.Geometry();
      var objectSize = particleSize
      var movementSpeed = 100

      this.dirs = []
      this.numParticles = 100

      this.explosionIterations = 0

      for (i = 0; i < this.numParticles; i++) {
          var vertex = this.center.clone()
          geometry.vertices.push(vertex);
          this.dirs.push(
            {
              x: (Math.random() * movementSpeed) - (movementSpeed / 2) + velocityBias.x,
              y: (Math.random() * movementSpeed) - (movementSpeed / 2) + velocityBias.y,
              z: (Math.random() * movementSpeed) - (movementSpeed / 2) + velocityBias.z
            }
          );
      }

      var material = new THREE.PointsMaterial({ size: objectSize, color: color });
      var particles = new THREE.Points(geometry, material);

      this.explosionParticles = particles
      this.explosionParticles.geometry.verticesNeedUpdate = true;

      this.scene.addObj(this.explosionParticles)
      this.scene = scene

      activeExplosions.push(this)
  }

  this.update = function(dt) {
      if (this.explosionParticles != undefined) {
          for (var i = 0; i < this.numParticles; i++) {
              var particle = this.explosionParticles.geometry.vertices[i]
              particle.y += this.dirs[i].y * dt;
              particle.x += this.dirs[i].x * dt;
              particle.z += this.dirs[i].z * dt;
              this.explosionParticles.geometry.vertices[i] = particle
          }
          this.explosionParticles.geometry.verticesNeedUpdate = true;
          this.explosionIterations += 1
      }
      // stop it after some arbitrary time, don't want to render those particles
      // forever
      var seconds = 4
      if (this.explosionIterations >= 60 * seconds) {
          this.scene.removeObj(this.explosionParticles);
          for (var i = 0; i < activeExplosions.length; ++i) {
            if (activeExplosions[i] === this) {
              activeExplosions.splice(i, 1)
              return
            }
          }
      }
  }
}
