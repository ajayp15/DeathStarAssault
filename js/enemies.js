/*
    This file will define the enemy tie-fighters that will spring into action and start shooting at the player.
*/

// singular enemy
function Enemy() {
    this.mesh = createEnemy()
}

function createEnemy() {
    var geometry = new THREE.BoxGeometry(groundWidth, groundHeight, groundDepth)
    var material = new THREE.MeshLambertMaterial({ color: 0x4b4b4f, side: THREE.DoubleSide });
    var mesh = new THREE.Mesh(geometry, material);
}

// all enemies that are in-scene
function Enemies() {

}