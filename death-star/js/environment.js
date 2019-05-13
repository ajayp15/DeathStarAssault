
function Environment() {
  this.mesh = new THREE.Object3D();

  var skyGeo = new THREE.SphereGeometry(10000, 25, 25);
  var loader  = new THREE.TextureLoader(),
  texture = loader.load( "images/background.jpg" );
  var material = new THREE.MeshPhongMaterial({
        map: texture,
  });
  var sky = new THREE.Mesh(skyGeo, material);
  sky.material.side = THREE.BackSide;
  sky.material.fog = false

  this.mesh.add( sky );

  var sunGeo = new THREE.SphereGeometry( 200, 100, 100 );
	var sunMat = new THREE.MeshBasicMaterial( {color: 0xf4b342} );
	var sun = new THREE.Mesh( sunGeo, sunMat );
	sun.position.set(3000, 3000, 3000);
	this.mesh.add( sun );

	var ambient = new THREE.AmbientLight( 0xffffff, 0.5 );
	this.mesh.add( ambient );

	var directional = new THREE.DirectionalLight( 0xffffff, 1);
	directional.position.set(3000, 3000, 3000);
	//directional.castShadow = true;
	this.mesh.add( directional );
}
