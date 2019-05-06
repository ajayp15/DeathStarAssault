/*
    plane.js: This file defines all of the functions 
    necessary to make the plane mesh, make it move, and
    animate it, etc.
*/
function Plane() {
    this.mesh = createPlaneMesh()

    this.handlePlaneMovement = handlePlaneMovement;
}

function createPlaneMesh() {
    // arbitrary size
	var boxGeometry = new THREE.BoxGeometry(0.4, 0.1, 0.5)
	var boxMaterial = new THREE.MeshStandardMaterial({color: 0xe5f2f2}) // shading: THREE.FlatShading
	var body = new THREE.Mesh(boxGeometry, boxMaterial)

	var plane = new THREE.Object3D()
	plane.add(body)

	// TODO: add wing meshes onto this object

	// TODO: look into why shadows are not being cast onto the main floor
	plane.receiveShadow = true;
	plane.castShadow = true;

    plane.position.set(0, planeInitY, planeInitZ)
    
    // add to scene
    // scene.add(plane)
    
    return plane
}

// http://stemkoski.github.io/Three.js/Collision-Detection.html
// ^ that above link might have better movement handling, it is more specific to threejs
function handlePlaneMovement(planeVelocityX) {
	// based off of this:
	// https://stackoverflow.com/questions/15344104/smooth-character-movement-in-canvas-game-using-keyboard-controls

	// we must move the camera, as well as the plane, since we always want to
	// keep the camera focused on the plane
	this.mesh.position.x += planeVelocityX
	this.mesh.position.x += planeVelocityX

	// for added effect: rotate the plane in the direction it is trying to go
	// TODO: make this effect smoother, round it out
	if (planeVelocityX < 0) {
		this.mesh.rotation.z += turnSpeed;
		this.mesh.rotation.z = Math.min(this.mesh.rotation.z, Math.PI / 4);
	} else if (planeVelocityX > 0) {
		this.mesh.rotation.z -= turnSpeed;
		this.mesh.rotation.z = Math.max(this.mesh.rotation.z, - Math.PI / 4);
	} else {
		this.mesh.rotation.z /= 1.3;
	}
}