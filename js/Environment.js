
function Environment() {

  // var skyGeo = new THREE.SphereGeometry(50, 25, 25);
  // var sky = new THREE.Mesh(skyGeo, material);
  // sky.material.side = THREE.BackSide;
  // this.mesh = sky;
  var geometry = new THREE.CubeGeometry(200, 200, 200);
  var cubeMaterials = [
    getTexture("ft"),
    getTexture("bk"),
    getTexture("up"),
    getTexture("dn"),
    getTexture("rt"),
    getTexture("lf")
  ]
  var cubeMaterial = new THREE.MeshFaceMaterial(cubeMaterials)
  var cube = new THREE.Mesh(geometry, cubeMaterial)
  this.mesh = cube
}

function getTexture(str) {
  var loader  = new THREE.TGALoader(),
  texture = loader.load( "images/ame_nebula/purplenebula_" + str + ".tga" );
  var material = new THREE.MeshPhongMaterial({
        map: texture,
        side: THREE.DoubleSide,
        fog: false,
  });

  return material
}
