/*
    collisions.js: Helper functions for detecting and
    handling collisions
*/

// this function assumes object == THREE.object3d, and mesh == THREE.mesh
function checkIfCollided(object, mesh) {
    for (var i = 0; i < object.children.length; i++) {
        var child = object.children[i];
        for (var j = 0; j < child.geometry.vertices.length; j++) {
            var localVertex = child.geometry.vertices[j].clone();
            var globalVertex = localVertex.applyMatrix4(child.matrix);
            var directionVector = globalVertex.sub(child.position);
            var originPoint = child.position.clone()

            var ray = new THREE.Raycaster(originPoint, directionVector.clone().normalize());
            var collisionResults = ray.intersectObjects(mesh);
            if (collisionResults.length > 0 && collisionResults[0].distance < directionVector.length()) {
                console.log("Hit")
                return true
            }
        }
    }

    return false
}

// this just checks if any of the bounding boxes of either object intersect with each other
// assumes the latter is also an object here actually
function checkIfCollidedCheap(object1, object2, object1Type, object2Type) {
    var bounding1;
    var bounding2;

    if (object1Type == "box") {
        bounding1 = new THREE.Box3().setFromObject(object1)
    } else if (object1Type == "sphere") {
        bounding1 = new THREE.Sphere(object1.position, obstaclesRadius)
    }

    if (object2Type == "box") {
        bounding2 = new THREE.Box3().setFromObject(object2)
    } else if (object2Type == "sphere") {
        bounding2 = new THREE.Sphere(object2.position, obstaclesRadius)
    }

    if (object1Type == "box" && object2Type == "sphere") {
        return bounding1.intersectsSphere(bounding2)
    } else if (object1Type == "box" && object2Type == "box") {
        return bounding1.intersectsBox(bounding2)
    } else {
        return false // default case
    }


    // for (var i = 0; i < object1.children.length; i++) {
    //     // var box1 = object1.children[i]
    //     // var bounding1 = box1.geometry.boundingBox.clone();
    //     // bounding1.applyMatrix4(box1.matrixWorld);
    //     var bounding1 = new THREE.Box3().setFromObject(object1) // --> this takes rotations of mesh into account (maybe tighter box)
    //     for (var j = 0; j < object2.children.length; j++) {
    //         var box2 = object2.children[j]
    //         var bounding2 = box2.geometry.boundingBox.clone();
    //         bounding2.applyMatrix4(box2.matrixWorld);

    //         if (bounding1.intersectsBox(bounding2)) {
    //             return true;
    //         }
    //     }
    // }

    // debugger
    return false
}