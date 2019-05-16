
var structureTexture = new THREE.TextureLoader().load( 'surface/images/structures-diffuse.jpg' );

function Ground(scene) {
  this.scene = scene
  this.mesh = createGround();

  // this.computeGroundTop = function () {
  //   this.mesh.geometry.computeBoundingBox()
  //   return this.mesh.geometry.boundingBox.max.y + this.mesh.position.y
  // }

  // this.groundTop = this.computeGroundTop()

  this.handleGroundMovements = function (delta) {
    for (var i = 0; i < this.mesh.length; i++) {
      this.mesh[i].position.z += wallMovementSpeed * delta
    }
    if (this.mesh[0].position.z - groundDepth / 2 >= nearPlane) {
      this.mesh[0].position.z = this.mesh[1].position.z - groundDepth
      // swap them
      this.mesh = [this.mesh[1], this.mesh[0]]
    }
  }

}

var minPadding = 1

function createGround() {
  var ground = []
  var subGround = createSubGround()
  var subGround2 = createSubGround()
  subGround.position.z = nearPlane
  subGround2.position.z = -groundDepth + nearPlane
  ground = [subGround, subGround2]

  return ground
}

function createSubGround() {
  var planeTexture = new THREE.TextureLoader().load( 'surface/images/deathstar-diffuse.jpg' );
  var geometry = new THREE.BoxGeometry(groundWidth, groundHeight, groundDepth)
  var material = new THREE.MeshLambertMaterial({ map: planeTexture, color: 0x4b4b4f });
  material.polygonOffset = true
  material.polygonOffsetFactor = -0.1
  var mainMesh = new THREE.Mesh(geometry, material);
  var ground = new THREE.Object3D();
  ground.add(mainMesh)

  var numDesigns = 2 * Math.round(groundDepth / numWalls)
  // add designs
  var designGeometry = new THREE.Geometry()
  for (var i = 0; i < numDesigns; i++) {
    var design = createGroundDesign(groundDepth, i, numDesigns)
    // ground.add(design)
    design.updateMatrix()
    designGeometry.merge(design.geometry, design.matrix)
  }
  var structureMat = new THREE.MeshLambertMaterial({ map: structureTexture, color: 0x606670, side: THREE.DoubleSide });
  var designs = new THREE.Mesh(designGeometry, structureMat)
  ground.add(designs)

  ground.position.y = -2
  // ground.position.z = 0 - index * groundDepth // minux because negative z is forward

  this.scene.addMesh(ground)

  return ground
}

function createGroundDesign(groundDepth, zIndex, numDesigns) {
  var width = 5
  var height = 1
  var depth = 5

  var compWidth = Math.random() * width
  var compHeight = Math.random() * (height - 1) + minPadding
  var compDepth = Math.random() * (depth - 1) + minPadding

  var geometry = new THREE.BoxGeometry(compWidth, compHeight, compDepth)
  var material = new THREE.MeshLambertMaterial({ map: structureTexture, color: 0x606670, side: THREE.DoubleSide });
  material.polygonOffset = true
  material.polygonOffsetFactor = -0.1
  var box = new THREE.Mesh(geometry, material)

  box.position.x = (2 * Math.random() - 1) * 5
  box.position.y = 2 + Math.random() * 0.5
  box.position.z = (zIndex / numDesigns) * (groundDepth - depth) + depth / 2
  return box
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
    var material = new THREE.MeshLambertMaterial({ color: 0x606670, side: THREE.DoubleSide });

    var box = new THREE.Mesh(geometry, material)

    box.receiveShadow = true;
    box.castShadow = true;

    box.position.x = (2 * Math.random() - 1) * 5
    box.position.y = 0.5
    box.position.z = (i / numDesigns) * (farPlane - wallNearPlaneGeneration)
    this.scene.addMesh(box)
    designsOnGround.push(box)
  }
  return designsOnGround
}
