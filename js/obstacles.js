/*
    obstacles.js: This file handles all of the obstacles
    in the scene.
*/

function Obstacles(scene, ground, plane) {
    this.scene = scene
    this.plane = plane
    this.ground = ground
    this.basicObstacles = []

    this.createBasicObstacle = function () {
        var boxGeometry = new THREE.BoxGeometry(1, 1, 1);
        var boxMaterial = new THREE.MeshStandardMaterial({ color: 0xffa500 });
        var mesh = new THREE.Mesh(boxGeometry, boxMaterial);
        mesh.position.y = 1

        mesh.geometry.computeBoundingBox()

        var obj = new THREE.Object3D();
        obj.add(mesh);

        obj.castShadow = true

        return obj;
        // return mesh
    }

    this.addBasicObstacle = function (startAtFarPlane) {
        if (this.basicObstacles.length >= maxBasicObstacles) {
            // TODO: this seems to be printing out at some periodicity, why?
            console.log("hit max, size is: " + this.basicObstacles.length)
            return; // don't create more if we have already hit the max
        }

        var obstacle = this.createBasicObstacle();
        obstacle.visible = true;

        // place randomly across the floor
        // x = left and right
        // y = up and down
        // z = into and out of screen
        var x = (2 * Math.random() - 1) * (center); // arbitrary values for now
        var y = Math.random() * (center * 2); // go from [0, center * 2] (0.5? to not cut off blocks)
        var z = (Math.random() - 1) * 15;

        if (startAtFarPlane) { // if they should start far away from the player (generated)
            z = -30 // arbitrary, should be based on screen height?
        }

        obstacle.position.set(x, y, z)

        // add to scene (adding to floor reverses axes, better to keep it this way)
        this.scene.addMesh(obstacle)

        // push it to the general basicObstacles array
        this.basicObstacles.push(obstacle);
        return obstacle
    }

    // This removes objects that have gone out of view, and also checks if the
    // plane is in contact with the obstacles
    this.doObjectLogic = function () {
        var objToRemove = []
        var pos = new THREE.Vector3()

        // need to use reference in this function... javascript is not picking it up in inner funcs
        var basicObstaclesRef = this.basicObstacles

        basicObstaclesRef.forEach(function (element, index) {
            pos.setFromMatrixPosition(element.matrixWorld);

            // check if this has gone out of view zone
            // TODO: since the plane will be moving, this needs to be done for not only
            // the z planes, but also the x planes
            var outOfView = (pos.z > nearPlane)
            if (outOfView && element.visible) {
                objToRemove.push(element)
            } else {
                // check if collision occurred with character
                // var collided = (pos.distanceTo(this.plane.mesh.position) <= 0.6)
                var collided = checkIfCollidedCheap(this.plane.mesh, element)
                if (collided) {
                    hasCollided = true;
                }
            }
        })

        // remove all necessary objects
        objToRemove.forEach(function (element, index) {
            var indexInBasicObstacles = basicObstaclesRef.indexOf(element)
            basicObstaclesRef.splice(indexInBasicObstacles, 1); // remove it

            // remove from the scene as well (remove from ground, more aptly)
            // this.scene.removeMesh(element)
            this.scene.removeMesh(element)
        })
    }

    this.handleObstacleMovement = function () {
        for (var i = 0; i < this.basicObstacles.length; i++) {
            this.basicObstacles[i].position.z += movementSpeed
        }
    }
}
