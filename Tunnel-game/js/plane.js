/*
    plane.js: This file defines all of the functions
    necessary to make the plane mesh, make it move, and
    animate it, etc.
*/

var upAngle = Math.PI / 6
var downAngle = -Math.PI / 6
var rightAngle = Math.PI / 6
var leftAngle = -Math.PI / 6
var maxLasers = 3 // 4 * 2

function Plane(scene, walls, ground, explosions) {
  this.mesh = createPlaneMesh()
  this.scene = scene
  this.walls = walls
  this.ground = ground
  this.explosions = explosions
  this.shots = []
  this.HP = initialHP
  this.score = 0
  this.loaded = false
  this.boundingBox = undefined
  this.flipZ = false
  this.target = undefined

  // explosion stuff
  this.dirs = undefined
  this.explosionParticles = undefined
  this.explosionIterations = 0 // how many times this explosion has been updated

  this.handlePlaneMovement = function (planeVelocityX, planeVelocityY, delta) {
    var changeInX = planeVelocityX * delta
    var changeInY = planeVelocityY * delta
    this.mesh.position.x += changeInX
    this.mesh.position.y += changeInY

    // clamp the motion, to prevent it from going too far out from the screen
    // for y coords, compute if the plane is about to go off the screen by projecting
    // its position to screen coordintes
    var screenCoords = this.mesh.position.clone().project(this.scene.camera)
    screenCoords.y = -(screenCoords.y * (this.scene.sceneHeight / 2)) + this.scene.sceneHeight / 2

    if (this.mesh.position.x + wallsLeeway >= this.walls.rightWallX
      || this.mesh.position.x - wallsLeeway <= this.walls.leftWallX) {
      this.mesh.position.x -= changeInX // undo the movement
      changeInX = 0
    }
    if (screenCoords.y <= ceilingLeeway // indexed from 0 at ceiling
      || screenCoords.y >= (this.scene.sceneHeight)) { // arbitrary values
      this.mesh.position.y -= changeInY
      changeInY = 0
    }

    // move the target the same way
    if (this.target != undefined) {
      this.target.position.x += changeInX
      this.target.position.y += changeInY

      // also clamp it to the back wall
      this.target.position.z = this.walls.backWall.position.z + 2.51
    }

    // handle x movement
    if (this.flipZ)  {
      if (planeVelocityX > 0) {
        this.mesh.rotation.z += turnSpeed * delta;
        this.mesh.rotation.z = Math.min(this.mesh.rotation.z, rightAngle);
      } else if (planeVelocityX < 0) {
        this.mesh.rotation.z -= turnSpeed * delta;
        this.mesh.rotation.z = Math.max(this.mesh.rotation.z, leftAngle);
      } else {
        this.mesh.rotation.z /= 1.3;
      }
    } else {
      if (planeVelocityX < 0) {
        this.mesh.rotation.z += turnSpeed * delta;
        this.mesh.rotation.z = Math.min(this.mesh.rotation.z, rightAngle);
      } else if (planeVelocityX > 0) {
        this.mesh.rotation.z -= turnSpeed * delta;
        this.mesh.rotation.z = Math.max(this.mesh.rotation.z, leftAngle);
      } else {
        this.mesh.rotation.z /= 1.3;
      }
    }

    // handle y movement (flip the directions, seems to work this way, axis flipped)
    if (planeVelocityY > 0) {
      this.mesh.rotation.x += turnSpeed * delta;
      this.mesh.rotation.x = Math.min(this.mesh.rotation.x, upAngle);
    } else if (planeVelocityY < 0) {
      this.mesh.rotation.x -= turnSpeed * delta;
      this.mesh.rotation.x = Math.max(this.mesh.rotation.x, downAngle);
    } else {
      this.mesh.rotation.x /= 1.3;
    }
  }

  this.shootLaser = function () {
    if (this.shots.length >= maxLasers) return
    // for (var i = 0; i < 4; i++) {
    //   var laser = new THREE.Mesh(laserGeometry, shipLaserMaterial);
    //   laser.rotation.x = Math.PI / 2

    //   var wpVector = this.mesh.position.clone()
    //   var shiftVertical = 0.05
    //   if (i == 0) {
    //     wpVector.x -= shipScale * shipScale
    //     wpVector.y -= shipScale * shiftVertical
    //   } else if (i == 1) {
    //     wpVector.x -= shipScale * shipScale
    //     wpVector.y += shipScale * shiftVertical
    //   } else if (i == 2) {
    //     wpVector.x += shipScale * shipScale
    //     wpVector.y += shipScale * shiftVertical
    //   } else if (i == 3) {
    //     wpVector.x += shipScale * shipScale
    //     wpVector.y -= shipScale * shiftVertical
    //   }
    //   laser.position.copy(wpVector); // start position - the tip of the weapon
    //   this.scene.addMesh(laser);
    //   this.shots.push(laser);
    // }
    var laser = new THREE.Mesh(laserGeometry, shipLaserMaterial);
    laser.rotation.x = Math.PI / 2
    laser.position.copy(this.mesh.position.clone())
    laser.position.z -= 0.1 // shift it forward a little bit
    this.scene.addMesh(laser)
    this.shots.push(laser)
  }

  this.handleLaserMovements = function (delta) {
    var shotsToKeep = []
    var laserSpeed = 10
    for (var i = 0; i < this.shots.length; i++) {
      this.shots[i].translateY(-laserSpeed * delta) // y because rotated around x

      // check if it has gone out of scene, remove it then
      if (this.shots[i].position.z < farPlane / 8) {  // arbitrary distance to stop them at
        this.scene.removeMesh(this.shots[i])
      } else {
        shotsToKeep.push(this.shots[i])
      }
    }

    this.shots = shotsToKeep
  }

  this.updatePlayerScore = function () {
    this.score += 1
    scoreText.innerHTML = "TIE Destroyed: " + this.score.toString() + "/" + phase1RequiredScore;
  }

  this.checkIfCollided = function (shape) {
    var boundingShape = new THREE.Box3().setFromObject(shape)
    var myShape = new THREE.Box3().setFromObject(this.boundingBox)

    if (boundingShape.intersectsBox(myShape)) {
      return true
    }

    return false
  }

  this.explode = function () {
    var objectSize = 0.03
    var numParticles = 1000

    this.explosions.addExplosion(this.mesh.position, objectSize, numParticles)
  }

  // this gets called when this plane gets hit
  this.gotHit = function (locationOfHit, gotHitBy = "TIE") {
    var deduction = 10
    if (gotHitBy == "TIE") {
      deduction = 15
    } else if (gotHitBy == "laser") {
      deduction = 5
    }
    this.HP -= deduction
    HPText.innerHTML = "Ship Status: " + this.HP + "%"
    HPBar.value -= deduction
    // this.scene.ambient.intensity = 0.1 // playing around with dimming screen when you get hit
    // setTimeout(function(){this.scene.ambient.intensity = 0.5}, 500)

    // call explosion, with very small number of explosion particles and different color,
    // to signify that plane was hit (maybe white)
    // define location of explosion as average between plane location and hitting object
    var location = new THREE.Vector3().addVectors(locationOfHit, this.mesh.position).multiplyScalar(1/2)
    var color = 0xffffff // white
    var numParticles = 30 // small explosion
    var objectSize = 0.02
    this.explosions.addExplosion(location, objectSize, numParticles, color)
  }

  // run when the plane is destroyed @ game over
  this.blowUp = function () {
    this.explode()
    this.mesh.visible = false
  }

  // reset for new game run
  this.reset = function() {
    // reset variables
    this.mesh.visible = true
    this.HP = initialHP
    this.score = 0

    // cancel pending explosion
    if (this.explosionParticles != undefined) {
      this.scene.removeMesh(this.explosionParticles);
      this.explosionParticles = undefined;
      this.dirs = undefined
      this.explosionIterations = 0
    }

    // remove the laser shots pending
    for (var i = 0; i < this.shots.length; i++) {
      this.scene.removeMesh(this.shots[i])
    }

    this.shots = []
  }


  this.addPlaneAim = function() {
    var largeCircleGeometry = new THREE.CircleGeometry(aimRadius, 20)
    var greenMaterial = new THREE.MeshLambertMaterial({ color: 0x245923, side: THREE.DoubleSide});
    var mainCircle = new THREE.Mesh(largeCircleGeometry, greenMaterial)
    mainCircle.wireframe = true

    var largeRingGeometry = new THREE.RingGeometry(aimRadius / 1.5, aimRadius / 1.5 - 0.05, 10, 1)
    var whiteMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff , side: THREE.DoubleSide});
    var outerAim = new THREE.Mesh(largeRingGeometry, whiteMaterial)

    var smallRingGeometry = new THREE.RingGeometry(aimRadius / 4, aimRadius / 4 - 0.05, 10, 1)
    var whiteMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff , side: THREE.DoubleSide});
    var innerAim = new THREE.Mesh(smallRingGeometry, whiteMaterial)

    var target = new THREE.Object3D()
    target.add(mainCircle)
    target.add(outerAim)
    target.add(innerAim)

    // add a small point light to it, to see it better
    var light = new THREE.PointLight(0xffffff, 1, 15)
    target.add(light)

    // project it to the position of the back wall
    target.position = this.mesh.position.clone()
    target.position.y = center // this seems to be necessary?
    target.position.z = this.walls.backWall.position.z + 2.51 // adjust for thickness of wall

    this.scene.addMesh(target)
    this.target = target
  }

  this.protonDirs = [] // two direction vectors for the two torpedos to be moving in
  this.protonTorpedos = []
  this.shootProtonTorpedos= function() {
    // shoot them at the position of the target right now
    var pos = this.target.position.clone()

    var leftPos = new THREE.Vector3(this.scene.camera.position.x - 1.5, this.scene.camera.position.y, this.scene.camera.position.z)
    var rightPos = new THREE.Vector3(this.scene.camera.position.x + 1.5, this.scene.camera.position.y, this.scene.camera.position.z)
    var dir1 = new THREE.Vector3().subVectors(pos, leftPos).normalize()
    var dir2 = new THREE.Vector3().subVectors(pos, rightPos).normalize()

    this.protonDirs.push(dir1)
    this.protonDirs.push(dir2)

    // now create the proton torpedos
    var torpedoGeo = new THREE.SphereGeometry(torpedoRadius, 5, 5)
    var torpedoMaterial = new THREE.MeshLambertMaterial({
      color: 0xf23763,
      transparent:true,
      opacity: 0.7
    })
    var torpedo1 = new THREE.Mesh(torpedoGeo, torpedoMaterial)
    var torpedo2 = new THREE.Mesh(torpedoGeo, torpedoMaterial)

    this.protonTorpedos.push(torpedo1)
    this.protonTorpedos.push(torpedo2)

    torpedo1.position.copy(leftPos)
    torpedo2.position.copy(rightPos)

    // also add a small point light within them
    var light1 = new THREE.PointLight(0xffffff, 0.5, 10)
    var light2 = new THREE.PointLight(0xffffff, 0.5, 10)
    torpedo1.add(light1)
    torpedo2.add(light2)

    this.scene.addMesh(torpedo1)
    this.scene.addMesh(torpedo2)
  }

  this.updateProtonTorpedoLocations = function(delta) {
    for (var i = 0; i < this.protonTorpedos.length; i++) {
      var offset = this.protonDirs[i].clone().multiplyScalar(delta * 10)
      this.protonTorpedos[i].position.add(offset)
    }
    var padding = 2
    // check if they have passed the back wall yet --> failed task if this is true
    if (this.protonTorpedos != undefined && this.protonTorpedos.length > 0 &&
      !destroyedDeathStar &&
      this.protonTorpedos[0].position.z <= this.walls.backWall.position.z - padding) {
      gameOver = true
      this.HP = 0
    }

    // check also while here if the plane has passed the back wall
    padding = 5
    if (!destroyedDeathStar && this.scene.camera.position.z - padding < this.walls.backWall.position.z) {
      gameOver = true
      this.HP = 0
    }
  }

  this.removeAim = function() {
    this.scene.removeMesh(this.target)

    // also remove proton torpedos, if they exist
    for (var i = 0; i < this.protonTorpedos.length; i++) {
      this.scene.removeMesh(this.protonTorpedos[i])
    }
  }
}

