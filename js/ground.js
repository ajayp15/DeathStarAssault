function Ground(w, h, l) {
  this.mesh = createGround(w, h, l);

  this.updateGroundEvolution = function(dt) {
    this.mesh.material.uniforms[ 'time' ].value += dt;
  }

  this.addMeshToGround = function(m) {
    this.mesh.add(m);
  }

  this.removeMeshFromGround = function(m) {
    this.mesh.remove(m);
  }
}

function createGround(width, height, light) {
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
  // mesh.visible = false
  return water;
}
