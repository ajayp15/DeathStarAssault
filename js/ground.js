function Ground(scene) {
  this.scene = scene
  this.mesh = createGround();

  this.updateGroundEvolution = function(dt) {
    this.mesh.material.uniforms[ 'time' ].value += dt;
  }

  this.computeGroundTop = function() {
    this.mesh.geometry.computeBoundingBox()
    return this.mesh.geometry.boundingBox.max.y + this.mesh.position.y
  }

  this.groundTop = this.computeGroundTop()
}

function createGround() {
  var groundWidth = 10
  var groundHeight = 5
  var groundDepth = 60

  var geometry = new THREE.BoxGeometry(groundWidth, groundHeight, groundDepth)
  var material = new THREE.MeshBasicMaterial({ color: 0x606670 });
  var mesh = new THREE.Mesh( geometry, material );

  mesh.position.y = -2

  mesh.receiveShadow = true;
  mesh.castShadow = true;

  return mesh
}

// not being used as of now
function waterGeometry(width, height, light) {
  var waterGeometry = new THREE.PlaneBufferGeometry( 10000, 10000 );
	water = new THREE.Water(
		waterGeometry,
		{
			textureWidth: width,
			textureHeight: height,
			waterNormals: new THREE.TextureLoader().load( 'textures/waternormals.jpg', function ( texture ) {
				texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
			} ),
			alpha: 1.0,
			sunDirection: light.position.clone().normalize(),
			sunColor: 0xffffff,
			waterColor: 0x001e0f,
			distortionScale: 3.7,
			fog: scene.fog !== undefined
		}
	);
  water.rotation.x = - Math.PI / 2;
  return water
}
