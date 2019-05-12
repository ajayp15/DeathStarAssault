/*
    plane.js: This file defines all of the functions
    necessary to make the plane mesh, make it move, and
    animate it, etc.
*/

var upAngle = Math.PI / 6
var downAngle = -Math.PI / 6
var rightAngle = Math.PI / 6
var leftAngle = -Math.PI / 6
var maxLasers = 20

function Plane(scene, walls, ground) {
  this.mesh = createPlaneMesh()
  this.scene = scene
  this.walls = walls
  this.ground = ground
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
      this.mesh.position.x -= planeVelocityX * delta // undo the movement
      changeInX = 0
    }
    if (screenCoords.y <= ceilingLeeway // indexed from 0 at ceiling
      || this.mesh.position.y - groundLeeway <= this.ground.groundTop) { // arbitrary values
      this.mesh.position.y -= planeVelocityY * delta
      changeInY = 0
    }

    // move the target the same way
    if (this.target != undefined) {
      this.target.position.x += changeInX
      this.target.position.y += changeInY
      
      // also clamp it to the back wall
      this.target.position.z = this.walls.backWall.position.z + 5.05
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
    for (var i = 0; i < 4; i++) {
      var laser = new THREE.Mesh(laserGeometry, shipLaserMaterial);
      laser.rotation.x = Math.PI / 2

      var wpVector = this.mesh.position.clone()
      var shiftVertical = 0.05
      if (i == 0) {
        wpVector.x -= shipScale * shipScale
        wpVector.y -= shipScale * shiftVertical
      } else if (i == 1) {
        wpVector.x -= shipScale * shipScale
        wpVector.y += shipScale * shiftVertical
      } else if (i == 2) {
        wpVector.x += shipScale * shipScale
        wpVector.y += shipScale * shiftVertical
      } else if (i == 3) {
        wpVector.x += shipScale * shipScale
        wpVector.y -= shipScale * shiftVertical
      }
      laser.position.copy(wpVector); // start position - the tip of the weapon
      this.scene.addMesh(laser);
      this.shots.push(laser);
    }
  }

  this.handleLaserMovements = function (delta) {
    var shotsToKeep = []
    for (var i = 0; i < this.shots.length; i++) {
      this.shots[i].translateY(-5 * delta) // y because rotated around x

      // check if it has gone out of scene, remove it then
      if (this.shots[i].position.z < farPlane / 16) {  // arbitrary distance to stop them at
        this.scene.removeMesh(this.shots[i])
      } else {
        shotsToKeep.push(this.shots[i])
      }
    }

    this.shots = shotsToKeep
  }

  this.updatePlayerScore = function () {
    this.score += 1
    scoreText.innerHTML = "TIEs Destroyed: " + this.score.toString();
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
    var geometry = new THREE.Geometry();
    var objectSize = 0.03
    var movementSpeed = 5
    this.dirs = []
    var numParticles = 1000
    for (i = 0; i < numParticles; i++) {
      var vertex = this.mesh.position.clone()

      geometry.vertices.push(vertex);
      this.dirs.push({ x: (Math.random() * movementSpeed) - (movementSpeed / 2), y: (Math.random() * movementSpeed) - (movementSpeed / 2), z: (Math.random() * movementSpeed) - (movementSpeed / 2) });
    }
    // could also do random-ish colors here
    var material = new THREE.PointsMaterial({ size: objectSize, color: 0xf4bc42 });
    var particles = new THREE.Points(geometry, material);

    this.explosionParticles = particles
    this.explosionParticles.geometry.verticesNeedUpdate = true;

    this.scene.addMesh(particles);
  }

  this.updateExplosion = function (delta) {
    var numParticles = 1000
    if (this.explosionParticles != undefined) {
      for (var i = 0; i < numParticles; i++) {
        var particle = this.explosionParticles.geometry.vertices[i]
        particle.y += this.dirs[i].y * delta;
        particle.x += this.dirs[i].x * delta;
        particle.z += this.dirs[i].z * delta;
        this.explosionParticles.geometry.vertices[i] = particle
      }
      this.explosionParticles.geometry.verticesNeedUpdate = true;
      this.explosionIterations += 1
    }
    // stop it after some arbitrary time, don't want to render those particles
    // forever
    var seconds = 5
    if (this.explosionParticles != undefined &&
      this.explosionIterations >= 60 * seconds) { // assume called every 1/60th second
      this.scene.removeMesh(this.explosionParticles);
      this.explosionParticles = undefined;
      this.dirs = undefined
      this.explosionIterations = 0
    }
  }

  // this gets called when this plane gets hit
  this.gotHit = function () {
    // TODO: as a small animation, shake the plane around a little (rotate it back and forth
    // and get dazed(?))
    var deduction = 10
    this.HP -= deduction
    HPText.innerHTML = "Ship Status: " + this.HP + "%"
    HPBar.value -= deduction
    // this.scene.ambient.intensity = 0.1 // playing around with dimming screen when you get hit
    // setTimeout(function(){this.scene.ambient.intensity = 0.5}, 500)

    // call explosion, with very small number of explosion particles and different color,
    // to signify that plane was hit (maybe white)
  }

  // run when the plane is destroyed @ game over
  this.blowUp = function () {
    this.explode()
    // this.scene.removeMesh(this.mesh)
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
    var greenMaterial = new THREE.MeshLambertMaterial({ color: 0x245923 , side: THREE.DoubleSide, opacity: 0.7});
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

    // project it to the position of the back wall
    target.position = this.mesh.position.clone()
    target.position.y = center // this seems to be necessary?
    target.position.z = this.walls.backWall.position.z + 5.05 // adjust for thickness of wall

    this.scene.addMesh(target)
    this.target = target
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
    'models/star_wars_x-wing/scene.gltf',
    function ( gltf ) {
      var obj = new THREE.Object3D()
      obj.add(gltf.scene)
      plane.mesh = obj;
      plane.mesh.scale.x = shipScale
      plane.mesh.scale.y = shipScale
      plane.mesh.scale.z = shipScale
      plane.mesh.visible = true

      plane.boundingBox = new THREE.Mesh(
        new THREE.BoxGeometry(0.7, 0.3, 1),
        bbMat
      );
      plane.boundingBox.visible = displayBoundingBoxes

      plane.mesh.add( plane.boundingBox )
      plane.mesh.position.y = center
      plane.mesh.position.z = planeInitZ

      plane.mesh.rotation.y = Math.PI
      plane.flipZ = true

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