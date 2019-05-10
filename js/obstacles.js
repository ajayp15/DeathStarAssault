/*
    obstacles.js: This file handles all of the obstacles
    in the scene.
*/

function Obstacles(scene, ground, plane, walls) {
    this.scene = scene
    this.plane = plane
    this.ground = ground
    this.walls = walls
    this.basicObstacles = []

    this.createBasicObstacle = function (box = false) {
        var mesh;
        if (obstaclesType == "box") {
            var boxGeometry = new THREE.BoxGeometry(1, 1, 1);
            var boxMaterial = new THREE.MeshPhongMaterial({ color: 0xffa500 , side: THREE.DoubleSide});
            mesh = new THREE.Mesh(boxGeometry, boxMaterial);
            mesh.position.y = 1

            mesh.geometry.computeBoundingBox()
        } else if (obstaclesType == "sphere") {
            // consider making this octahedron later -- just need to figure out the
            // collisions with that
            var sphereGeometry = new THREE.SphereGeometry(obstaclesRadius, 32, 32)
            var material = new THREE.MeshPhongMaterial({color: 0xffa500, side : THREE.DoubleSide})
            mesh = new THREE.Mesh(sphereGeometry, material);
            // mesh.castShadow = true
            
            mesh.geometry.computeBoundingSphere()
        }

        var obj = new THREE.Object3D();
        obj.add(mesh);

        // obj.castShadow = true

        return obj;
    }

    this.addBasicObstacle = function (startAtFarPlane = true) {
        if (this.basicObstacles.length >= maxBasicObstacles) {
            // TODO: this seems to be printing out at some periodicity, why?
            // console.log("hit max, size is: " + this.basicObstacles.length)
            return; // don't create more if we have already hit the max
        }

        var obstacle = this.createBasicObstacle();
        obstacle.visible = true;

        // place randomly across the floor
        // x = left and right
        // y = up and down
        // z = into and out of screen
        var xRange = Math.abs(this.walls.leftWallX - this.walls.rightWallX) - 2 * obstaclesRadius
        var x = (2 * Math.random() - 1) * xRange / 2
        var y = (Math.random()) * yFar + groundLeeway
        var z = 0

        if (startAtFarPlane) { // if they should start far away from the player (generated)
            z = farPlane // arbitrary, should be based on screen height?
        }

        obstacle.position.set(x, y, z)

        // add to scene (adding to floor reverses axes, better to keep it this way)
        this.scene.addMesh(obstacle)

        // push it to the general basicObstacles array
        this.basicObstacles.push(obstacle);
        return obstacle
    }

    // this function generates an initial amount of maxObstacles number of 
    // obstacles, randomly spread out (beyond the far plane), so as to give a
    // more continuous generation of blocks as they go out of scope of the screen
    this.generateInitialObstacles = function() {
        for (var i = 0; i < maxBasicObstacles; i++) {
            var obstacle = this.createBasicObstacle();
            obstacle.visible = true

            var xRange = Math.abs(this.walls.leftWallX - this.walls.rightWallX) - 2 * obstaclesRadius
            var x = (2 * Math.random() - 1) * xRange / 2
            var y = (Math.random()) * yFar + groundLeeway
            // range from [farPlane, farPlane * 2 - nearPlane] because we want a continuous
            // spread over such a range
            var z = farPlane + (Math.random()) * (farPlane - nearPlane);

            obstacle.position.set(x, y, z)

            this.scene.addMesh(obstacle)

            this.basicObstacles.push(obstacle);
        }
    }

    // This removes objects that have gone out of view, and also checks if the
    // plane is in contact with the obstacles
    this.doObjectLogic = function () {
        var pos = new THREE.Vector3()
        var basicObstaclesRef = this.basicObstacles
        var obstaclesToKeep = []
        var obstaclesRemovedCount = 0

        // check if any objects are out of view, or if collided with anything
        for (var i = 0; i < basicObstaclesRef.length; i++) {
            var element = basicObstaclesRef[i]
            pos.setFromMatrixPosition(element.matrixWorld);
            var outOfView = (pos.z > nearPlane)

            if (outOfView) {
                // remove if it is out of view
                this.scene.removeMesh(element)
                obstaclesRemovedCount += 1
            } else {
                // check if collision occurred with character
                var collided = checkIfCollidedCheap(this.plane.mesh, element, "box", obstaclesType)
                if (collided) {
                    hasCollided = true
                }
                
                obstaclesToKeep.push(element)
            }
        }

        this.basicObstacles = obstaclesToKeep

        // add back in the appropriate amount of obstacles, according to how many
        // were removed (start them at back wall again)
        for (var i = 0; i < obstaclesRemovedCount; i++) {
            this.addBasicObstacle(true)
        }
    }

    this.handleObstacleMovement = function (delta) {
        for (var i = 0; i < this.basicObstacles.length; i++) {
            this.basicObstacles[i].position.z += movementSpeed * delta
        }
    }
}
