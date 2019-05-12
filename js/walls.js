/*
    This file defines the walls of the "endless" runner
    part of the game.
*/

var backWallWidth = 10
var backWallHeight = 15
var backWallDepth = 5

function Walls(scene) {
    this.scene = scene
    this.leftMesh = createWall("left")
    this.rightMesh = createWall("right")
    this.designsOnWalls = createDesigns()
    this.backWall = undefined

    this.computeWallBoundary = function(side) {
        if (side == "left") {
            this.leftMesh.geometry.computeBoundingBox()
            return this.leftMesh.geometry.boundingBox.max.x + this.leftMesh.position.x
        } else {
            this.rightMesh.geometry.computeBoundingBox()
            return this.rightMesh.geometry.boundingBox.min.x + this.rightMesh.position.x
        }
    }

    this.leftWallX = this.computeWallBoundary("left")
    this.rightWallX = this.computeWallBoundary("right")

    this.handleWallMovements = function (delta, finishedPhase1) {
        for (var i = 0; i < this.designsOnWalls.length; i++) {
            this.designsOnWalls[i].position.z += wallMovementSpeed * delta
            if (this.designsOnWalls[i].position.z > wallNearPlaneGeneration) {
                this.designsOnWalls[i].position.z = farPlane
            }
        }

        // move the back wall with the missile shot location if in phase2
        if (finishedPhase1) {
            this.backWall.position.z += wallMovementSpeed * delta
        }
    }

    this.createBackWall = function() {
        var wallWidth = backWallWidth
        var wallHeight = backWallHeight
        var wallDepth = backWallDepth
    
        var geometry = new THREE.BoxGeometry(wallWidth, wallHeight, wallDepth)
        var material = new THREE.MeshLambertMaterial({ color: 0x606670 , side: THREE.DoubleSide});
    
        var wall = new THREE.Mesh(geometry, material);
        
        wall.position.z = farPlane * 1.5; // a little further to give time for slowdown
    
        wall.receiveShadow = true;
        wall.castShadow = true;

        // add a little cylindrical hole in the center to signify where to shoot
        var holeGeometry = new THREE.TorusGeometry(aimRadius * 2, aimRadius, 4, 8)
        var holeMaterial = new THREE.MeshLambertMaterial({color: 0x4b4b4f, side: THREE.DoubleSide})
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
        
        this.backWall = wall
    }

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
        
    }
}

function createWall(side) {
    var wallWidth = 5
    var wallHeight = 15
    var wallDepth = 60
    var wallShift = 5

    var geometry = new THREE.BoxGeometry(wallWidth, wallHeight, wallDepth)
    var material = new THREE.MeshLambertMaterial({ color: 0x4b4b4f , side: THREE.DoubleSide});

    var wall = new THREE.Mesh(geometry, material);

    wall.receiveShadow = true;
    wall.castShadow = true;

    // set position
    if (side == "left") {
        wall.position.x = -wallShift
    } else {
        wall.position.x = wallShift
    }

    this.scene.addMesh(wall)

    return wall
}

function createDesigns() {
    var numDesigns = 50
    var designsOnWalls = []
    var width = 1
    var height = 5
    var depth = 5
    var wallShift = 2.5
    var minPadding = 1

    // left wall
    for (var i = 0; i < numDesigns; i++) {
        var compWidth = Math.random() * width
        var compHeight = Math.random() * (height - 1) + minPadding
        var compDepth = Math.random() * (depth - 1) + minPadding

        var geometry = new THREE.BoxGeometry(compWidth, compHeight, compDepth)
        var material = new THREE.MeshLambertMaterial({ color: 0x606670 , side: THREE.DoubleSide});

        var box = new THREE.Mesh(geometry, material)

        box.receiveShadow = true;
        box.castShadow = true;

        box.position.x = -wallShift
        box.position.y = Math.random() * 7
        box.position.z = (i / numDesigns) * (farPlane - wallNearPlaneGeneration)
        this.scene.addMesh(box)
        designsOnWalls.push(box)
    }
    // right wall
    for (var i = 0; i < numDesigns; i++) {
        var compWidth = Math.random() * width
        var compHeight = Math.random() * (height - 1) + minPadding
        var compDepth = Math.random() * (depth - 1) + minPadding

        var geometry = new THREE.BoxGeometry(compWidth, compHeight, compDepth)
        var material = new THREE.MeshLambertMaterial({ color: 0x606670 , side: THREE.DoubleSide});

        var box = new THREE.Mesh(geometry, material)

        box.receiveShadow = true;
        box.castShadow = true;

        box.position.x = wallShift
        box.position.y = Math.random() * 7
        box.position.z = (i / numDesigns) * (farPlane - wallNearPlaneGeneration)
        this.scene.addMesh(box)
        designsOnWalls.push(box)
    }
    return designsOnWalls
}
