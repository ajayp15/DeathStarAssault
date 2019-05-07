'use strict'

function Scene() {
  this.createScene = function() {
    var windowOffset = 10

  	this.sceneWidth = window.innerWidth - windowOffset;
  	this.sceneHeight = window.innerHeight - windowOffset;

  	this.scene = new THREE.Scene(); // the 3d scene
  	this.scene.fog = new THREE.FogExp2( 0xffffff, 0.05);

  	this.camera = new THREE.PerspectiveCamera( 60, sceneWidth / sceneHeight, 0.1, 1000 );//perspective camera

  	this.renderer = new THREE.WebGLRenderer({alpha:true}); // allow somewhat transparent items (alpha buffer)
  	this.renderer.setClearColor(0xfffafa, 1);
  	this.renderer.shadowMap.enabled = true; //enable shadow
  	this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  	this.renderer.setSize( sceneWidth, sceneHeight );

  	this.camera.position.z = 6.5;
  	this.camera.position.y = 2.5;
  }
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
