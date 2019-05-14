/*
    scene.js: This file defines all of the functions
    necessary to make the scene
*/

function SceneDS() {
	this.sceneWidth = window.innerWidth - windowOffset;
	this.sceneHeight = window.innerHeight - windowOffset;

	this.scene = new THREE.Scene();

	// camera
	this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.5, 20000 );//perspective camera

	// renderer
	this.renderer = new THREE.WebGLRenderer({alpha:true});
	this.renderer.shadowMap.enabled = false;

	this.renderer.setSize( this.sceneWidth, this.sceneHeight );
	this.renderer.localClippingEnabled = true;

  this.addObj = function(obj, lookAt = false) {
    this.scene.add(obj);
    if (lookAt == true) {
      this.camera.lookAt(obj.position)
    }
	}

  this.removeObj = function(obj) {
    obj.visible = false
    this.scene.remove(obj)
		dispose3(obj)
	}
}
