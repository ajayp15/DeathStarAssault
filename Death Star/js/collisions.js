/*
    collisions.js: Helper functions for detecting and
    handling collisions
*/

function checkSceneForCollisions(ship, deathstar) {

  if (ship.mesh.position.y == 0) { return }

  for (var i = 0; i < deathstar.turrets.length; ++i) {
    var turret = deathstar.turrets[i]
    var collidedWithTurret = checkIfCollidedCheap(turret.boundingBox, ship.boundingBox)
    if (collidedWithTurret) {
      ship.handleShipCollidedWithTurret(turret)
    }
    for (var j = 0; j < turret.lasers.length; ++j) {
      var laser = turret.lasers[j];
      if (laser.alive == false) {
        continue
      }
      var collidedWithShip = checkIfCollidedCheap(laser.mesh, ship.boundingBox)
      if (collidedWithShip) {
        ship.handleShipHitByLaser(laser)
      }
    }
    for (var j = 0; j < deathstar.orphanedLasers.length; ++j) {
      var laser = deathstar.orphanedLasers[j];
      if (laser.alive == false) {
        continue
      }
      var collidedWithShip = checkIfCollidedCheap(laser.mesh, ship.boundingBox)
      if (collidedWithShip) {
        ship.handleShipHitByLaser(laser)
      }
    }
  }

  for (var i = 0; i < deathstar.smallStructures.length; ++i) {
    var struct = deathstar.smallStructures[i]
    var collidedWithStructure = checkIfCollidedCheap(struct.outerStruct, ship.boundingBox)
    if (struct.innerStruct != undefined) {
      collidedWithStructure = collidedWithStructure || checkIfCollidedCheap(struct.innerStruct, ship.boundingBox)
    }
    if (collidedWithStructure) {
      ship.handleShipCollidedWithStructure(struct)
    }
  }
  for (var i = 0; i < ship.lasers.length; ++i) {
    var laser = ship.lasers[i]
    if (laser.alive == false) { continue }
    for (var j = 0; j < deathstar.turrets.length; ++j) {
      var turret = deathstar.turrets[j]
      var collidedWithTurret = checkIfCollidedCheap(turret.boundingBox, laser.mesh)
      if (collidedWithTurret) {
        turret.handleTurretHitByLaser(laser)
      }
    }
  }
}

// this just checks if any of the bounding boxes of either object intersect with each other
// assumes the latter is also an object here actually
function checkIfCollidedCheap(object1, object2, object1Type = "box", object2Type = "box") {
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
}
