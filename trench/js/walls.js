/*
    This file defines the walls of the "endless" runner
    part of the game.
*/

var backWallWidth = 10
var backWallHeight = 15
var backWallDepth = 5
var wallShift = 5

function Walls(scene, explosions) {
    this.scene = scene
    this.explosions = explosions
    this.leftMesh = createWall("left") // array of (3) parts of the wall
    this.rightMesh = createWall("right")
    // this.designsOnWalls = createDesigns()
    this.backWall = undefined

    this.computeWallBoundary = function(side) {
        if (side == "left") {
            return -wallShift + sideWallWidth / 2
        } else {
            return wallShift - sideWallWidth / 2
        }
    }

    this.leftWallX = this.computeWallBoundary("left")
    this.rightWallX = this.computeWallBoundary("right")

    this.handleWallMovements = function (delta, finishedPhase1) {
        // left wall
        for (var i = 0; i < this.leftMesh.length; i++) {
            this.leftMesh[i].position.z += wallMovementSpeed * delta
        }
        if (this.leftMesh[0].position.z - sideWallDepth / 2 >= nearPlane) {
            this.leftMesh[0].position.z = this.leftMesh[1].position.z - groundDepth
            // swap them
            this.leftMesh = [this.leftMesh[1], this.leftMesh[0]]
        }

        // right wall
        for (var i = 0; i < this.rightMesh.length; i++) {
            this.rightMesh[i].position.z += wallMovementSpeed * delta
        }
        if (this.rightMesh[0].position.z - sideWallDepth / 2 >= nearPlane) {
            this.rightMesh[0].position.z = this.rightMesh[1].position.z - groundDepth
            // swap them
            this.rightMesh = [this.rightMesh[1], this.rightMesh[0]]
        }

        // // move the back wall with the missile shot location if in phase2
        if (finishedPhase1 && !gameOver) { // don't move it anymore if lost
            this.backWall.position.z += wallMovementSpeed * delta
        }
    }

    this.createBackWall = function() {
        var wallWidth = backWallWidth
        var wallHeight = backWallHeight
        var wallDepth = backWallDepth

        var planeTexture = new THREE.TextureLoader().load( 'surface/images/deathstar-diffuse.jpg' );
        var geometry = new THREE.BoxGeometry(wallWidth, wallHeight, wallDepth)
        var material = new THREE.MeshLambertMaterial({ map: planeTexture, color: 0x606670 , side: THREE.DoubleSide});

        var wall = new THREE.Mesh(geometry, material);

        wall.position.z = farPlane * 1.5; // a little further to give time for slowdown

        wall.receiveShadow = true;
        wall.castShadow = true;

        // add a little cylindrical hole in the center to signify where to shoot
        var holeGeometry = new THREE.TorusGeometry(aimRadius * 2, aimRadius, 4, 8)
        var holeMaterial = new THREE.MeshLambertMaterial({ map: planeTexture, color: 0x4b4b4f, side: THREE.DoubleSide})
        var hole = new THREE.Mesh(holeGeometry, holeMaterial)

        hole.position.x = 0
        hole.position.y = wallHeight / 4
        hole.position.z = wallDepth / 2

        wall.add(hole)

        // add a very dark circle inside the torus
        var circleGeometry = new THREE.CircleGeometry(aimRadius)
        var circleMaterial = new THREE.MeshLambertMaterial({color: 0x232426, side: THREE.DoubleSide})
        var circle = new THREE.Mesh(circleGeometry, circleMaterial)

        circle.position.x = 0
        circle.position.y = wallHeight / 4
        circle.position.z = wallDepth / 2 + 0.001

        wall.add(circle)

        this.scene.addMesh(wall)

        return wall
    }

    this.backWall = this.createBackWall()
    this.backWall.visible = false

    this.checkIfBlewUpBackWall = function(shots) {
        var center = this.backWall.position.clone()
        center.y += backWallHeight / 4
        center.z += backWallDepth / 2
        var wallHitBox = new THREE.Sphere(center, aimRadius)
        for (var i = 0; i < shots.length; i++) {
            var shot = shots[i]

            var bounding = new THREE.Sphere(shot.position, torpedoRadius)
            if (wallHitBox.intersectsSphere(bounding)) {
                return true
            }
        }

        return false
    }

    this.backWallExplode = function() {
        this.scene.removeMesh(this.backWall)

        var audio = new Audio('common/sounds/deathstarexplode.mp3');
        audio.play();

        var center = this.backWall.position.clone()
        center.y += backWallHeight / 4
        center.z += backWallDepth / 2
        var objectSize = 0.1
        var numParticles = 10000
        var color = 0xf4bc42
        var moveSpeed = 20
        this.explosions.addExplosion(center, objectSize, numParticles, color, moveSpeed)
    }

    this.reset = function() {
        if (this.backWall != undefined) {
            this.scene.removeMesh(this.backWall)
            this.backWall = undefined
        }
    }
}

var minPadding = 1

function createWall(side) {
    var wall = []
    var subWall = createSubWall(side)
    var subWall2 = createSubWall(side)
    subWall.position.z = nearPlane
    subWall2.position.z = -sideWallDepth + nearPlane
    wall = [subWall, subWall2]

    return wall
}

function createSubWall(side) {
    var wallWidth = sideWallWidth
    var wallHeight = sideWallHeight
    var wallDepth = sideWallDepth

    var numDesigns = Math.round(sideWallDepth / numWalls)

    var planeTexture = new THREE.TextureLoader().load( 'surface/images/deathstar-diffuse.jpg' );

    var geometry = new THREE.BoxGeometry(wallWidth, wallHeight, wallDepth)
    var material = new THREE.MeshLambertMaterial({ map: planeTexture, color: 0x4b4b4f , side: THREE.DoubleSide});

    var mainMesh = new THREE.Mesh(geometry, material);
    var wall = new THREE.Object3D();
    wall.add(mainMesh)

    // add designs
    var designsGeometry = new THREE.Geometry()
    for (var i = 0; i < numDesigns; i++) {
        var design = createDesign(wallHeight, wallWidth, wallDepth, i, numDesigns, side)
        design.updateMatrix()
        designsGeometry.merge(design.geometry, design.matrix)
    }
    var structuresMat = new THREE.MeshLambertMaterial({ map: structureTexture, color: 0x606670 , side: THREE.DoubleSide});
    var designs = new THREE.Mesh(designsGeometry, structuresMat)
    wall.add(designs)

    // set position
    wall.position.x = (side == "left") ? -wallShift : wallShift

    this.scene.addMesh(wall)

    return wall
}

function createDesign(wallHeight, wallWidth, wallDepth, zIndex, numDesigns, side) {
    var width = 1
    var height = 5
    var depth = 5

    var compWidth = Math.random() * width
    var compHeight = Math.random() * (height - 1) + minPadding
    var compDepth = Math.random() * (depth - 1) + minPadding

    var structureTexture = new THREE.TextureLoader().load( 'surface/images/structures-diffuse.jpg' );

    var geometry = new THREE.BoxGeometry(compWidth, compHeight, compDepth)
    var material = new THREE.MeshLambertMaterial({ map: structureTexture, color: 0x606670 , side: THREE.DoubleSide});

    material.polygonOffset = true
    material.polygonOffsetFactor = -0.1
    var box = new THREE.Mesh(geometry, material)

    box.position.x = (side == "left") ? wallWidth / 2 : -wallWidth / 2
    box.position.y = Math.random() * wallHeight / 2
    box.position.z = (zIndex / numDesigns) * (wallDepth)

    return box
}