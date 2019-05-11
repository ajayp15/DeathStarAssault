/*
    scene.js: This file defines all of the functions
    necessary to make the scene
*/

function Scene() {
	this.sceneWidth = window.innerWidth - windowOffset;
	this.sceneHeight = window.innerHeight - windowOffset;

	this.scene = new THREE.Scene(); // the 3d scene
	this.scene.fog = new THREE.FogExp2( 0x000000, 0.03);

	// create camera
	this.camera = new THREE.PerspectiveCamera( 55, window.innerWidth / window.innerHeight, 0.1, 20000 );//perspective camera
  // this.camera.position.z = 6.5;
	// this.camera.position.y = 2.5;
	this.camera.position.z = 6.5;
	this.camera.position.y = center

	// create renderer
	this.renderer = new THREE.WebGLRenderer({alpha:true}); // allow somewhat transparent items (alpha buffer)
	this.renderer.setClearColor(0xfffafa, 1);
	this.renderer.shadowMap.enabled = true; //enable shadow
	this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
	this.renderer.setSize( this.sceneWidth, this.sceneHeight );

	// add the light in the scene
  var hemisphereLight = new THREE.HemisphereLight(0xfffafa,0x000000, .9)
	this.scene.add(hemisphereLight);

	// var sun = new THREE.DirectionalLight( 0xcdc1c5, 0.9);
	// sun.position.set(0, 4, 1);
	// sun.castShadow = true;
	// this.scene.add(sun)

  // sun.shadow.mapSize.width = 2048;
	// sun.shadow.mapSize.height = 1024;

	// sun.shadow.camera.near = 0;
	// sun.shadow.camera.far = 1000;
	// this.sun = sun;

	// this.scene.add(sun);
	// var SHADOW_MAP_WIDTH = 2048, SHADOW_MAP_HEIGHT = 1024;
	this.ambient = new THREE.AmbientLight( 0xffffff, 0.5 );
	this.scene.add( this.ambient );

	var spotLight = new THREE.SpotLight( 0xffffff, 0.7, 10, Math.PI / 2 );
	spotLight.position.set( 0, 0, nearPlane );
	// this.scene.add(spotLight)
	// spotLight.target.position.set( 0, center, planeInitZ);
	// spotLight.castShadow = true;

	// spotLight.shadow = new THREE.LightShadow(  new THREE.PerspectiveCamera( 50, 1, 1200, 2500 ));
	// // spotLight.shadow.bias = 0.0001;
	// spotLight.shadow.mapSize.width = SHADOW_MAP_WIDTH;
	// spotLight.shadow.mapSize.height = SHADOW_MAP_HEIGHT;
	// spotLight.shadow.camera.near = 0.5
	// spotLight.shadow.camera.far = 500

	// this.scene.add(spotLight)

  this.addMesh = function(mesh, lookAt = false) {
    this.scene.add(mesh);
    if (lookAt == true) {
      this.camera.lookAt(mesh.position)
    }
	}

  this.removeMesh = function(mesh) {
    mesh.visible = false
    this.scene.remove(mesh)
	}

	this.handleCameraMovement = function(dx, dy, dz, plane, delta, walls, ground) {
		// add some sort of small drift to the camera to reflect plane movement
		this.camera.position.x += dx * cameraDrift * delta
		this.camera.position.y += dy * cameraDrift * delta
		this.camera.position.z += dz * cameraDrift * delta

		// clamp the motion, compute the new plane's coords first
		var planePos = plane.mesh.position
		var newPlanePos = new THREE.Vector3(planePos.x + dx * delta, planePos.y + dy * delta, planePos.z)
		var newPlaneX = newPlanePos.x
		var newPlaneY = newPlanePos.y

		var screenCoords = newPlanePos.project(this.camera)
		screenCoords.y = -(screenCoords.y * (this.sceneHeight / 2)) + this.sceneHeight/2

		// clamp the motion, to prevent it from going too far out from the screen
		if (newPlaneX + wallsLeeway >= walls.rightWallX 
				|| newPlaneX - wallsLeeway <= walls.leftWallX) {
			this.camera.position.x -= dx * cameraDrift * delta // undo the movement
		}
		if (screenCoords.y <= ceilingLeeway
			|| newPlaneY - groundLeeway <= ground.groundTop) { // arbitrary values
			this.camera.position.y -= dy * cameraDrift * delta
		}
	}
}
