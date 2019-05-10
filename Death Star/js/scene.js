/*
    scene.js: This file defines all of the functions
    necessary to make the scene
*/

function Scene() {
	this.sceneWidth = window.innerWidth - windowOffset;
	this.sceneHeight = window.innerHeight - windowOffset;

	this.scene = new THREE.Scene();

	// camera
	this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 5000 );//perspective camera

	// renderer
	this.renderer = new THREE.WebGLRenderer({alpha:true});
	this.renderer.shadowMap.enabled = true;
	this.renderer.setSize( this.sceneWidth, this.sceneHeight );

	var ambient = new THREE.AmbientLight( 0xffffff, 1 );
	this.scene.add( ambient );

	var directional = new THREE.DirectionalLight( 0xffffff, 1 );
	this.scene.add( directional );

	this.lights = [ambient, directional]

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
}
