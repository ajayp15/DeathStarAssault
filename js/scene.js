/*
    scene.js: This file defines all of the functions
    necessary to make the scene
*/

function Scene() {
	this.sceneWidth = window.innerWidth - windowOffset;
	this.sceneHeight = window.innerHeight - windowOffset;

	this.scene = new THREE.Scene(); // the 3d scene
	//this.scene.fog = new THREE.FogExp2( 0xffffff, 0.05);

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
	// this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
	this.renderer.setSize( this.sceneWidth, this.sceneHeight );

	// add the light in the scene
  /*var hemisphereLight = new THREE.HemisphereLight(0xfffafa,0x000000, .9)
	this.scene.add(hemisphereLight);

	var sun = new THREE.DirectionalLight( 0xcdc1c5, 0.9);
	sun.position.set( 3,6,-7 );
	sun.castShadow = true;
  sun.shadow.mapSize.width = 512;
	sun.shadow.mapSize.height = 512;

	sun.shadow.camera.near = 0.5;
	sun.shadow.camera.far = 500;
	this.sun = sun;

	this.scene.add(sun);*/

	var ambient = new THREE.AmbientLight( 0xffffff, 1 );
	this.scene.add( ambient );

	this.light = new THREE.DirectionalLight( 0xffffff, 1 );
	this.scene.add( this.light );

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

	this.handleCameraMovement = function(dx, dy, dz, planePos, delta) {
		// add some sort of small drift to the camera to reflect plane movement
		this.camera.position.x += dx * cameraDrift * delta
		this.camera.position.y += dy * cameraDrift * delta
		this.camera.position.z += dz * cameraDrift * delta

		/*this.camera.position.x = planeMesh.position.x;
		this.camera.position.y = planeMesh.position.y + 0.5;
		this.camera.rotation.x = planeMesh.rotation.x / 3.0;
		this.camera.rotation.z = planeMesh.rotation.z / 3.0;*/

		// clamp camera movement as well (based on if the plane is clamped)
		// if (Math.abs(planePos.x + dx) >= 1) {
		// 	this.camera.position.x -= dx * cameraDrift // undo the movement
		// }
		// if ((planePos.y + dy) >= 4 || (planePos.y + dy) <= 1.8) {
		// 	this.camera.position.y -= dy * cameraDrift
		// }
	}
}
