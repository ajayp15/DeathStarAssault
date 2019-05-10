function Ground(scene) {
  this.scene = scene
  this.mesh = createGround();
  this.designsOnGround = createDesignsOnGround()

  this.updateGroundEvolution = function(dt) {
    this.mesh.material.uniforms[ 'time' ].value += dt;
  }

  this.computeGroundTop = function() {
    this.mesh.geometry.computeBoundingBox()
    return this.mesh.geometry.boundingBox.max.y + this.mesh.position.y
  }

  this.groundTop = this.computeGroundTop()

  this.handleGroundMovements = function (delta) {
    for (var i = 0; i < this.designsOnGround.length; i++) {
        this.designsOnGround[i].position.z += movementSpeed * delta
        if (this.designsOnGround[i].position.z > nearPlane) {
            this.designsOnGround[i].position.z = farPlane
        }
    }
  } 

}

function createGround() {
  var groundWidth = 10
  var groundHeight = 5
  var groundDepth = 60

  var geometry = new THREE.BoxGeometry(groundWidth, groundHeight, groundDepth)
  var material = new THREE.MeshLambertMaterial({ color: 0x4b4b4f , side: THREE.DoubleSide});
  var mesh = new THREE.Mesh( geometry, material );

  mesh.position.y = -2

  mesh.receiveShadow = true;
  mesh.castShadow = false;

  return mesh
}

function createDesignsOnGround() {
  var numDesigns = 100
  var designsOnGround = []
  var width = 5
  var height = 1
  var depth = 5
  var minPadding = 1

  for (var i = 0; i < numDesigns; i++) {
      var compWidth = Math.random() * (width - 1) + minPadding
      var compHeight = Math.random() * height
      var compDepth = Math.random() * (depth - 1) + minPadding

      var geometry = new THREE.BoxGeometry(compWidth, compHeight, compDepth)
      var material = new THREE.MeshLambertMaterial({ color: 0x606670 , side: THREE.DoubleSide});

      var box = new THREE.Mesh(geometry, material)

      box.receiveShadow = true;
      box.castShadow = true;

      box.position.x = (2 * Math.random() - 1) * 5
      box.position.y = 0.5
      box.position.z = (i / numDesigns) * (farPlane - nearPlane)
      this.scene.addMesh(box)
      designsOnGround.push(box)
  }
  return designsOnGround
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
