/*
    This file will keep track of all explosions in the 
    scene and also update their positions.
*/

var explosionMovementSpeed = 5

// one individual explosion
function Explosion(scene) {
    this.scene = scene
    this.dirs = undefined
    this.explosionParticles = undefined
    this.explosionIterations = 0 // how many times this explosion has been updated
    this.numParticles = 0

    this.explode = function(location, objectSize, numParticles, color) {
        this.numParticles = numParticles
        var geometry = new THREE.Geometry();
        this.dirs = []

        for (i = 0; i < numParticles; i++) {
            var vertex = location.clone()
            geometry.vertices.push(vertex);
            this.dirs.push({ x: (Math.random() * explosionMovementSpeed) - (explosionMovementSpeed / 2), 
                y: (Math.random() * explosionMovementSpeed) - (explosionMovementSpeed / 2), 
                z: (Math.random() * explosionMovementSpeed) - (explosionMovementSpeed / 2) });
        }
        // could also do random-ish colors here
        var material = new THREE.PointsMaterial({ size: objectSize, color: color });
        var particles = new THREE.Points(geometry, material);

        this.explosionParticles = particles
        this.explosionParticles.geometry.verticesNeedUpdate = true;

        this.scene.addMesh(particles);
    }

    this.updateExplosion = function(delta) {
        if (this.explosionParticles != undefined) {
            for (var i = 0; i < this.numParticles; i++) {
                var particle = this.explosionParticles.geometry.vertices[i]
                particle.y += this.dirs[i].y * delta;
                particle.x += this.dirs[i].x * delta;
                particle.z += this.dirs[i].z * delta;
                this.explosionParticles.geometry.vertices[i] = particle
            }
            this.explosionParticles.geometry.verticesNeedUpdate = true;
            this.explosionIterations += 1
        }
        // stop it after some arbitrary time, don't want to render those particles
        // forever
        var seconds = 2
        if (this.explosionParticles != undefined &&
            this.explosionIterations >= 60 * seconds) { // assume called every 1/60th second
            this.scene.removeMesh(this.explosionParticles);
            this.explosionParticles = undefined;
            this.dirs = undefined
            this.explosionIterations = 0

            return false // return false, to signify that we can remove this explosion
        }

        return true // return true default
    }

    this.reset = function() {
        if (this.explosionParticles != undefined) {
            this.scene.removeMesh(this.explosionParticles);
            this.explosionParticles = undefined;
            this.dirs = undefined
            this.explosionIterations = 0
        }
    }
}

function Explosions(scene) {
    this.scene = scene
    this.explosions = []

    this.addExplosion = function (location, objectSize, numParticles, color = 0xf4bc42) {
        var explosion = new Explosion(scene)
        this.explosions.push(explosion)

        explosion.explode(location, objectSize, numParticles, color)
    }

    this.updateExplosions = function (delta) {
        var explosionsToKeep = []
        for (var i = 0; i < this.explosions.length; i++) {
            var explosionStillValid = this.explosions[i].updateExplosion(delta)
            if (explosionStillValid) {
                explosionsToKeep.push(this.explosions[i])
            }
        }
        this.explosions = explosionsToKeep
    }

    this.resetExplosions = function () {
        for (var i = 0; i < this.explosions.length; i++) {
            this.explosions[i].reset()
        }
    }
}
