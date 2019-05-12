/*
    This file will keep track of all explosions in the 
    scene and also update their positions.
*/

// one individual explosion
function Explosion(scene) {
    this.scene = scene
    this.dirs = undefined
    this.explosionParticles = undefined
    this.explosionIterations = 0 // how many times this explosion has been updated

    // if you are exploding, check that you didn't already explode, and git rid of those
        // particles pre-emptively so that they don't linger
        if (this.explosionParticles != undefined) {
            this.scene.removeMesh(this.explosionParticles);
            this.explosionParticles = undefined;
            this.dirs = undefined
            this.explosionIterations = 0
        }

        var geometry = new THREE.Geometry();
        var objectSize = 0.03
        var movementSpeed = 5
        this.dirs = []
        var numParticles = 100
        for (i = 0; i < numParticles; i++) {
            var vertex = this.mesh.position.clone()

            geometry.vertices.push(vertex);
            this.dirs.push({ x: (Math.random() * movementSpeed) - (movementSpeed / 2), y: (Math.random() * movementSpeed) - (movementSpeed / 2), z: (Math.random() * movementSpeed) - (movementSpeed / 2) });
        }
        // could also do random-ish colors here
        var material = new THREE.PointsMaterial({ size: objectSize, color: 0xf4bc42 });
        var particles = new THREE.Points(geometry, material);

        this.explosionParticles = particles
        this.explosionParticles.geometry.verticesNeedUpdate = true;

        this.scene.addMesh(particles);
}

function Explosions(scene) {
    this.scene = scene
    this.explosions = []

    this.addExplosion = function (location, size, ) {
        
    }

    this.updateExplosion = function (delta) {
        var numParticles = 100
        if (this.explosionParticles != undefined) {
            for (var i = 0; i < numParticles; i++) {
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
        }
    }

    this.resetExplosions = function () {
        if (this.explosionParticles != undefined) {
            this.scene.removeMesh(this.explosionParticles);
            this.explosionParticles = undefined;
            this.dirs = undefined
            this.explosionIterations = 0
        }
    }
}
