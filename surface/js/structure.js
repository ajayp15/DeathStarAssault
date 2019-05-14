/*
  structures.js
*/

var structureTexture = THREE.ImageUtils.loadTexture( '/death-star/images/structures_diffuse.jpg' );
structureTexture.wrapS = structureTexture.wrapT = THREE.RepeatWrapping;
structureTexture.repeat.set( 1, 1 );
var structureMaterial = new THREE.MeshPhongMaterial( { map: structureTexture } );

function Structure(px, py, pz, sx, sy, sz) {
  this.hitCount = 0
  this.innerStruct = undefined

  this.outerStruct =
    new THREE.Mesh(
      new THREE.BoxGeometry(sx, sy, sz),
      structureMaterial
    );
  //this.outerStruct.castShadow=true;
  this.outerStruct.position.set(px, py, pz);

  if (Math.random() < 0.5) { // half the time, add inner structure
    this.innerStruct =
      new THREE.Mesh(
        new THREE.BoxGeometry(sx / 2, sy * 2, sz / 2),
        structureMaterial
      );
    //this.innerStruct.castShadow=true;
    this.innerStruct.position.set(px, py, pz);
  }

  this.cleanup = function() {
    dispose3(this.outerStruct)
    if (this.innerStruct != undefined) {
      dispose3(this.innerStruct)
    }
  }
}
