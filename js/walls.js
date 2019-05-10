/*
    This file defines the walls of the "endless" runner
    part of the game.
*/

function Walls(scene) {
    this.scene = scene
    this.leftMesh = createWall("left", scene)
    this.rightMesh = createWall("right", scene)

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
}

function createWall(side) {
    var wallWidth = 5
    var wallHeight = 15
    var wallDepth = 60
    var wallShift = 5

    var geometry = new THREE.BoxGeometry(wallWidth, wallHeight, wallDepth)
    var material = new THREE.MeshPhongMaterial({ color: 0x606670 , side: THREE.DoubleSide});

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

function createBackWall() {
    var wallWidth = 10
    var wallHeight = 30
    var wallDepth = 5

    var geometry = new THREE.BoxGeometry(wallWidth, wallHeight, wallDepth)
    var material = new THREE.MeshPhongMaterial({ color: 0x606670 , side: THREE.DoubleSide});

    var wall = new THREE.Mesh(geometry, material);
    
    wall.position.z = -60; // as far as side walls go

    wall.receiveShadow = true;
    wall.castShadow = true;

    // this.scene.addMesh(wall)
    // console.log("hi")
    return wall
}