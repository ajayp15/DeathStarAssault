/*
    scene.js: This file defines all of the functions
    necessary to make the scene
*/

function Scene() {
	this.sceneWidth = window.innerWidth - windowOffset;
	this.sceneHeight = window.innerHeight - windowOffset;

	this.scene = new THREE.Scene();

	// camera
	this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 20000 );//perspective camera

	// renderer
	this.renderer = new THREE.WebGLRenderer({alpha:true});
	this.renderer.shadowMap.enabled = true;
	this.renderer.setSize( this.sceneWidth, this.sceneHeight );

  this.addObj = function(obj, lookAt = false) {
    this.scene.add(obj);
    if (lookAt == true) {
      this.camera.lookAt(obj.position)
    }
	}

  this.removeObj = function(obj) {
    mesh.visible = false
    this.scene.remove(obj)
	}
}
