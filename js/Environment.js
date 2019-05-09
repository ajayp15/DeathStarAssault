
function Environment(scene, ground) {
  this.scene = scene;
  this.ground = ground;
  this.sky = new THREE.Sky();
  var uniforms = this.sky.material.uniforms;
  uniforms[ 'turbidity' ].value = 10;
  uniforms[ 'rayleigh' ].value = 2;
  uniforms[ 'luminance' ].value = 1;
  uniforms[ 'mieCoefficient' ].value = 0.005;
  uniforms[ 'mieDirectionalG' ].value = 0.8;

  var parameters = {
    distance: 400,
    inclination: 0.49,
    azimuth: 0.205
  };

  this.cubeCamera = new THREE.CubeCamera( 0.1, 1, 512 );
  this.cubeCamera.renderTarget.texture.generateMipmaps = true;
  this.cubeCamera.renderTarget.texture.minFilter = THREE.LinearMipMapLinearFilter;
  scene.background = this.cubeCamera.renderTarget;

  this.updateSun = function() {
    var theta = Math.PI * ( parameters.inclination - 0.5 );
    var phi = 2 * Math.PI * ( parameters.azimuth - 0.5 );
    this.scene.light.position.x = parameters.distance * Math.cos( phi );
    this.scene.light.position.y = parameters.distance * Math.sin( phi ) * Math.sin( theta );
    this.scene.light.position.z = parameters.distance * Math.sin( phi ) * Math.cos( theta );
    this.sky.material.uniforms[ 'sunPosition' ].value = scene.light.position.copy( this.scene.light.position );
    this.ground.mesh.material.uniforms[ 'sunDirection' ].value.copy( this.scene.light.position ).normalize();
    this.cubeCamera.update( this.scene.renderer, this.sky );
  }
  this.updateSun();
}
