/*
    plane.js: This file defines all of the functions
    necessary to make the plane mesh, make it move, and
    animate it, etc.
*/

function Plane(scene, walls, ground) {
  this.mesh = createPlaneMesh()
  this.scene = scene
  this.walls = walls
  this.ground = ground
  this.shots = []
  this.HP = initialHP
  this.score = 0

  // explosion stuff
  this.dirs = undefined
  this.explosionParticles = undefined
  this.explosionIterations = 0 // how many times this explosion has been updated

  this.handlePlaneMovement = function (planeVelocityX, planeVelocityY, delta) {
    this.mesh.position.x += planeVelocityX * delta
    this.mesh.position.y += planeVelocityY * delta

    // clamp the motion, to prevent it from going too far out from the screen
    // for y coords, compute if the plane is about to go off the screen by projecting
    // its position to screen coordintes
    var screenCoords = this.mesh.position.clone().project(this.scene.camera)
    screenCoords.y = -(screenCoords.y * (this.scene.sceneHeight / 2)) + this.scene.sceneHeight / 2

    if (this.mesh.position.x + wallsLeeway >= this.walls.rightWallX
      || this.mesh.position.x - wallsLeeway <= this.walls.leftWallX) {
      this.mesh.position.x -= planeVelocityX * delta // undo the movement
    }
    if (screenCoords.y <= ceilingLeeway // indexed from 0 at ceiling
      || this.mesh.position.y - groundLeeway <= this.ground.groundTop) { // arbitrary values
      this.mesh.position.y -= planeVelocityY * delta
    }

    // handle x movement
    if (planeVelocityX < 0) {
      this.mesh.rotation.z += turnSpeed * delta;
      this.mesh.rotation.z = Math.min(this.mesh.rotation.z, Math.PI / 4);
    } else if (planeVelocityX > 0) {
      this.mesh.rotation.z -= turnSpeed * delta;
      this.mesh.rotation.z = Math.max(this.mesh.rotation.z, - Math.PI / 4);
    } else {
      this.mesh.rotation.z /= 1.3;
    }

    // handle y movement (flip the directions, seems to work this way, axis flipped)
    if (planeVelocityY > 0) {
      this.mesh.rotation.x += turnSpeed * delta;
      this.mesh.rotation.x = Math.min(this.mesh.rotation.x, Math.PI / 4);
    } else if (planeVelocityY < 0) {
      this.mesh.rotation.x -= turnSpeed * delta;
      this.mesh.rotation.x = Math.max(this.mesh.rotation.x, - Math.PI / 4);
    } else {
      this.mesh.rotation.x /= 1.3;
    }
  }

  this.shootLaser = function () {
    var maxLasers = 20
    if (this.shots.length >= maxLasers) return
    var laserGeometry = new THREE.CylinderGeometry(0.01, 0.01, 1, 4)
    var laserMaterial = new THREE.MeshLambertMaterial({
      color: 0x1bd127,
    })
    let laser = new THREE.Mesh(laserGeometry, laserMaterial);
    laser.rotation.x = Math.PI / 2

    var wpVector = this.mesh.position.clone()
    laser.position.copy(wpVector); // start position - the tip of the weapon
    this.scene.addMesh(laser);
    this.shots.push(laser);
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
    var myShape = new THREE.Box3().setFromObject(this.mesh)

    if (boundingShape.intersectsBox(myShape)) {
      return true
    }

    return false
  }

  // this gets called when this plane gets hit
  this.gotHit = function () {
    // TODO: as a small animation, shake the plane around a little (rotate it back and forth
    // and get dazed(?))
    var deduction = 100
    this.HP -= deduction
    HPText.innerHTML = "Ship Status: " + this.HP + "%"
    HPBar.value -= deduction
    // this.scene.ambient.intensity = 0.1 // playing around with dimming screen when you get hit
    // setTimeout(function(){this.scene.ambient.intensity = 0.5}, 500)
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
}

function promisifyLoader(loader, onProgress) {
  function promiseLoader(url) {
    return new Promise((resolve, reject) => {
      loader.load(url, resolve, onProgress, reject);
    });
  }

  return {
    originalLoader: loader,
    load: promiseLoader,
  };

}

// Finally, here is simplest possible example of using the promise loader
// Refer to www.blackthreaddesign.com/blog/promisifying-threejs-loaders/
// for more detailed examples
function load() {

  GLTFPromiseLoader.load('models/x-wing/scene.gltf')
    .then((loadedObject) => {

      // Note that the returned object differs between three.js loader - log
      // to console to see what is returned. In the GLTF case, this is how 
      // we add the loaded object to our scene
      scene.add(loadedObject.scene);

    })
    .catch((err) => { console.error(err) });

}

function createPlaneMesh() {
  var bodyGeometry = new THREE.BoxGeometry(0.4, 0.1, 0.5)
  var bodyMaterial = new THREE.MeshPhongMaterial({ color: 0xe5f2f2, side: THREE.DoubleSide })
  var body = new THREE.Mesh(bodyGeometry, bodyMaterial)

  body.geometry.computeBoundingBox()

  var plane = new THREE.Object3D()
  plane.add(body)

  plane.receiveShadow = false;
  plane.castShadow = true;

  plane.position.set(0, center, planeInitZ)

  return plane
  // var scale = 5
  // var radiusTop = 0.5 / scale
  // var radiusBottom = 1 / scale
  // var height = 3 / scale
  // var bodyGeometry = new THREE.CylinderBufferGeometry(radiusTop, radiusBottom, height, 5)
  // var bodyMaterial = new THREE.MeshLambertMaterial({color: 0xe5f2f2, side: THREE.DoubleSide})
  // var body = new THREE.Mesh(bodyGeometry, bodyMaterial)
  // body.rotation.x = -Math.PI / 2

  // var plane = new THREE.Object3D()
  // plane.add(body)

  // plane.receiveShadow = false;
  // plane.castShadow = true;

  // plane.position.set(0, center, planeInitZ)
  // return plane
}

async function createGLTFPlane() {
  var plane;
  const GLTFPromiseLoader = promisifyLoader(new THREE.GLTFLoader());
  await GLTFPromiseLoader.load('models/x-wing/scene.gltf')
    .then((loadedObject) => {
      var obj = new THREE.Object3D()
      obj.add(loadedObject.scene)
      plane = obj
      this.mesh = obj;
      this.mesh.position.set(0, center, planeInitZ)
      this.mesh.scale.x = 0.004
      this.mesh.scale.y = 0.004
      this.mesh.scale.z = 0.004
      this.scene.addMesh(this.mesh);
      loaded = true
    })
    .catch((err) => { console.error(err) });

  console.log("hi")
  console.log(plane)
  console.log(plane.resolve())
  return plane;
}


/*
function addPlane(){
	// arbitrary size
	var boxGeometry = new THREE.BoxGeometry(0.4, 0.1, 0.5)
	var boxMaterial = new THREE.MeshStandardMaterial({color: 0xe5f2f2}) // shading: THREE.FlatShading
	var body = new THREE.Mesh(boxGeometry, boxMaterial)

	plane = new THREE.Object3D()
	plane.add(body)

	// TODO: add wing meshes onto this object

	// TODO: look into why shadows are not being cast onto the main floor
	plane.receiveShadow = true;
	plane.castShadow = true;

	var texture = new THREE.TextureLoader().load( 'models/ju-87_obj/diff.jpg' );
	var material = new THREE.MeshPhongMaterial( { map: texture } );
	console.log(material);
	var loader = new THREE.OBJLoader();
  loader.load( 'models/ju-87_obj/ju-87.obj', function ( object ) {
		object.traverse( function ( node ) {
    	if ( node.isMesh ) node.material = boxMaterial;
	  } );
    object.rotation.z = Math.PI;
		object.rotation.y = 0 //Math.PI;
		object.scale.set(0.0015, 0.0015, 0.0015);
    scene.add( object );
		plane = object;
		plane.position.set(0, planeInitY, planeInitZ)
    //document.querySelector('h1').style.display = 'none';
  } );
}
*/
