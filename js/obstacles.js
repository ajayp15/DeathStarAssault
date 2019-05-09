/*
    obstacles.js: This file handles all of the obstacles
    in the scene.
*/

function Obstacles(scene, ground, plane) {
    this.scene = scene
    this.plane = plane
    this.ground = ground
    this.basicObstacles = []

    this.createBasicObstacle = function (box = false) {
        var mesh;
        if (obstaclesType == "box") {
            var boxGeometry = new THREE.BoxGeometry(1, 1, 1);
            var boxMaterial = new THREE.MeshStandardMaterial({ color: 0xffa500 });
            mesh = new THREE.Mesh(boxGeometry, boxMaterial);
            mesh.position.y = 1

            mesh.geometry.computeBoundingBox()
        } else if (obstaclesType == "sphere") {
            // consider making this octahedron later -- just need to figure out the
            // collisions with that
            var sphereGeometry = new THREE.SphereGeometry(obstaclesRadius, 32, 32)
            var material = new THREE.MeshStandardMaterial({color: 0xffa500})
            mesh = new THREE.Mesh(sphereGeometry, material);
            
            mesh.geometry.computeBoundingSphere()
        }

        var obj = new THREE.Object3D();
        obj.add(mesh);

        obj.castShadow = true

        return obj;
        // return mesh
    }

    this.addBasicObstacle = function (startAtFarPlane) {
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
        // ADDITION: generate near the plane, so use plane's position as "center" of world (in x and y)
        // and also generate blocks sufficiently away from plane that moving plane will still
        // be difficult into "blank" areas of screen
        // var x = (2 * Math.random() - 1) * (center); // arbitrary values for now
        // var y = Math.random() * (center * 2); // go from [0, center * 2] (0.5? to not cut off blocks)
        // var z = (Math.random() - 1) * 15;
        var planePos = this.plane.mesh.position
        var x = planePos.x + (2 * Math.random() - 1) * xFar
        var y = planePos.y + (2 * Math.random() - 1) * yFar
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

            var planePos = this.plane.mesh.position
            var x = planePos.x + (2 * Math.random() - 1) * xFar
            var y = planePos.y + (2 * Math.random() - 1) * yFar

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
        var objToRemove = []
        var pos = new THREE.Vector3()

        // need to use reference in this function... javascript is not picking it up in inner funcs
        var basicObstaclesRef = this.basicObstacles

        basicObstaclesRef.forEach(function (element, index) {
            pos.setFromMatrixPosition(element.matrixWorld);

            // check if this has gone out of view zone
            // TODO: since the plane will be moving, this needs to be done for not only
            // the z planes, but also the x planes
            var outOfViewZ = (pos.z > nearPlane)

            // consider something out of view in the x and y planes if it has moved
            // sufficiently out of view that moving it out and back into view won't
            // easily despawn it, making game too easy (add some leeway for keeping things)
            // in memory
            var planePos = this.plane.mesh.position
            var outOfViewX = Math.abs(planePos.x - pos.x) >= xFar
            var outOfViewY = Math.abs(planePos.y - pos.y) >= yFar

            var outOfView = outOfViewZ || outOfViewX || outOfViewY
            if (outOfView && element.visible) {
                objToRemove.push(element)
            } else {
                // check if collision occurred with character
                // var collided = (pos.distanceTo(this.plane.mesh.position) <= 0.6)
                var collided = checkIfCollidedCheap(this.plane.mesh, element, "box", obstaclesType)
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

    this.handleObstacleMovement = function (delta) {
        for (var i = 0; i < this.basicObstacles.length; i++) {
            this.basicObstacles[i].position.z += movementSpeed * delta
        }
    }
}
