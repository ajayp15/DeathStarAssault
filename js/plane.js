/*
    plane.js: This file defines all of the functions
    necessary to make the plane mesh, make it move, and
    animate it, etc.
*/

function Plane() {
    this.mesh = createPlaneMesh()

    this.handlePlaneMovement = function (planeVelocityX, planeVelocityY) {
        this.mesh.position.x += planeVelocityX
        this.mesh.position.y += planeVelocityY

        // handle x movement
        if (planeVelocityX < 0) {
            this.mesh.rotation.z += turnSpeed;
            this.mesh.rotation.z = Math.min(this.mesh.rotation.z, Math.PI / 4);
        } else if (planeVelocityX > 0) {
            this.mesh.rotation.z -= turnSpeed;
            this.mesh.rotation.z = Math.max(this.mesh.rotation.z, - Math.PI / 4);
        } else {
            this.mesh.rotation.z /= 1.3;
        }

        // handle y movement (flip the directions, seems to work this way, axis flipped)
        if (planeVelocityY > 0) {
          this.mesh.rotation.x += turnSpeed;
          this.mesh.rotation.x = Math.min(this.mesh.rotation.x, Math.PI / 4);
        } else if (planeVelocityY < 0) {
            this.mesh.rotation.x -= turnSpeed;
            this.mesh.rotation.x = Math.max(this.mesh.rotation.x, - Math.PI / 4);
        } else {
            this.mesh.rotation.x /= 1.3;
        }
    }
}

function createPlaneMesh() {
    var bodyGeometry = new THREE.BoxGeometry(0.4, 0.1, 0.5)
    var bodyMaterial = new THREE.MeshStandardMaterial({ color: 0xe5f2f2 })
    var body = new THREE.Mesh(bodyGeometry, bodyMaterial)

    var plane = new THREE.Object3D()
    plane.add(body)

    plane.receiveShadow = true;
    plane.castShadow = true;

    plane.position.set(0, planeInitY, planeInitZ)

    return plane
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
