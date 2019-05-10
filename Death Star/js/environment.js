
function Environment() {
  var skyGeo = new THREE.SphereGeometry(10000, 25, 25);
  var loader  = new THREE.TextureLoader(),
  texture = loader.load( "images/background.jpg" );
  var material = new THREE.MeshPhongMaterial({
        map: texture,
  });
  var sky = new THREE.Mesh(skyGeo, material);
  sky.material.side = THREE.BackSide;
  sky.material.fog = false
  this.mesh = sky;
}
