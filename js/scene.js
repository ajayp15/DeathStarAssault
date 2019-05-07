/*
    scene.js: This file defines all of the functions
    necessary to make the scene
*/

var windowOffset = 10

function Scene() {
	this.sceneWidth = window.innerWidth - windowOffset;
	this.sceneHeight = window.innerHeight - windowOffset;

	this.scene = new THREE.Scene(); // the 3d scene
	this.scene.fog = new THREE.FogExp2( 0xffffff, 0.05);

	this.camera = new THREE.PerspectiveCamera( 60, sceneWidth / sceneHeight, 0.1, 1000 );//perspective camera
  this.camera.position.z = 6.5;
  this.camera.position.y = 2.5;

	this.renderer = new THREE.WebGLRenderer({alpha:true}); // allow somewhat transparent items (alpha buffer)
	this.renderer.setClearColor(0xfffafa, 1);
	this.renderer.shadowMap.enabled = true; //enable shadow
	this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
	this.renderer.setSize( sceneWidth, sceneHeight );

  var hemisphereLight = new THREE.HemisphereLight(0xfffafa,0x000000, .9)
	this.scene.add(hemisphereLight);

	var sun = new THREE.DirectionalLight( 0xcdc1c5, 0.9);
	sun.position.set( 12,6,-7 );
	sun.castShadow = true;
  sun.shadow.mapSize.width = 256;
	sun.shadow.mapSize.height = 256;
	sun.shadow.camera.near = 0.5;
	sun.shadow.camera.far = 50 ;
	this.scene.add(sun);

  this.addMesh = function(mesh, lookAt = false) {
    this.scene.add(mesh);
    if (lookAt == true) {
      this.camera.lookAt(mesh.position)
    }
  }
  this.removeMesh = function(mesh) {
    mesh.visible = false
    scene.remove(mesh)
  }
}
