/*
    This file defines the walls of the "endless" runner
    part of the game.
*/

function Walls(scene) {
    this.scene = scene
    this.leftMesh = createWall("left")
    this.rightMesh = createWall("right")
    this.designsOnWalls = createDesigns()

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
    this.backMesh = createBackWall()

    this.handleWallMovements = function (delta) {
        for (var i = 0; i < this.designsOnWalls.length; i++) {
            this.designsOnWalls[i].position.z += wallMovementSpeed * delta
            if (this.designsOnWalls[i].position.z > wallNearPlaneGeneration) {
                this.designsOnWalls[i].position.z = farPlane
            }
        }
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

function createBackWall() {
    var wallWidth = 10
    var wallHeight = 30
    var wallDepth = 5

    var geometry = new THREE.BoxGeometry(wallWidth, wallHeight, wallDepth)
    var material = new THREE.MeshLambertMaterial({ color: 0x606670 , side: THREE.DoubleSide});

    var wall = new THREE.Mesh(geometry, material);
    
    wall.position.z = -60; // as far as side walls go

    wall.receiveShadow = true;
    wall.castShadow = true;

    // this.scene.addMesh(wall)
    // console.log("hi")
    return wall
}