/*
    This file will define the enemy tie-fighters that will spring into action and start shooting at the player.
*/

var fighterRadius = obstaclesRadius / 1.3
var wingRadius = obstaclesRadius * 1.5
var numEnemies = 8
var numLasers = 15

// singular enemy
function Enemy(scene) {
    this.scene = scene
    this.mesh = createEnemy()
    this.boundingBox = getEnemyBoundingBox()
    this.mesh.add(this.boundingBox)
    this.shots = []
    this.shotDirs = []

    // explosion stuff
    this.dirs = undefined
    this.explosionParticles = undefined
    this.explosionIterations = 0 // how many times this explosion has been updated

    this.checkIfCollided = function (shape) {
        var boundingShape = new THREE.Box3().setFromObject(shape)

        // first check if it hit the cockpit
        // var boundingSphere = new THREE.Sphere(this.mesh.position, fighterRadius)
        var boundingBox = new THREE.Box3().setFromObject(this.boundingBox)

        if (boundingShape.intersectsBox(boundingBox)) {
            return true
        }

        return false
    }

    this.explode = function () {
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

function createEnemy() {
    var sphereGeometry = new THREE.SphereGeometry(fighterRadius, 8, 5) // make it as low resolution as possible, to optimize
    var bodyMaterial = new THREE.MeshLambertMaterial({ color: 0x393f49, side: THREE.DoubleSide })
    var body = new THREE.Mesh(sphereGeometry, bodyMaterial);

    // create wings now (just as circles) (6 segments, just like in real tie fighter)
    var circleGeometry1 = new THREE.CircleGeometry(wingRadius, 6)
    var wingMaterial1 = new THREE.MeshLambertMaterial({ color: 0x151616, side: THREE.DoubleSide })
    var wing1 = new THREE.Mesh(circleGeometry1, wingMaterial1)
    wing1.position.x = -fighterRadius
    wing1.rotation.y = Math.PI / 2.1

    var circleGeometry2 = new THREE.CircleGeometry(wingRadius, 6)
    var wingMaterial2 = new THREE.MeshLambertMaterial({ color: 0x151616, side: THREE.DoubleSide })
    var wing2 = new THREE.Mesh(circleGeometry2, wingMaterial2)
    wing2.position.x = fighterRadius
    wing2.rotation.y = Math.PI / 1.9

    /*
        Add wireframe shapes (identical to above but just different color)
        to look cool
    */
    var sphereGeometryWire = new THREE.SphereGeometry(fighterRadius, 8, 5) // make it as low resolution as possible, to optimize
    var bodyMaterialWire = new THREE.MeshLambertMaterial({
        color: 0x27292d,
        side: THREE.DoubleSide,
        wireframe: true
    })
    var bodyWire = new THREE.Mesh(sphereGeometryWire, bodyMaterialWire);

    // create wings now (just as circles) (6 segments, just like in real tie fighter)
    var circleGeometry1Wire = new THREE.CircleGeometry(wingRadius, 6)
    var wingMaterial1Wire = new THREE.MeshLambertMaterial({
        color: 0x393f49,
        side: THREE.DoubleSide,
        wireframe: true
    })
    var wing1Wire = new THREE.Mesh(circleGeometry1Wire, wingMaterial1Wire)
    wing1Wire.position.x = -fighterRadius
    wing1Wire.rotation.y = Math.PI / 2.1

    var circleGeometry2Wire = new THREE.CircleGeometry(wingRadius, 6)
    var wingMaterial2Wire = new THREE.MeshLambertMaterial({
        color: 0x393f49,
        side: THREE.DoubleSide,
        wireframe: true
    })
    var wing2Wire = new THREE.Mesh(circleGeometry2Wire, wingMaterial2Wire)
    wing2Wire.position.x = fighterRadius
    wing2Wire.rotation.y = Math.PI / 1.9

    /*
        Add the cockpit circle as a final touch
    */
    var sphereGeometry1 = new THREE.SphereGeometry(fighterRadius / 1.5, 8, 5) // make it as low resolution as possible, to optimize
    var cockpitMaterial = new THREE.MeshLambertMaterial({ color: 0x151616, side: THREE.DoubleSide })
    var cockpit = new THREE.Mesh(sphereGeometry1, cockpitMaterial);
    cockpit.position.z = fighterRadius / 1.5

    var obj = new THREE.Object3D()
    obj.add(body)
    obj.add(wing1)
    obj.add(wing2)
    // obj.add(bodyWire)
    obj.add(wing1Wire)
    obj.add(wing2Wire)
    obj.add(cockpit)

    obj.rotation.z = Math.random() * Math.PI * 2

    return obj
}

function getEnemyBoundingBox() {
    /*
        Compute bounding box
    */
    var boundingBox = new THREE.Mesh(
        new THREE.BoxGeometry(0.8, 1, 0.8),
        bbMat
    );
    boundingBox.visible = displayBoundingBoxes
   
    return boundingBox
}

// all enemies that are in-scene
function Enemies(scene, plane) {
    this.scene = scene
    this.plane = plane
    this.enemies = createEnemies()
    this.lasers = createInitialLasers()

    this.handleEnemyMovements = function (delta) {
        for (var i = 0; i < this.enemies.length; i++) {
            this.enemies[i].mesh.position.z += wallMovementSpeed * 1.5 * delta

            this.enemies[i].mesh.rotation.z += delta * 0.1 * Math.PI

            // reposition them at far plane if they went out of view
            if (this.enemies[i].mesh.position.z > nearPlane) {
                this.enemies[i].mesh.position.z = farPlane
                this.enemies[i].mesh.position.x = (Math.random() * 2 - 1) * 1.5
                this.enemies[i].mesh.position.y = Math.random() * (4 - 1) + 2
            }

            // also check if the player has hit any of them
            var shape = this.plane.boundingBox
            if (this.enemies[i].checkIfCollided(shape)) {
                // explode this ship and send it to the back
                this.enemies[i].explode()
                this.enemies[i].mesh.position.z = farPlane
                this.enemies[i].mesh.position.x = (Math.random() * 2 - 1) * 1.5
                this.enemies[i].mesh.position.y = Math.random() * (4 - 1) + 2

                // record that plane was hit
                this.plane.gotHit()
            }

            // update explosions while here
            this.enemies[i].updateExplosion(delta)
        }
    }

    // this just creates lasers that pop out 
    this.handleGenericLaserMovements = function (delta) {
        var laserSpeed = 25
        for (var i = 0; i < this.lasers.length; i++) {
            this.lasers[i].translateY(laserSpeed * delta) // y because rotated around x

            // check if it has gone out of scene, send it back to far plane ("remove it")
            if (this.lasers[i].position.z > nearPlane) {  // arbitrary distance to stop them at
                // send it back to the far plane
                this.lasers[i].position.x = (Math.random() * 2 - 1) * 2
                this.lasers[i].position.y = Math.random() * (4 - 1) + 2
                this.lasers[i].position.z = farPlane + (i / numEnemies) * (farPlane - nearPlane)
            }

            // also check if it has hit the player, while we are at it
            if (this.plane.checkIfCollided(this.lasers[i])) {
                // send it back to the far plane
                this.lasers[i].position.x = (Math.random() * 2 - 1) * 2
                this.lasers[i].position.y = Math.random() * (4 - 1) + 2
                this.lasers[i].position.z = farPlane + (i / numLasers) * (farPlane - nearPlane)

                this.plane.gotHit()
            }
        }
    }

    // when being shot at
    this.handleLaserCollisions = function () {
        var shotsFromPlane = this.plane.shots
        var shotsMissed = [] // return the shots that didn't hit anything, set plane shots buffer to that
        var enemiesHit = {}
        for (var i = 0; i < shotsFromPlane.length; i++) {
            var hitShip = false
            for (var j = 0; j < this.enemies.length; j++) {
                if (this.enemies[j].checkIfCollided(shotsFromPlane[i])) {
                    hitShip = true

                    enemiesHit[j] = true

                    // add to player score if they have destroyed a tie fighter
                    // console.log(score)
                    this.plane.updatePlayerScore()
                }
            }

            if (!hitShip) {
                shotsMissed.push(shotsFromPlane[i])
            } else {
                this.scene.removeMesh(shotsFromPlane[i])
            }
        }

        
        for (var enemyHit in enemiesHit) {
            // explode the enemy and remove it from the scene
            // (but don't actually remove it from the scene, just "explode" it
            // and move it back to the far plane --> is this going to cause
            // inefficiencies with things being generated in bulks sometimes?)
            this.enemies[enemyHit].explode()
            this.enemies[enemyHit].mesh.position.z = farPlane
            this.enemies[enemyHit].mesh.position.x = (Math.random() * 2 - 1) * 1.5
            this.enemies[enemyHit].mesh.position.y = Math.random() * (4 - 1) + 2
        }

        this.plane.shots = shotsMissed
    }

    // reset everything for new game
    this.reset = function () {
        // place all enemies at the far plane again
        for (var i = 0; i < this.enemies.length; i++) {
            this.enemies[i].mesh.position.z = farPlane + ((i + 1) / numEnemies) * (farPlane - nearPlane)
            this.enemies[i].mesh.position.x = (Math.random() * 2 - 1) * 1.5
            this.enemies[i].mesh.position.y = Math.random() * (4 - 1) + 2
        }

        // remove any of the pending explosions
        for (var i = 0; i < this.enemies.length; i++) {
            this.enemies[i].resetExplosions()
        }

        // make all of the lasers go back as well
        for (var i = 0; i < this.lasers.length; i++) {
            this.lasers[i].position.x = (Math.random() * 2 - 1) * 2
            this.lasers[i].position.y = Math.random() * (4 - 1) + 2
            this.lasers[i].position.z = farPlane + (i / numLasers) * (farPlane - nearPlane)
        }
    }
}

function createEnemies() {
    var enemies = []

    for (var i = 1; i <= numEnemies; i++) {
        enemy = new Enemy(this.scene)
        enemies.push(enemy)

        enemy.mesh.position.x = (Math.random() * 2 - 1) * 2
        // console.log(enemy.mesh.position.x)
        enemy.mesh.position.y = Math.random() * (4 - 1) + 2
        // enemy.mesh.position.z = -5
        enemy.mesh.position.z = farPlane + (i / numEnemies) * (farPlane - nearPlane)

        this.scene.addMesh(enemy.mesh)
    }

    return enemies
}

function createGenericLaser() {
    var laserGeometry = new THREE.CylinderGeometry(0.01, 0.01, 1, 4)
    var laserMaterial = new THREE.MeshLambertMaterial({
        color: 0xff0000,
    })
    var laser = new THREE.Mesh(laserGeometry, laserMaterial);
    laser.rotation.x = Math.PI / 2
    return laser
}

// this creates a few initial laser shots that travel through scene
function createInitialLasers() {
    var shots = []

    for (var i = 1; i <= numLasers; i++) {
        var shot = createGenericLaser()
        shots.push(shot)

        shot.position.x = (Math.random() * 2 - 1) * 2
        shot.position.y = Math.random() * (4 - 1) + 2
        shot.position.z = farPlane + (i / numLasers) * (farPlane - nearPlane)

        this.scene.addMesh(shot)
    }

    return shots
}