function createPlaneMesh() {
  if (!loadModel) {
    var bodyGeometry = new THREE.BoxGeometry(0.4, 0.1, 0.5)
    var bodyMaterial = new THREE.MeshPhongMaterial({ color: 0xe5f2f2, side: THREE.DoubleSide })
    var body = new THREE.Mesh(bodyGeometry, bodyMaterial)

    body.geometry.computeBoundingBox()

    var plane = new THREE.Object3D()
    plane.add(body)

    plane.receiveShadow = false;
    plane.castShadow = true;

    plane.position.set(0, center, planeInitZ)

    this.scene.addMesh(plane)

    return plane
  } else {
    loadPlaneFromObj()
  }
}

function loadPlaneFromObj() {
  var loader = new THREE.GLTFLoader();

  // Load a glTF resource
  loader.load(
    '/common/models/star_wars_x-wing/scene.gltf',
    function ( gltf ) {
      var obj = new THREE.Object3D()
      obj.add(gltf.scene)
      plane.mesh = obj;
      plane.mesh.scale.x = shipScale
      plane.mesh.scale.y = shipScale
      plane.mesh.scale.z = shipScale
      plane.mesh.visible = true

      plane.boundingBox = new THREE.Mesh(
        new THREE.BoxGeometry(1, 0.2, 1),
        bbMat
      );
      plane.boundingBox.visible = displayBoundingBoxes

      plane.mesh.add( plane.boundingBox )
      plane.mesh.position.y = center
      plane.mesh.position.z = planeInitZ

      plane.mesh.rotation.y = Math.PI
      plane.flipZ = true

      var light = new THREE.PointLight(0xffffff,1, 1)
      light.position.z = 1
      // plane.mesh.add(light)

      scene.addMesh(plane.mesh);
      plane.loaded = true;
    },
    function ( xhr ) {
      console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
    },
    function ( error ) {
      console.log(error);
      console.log( 'An error happened' );
    }
  );
}
