/*
    This file will define the enemy tie-fighters that will spring into action and start shooting at the player.
*/

// singular enemy
function Enemy() {
    this.mesh = createEnemy()
}

function createEnemy() {
    var fighterRadius = obstaclesRadius / 1.3
    var sphereGeometry = new THREE.SphereGeometry(fighterRadius, 8, 5) // make it as low resolution as possible, to optimize
    var bodyMaterial = new THREE.MeshLambertMaterial({color: 0x393f49, side : THREE.DoubleSide})
    var body = new THREE.Mesh(sphereGeometry, bodyMaterial);

    // create wings now (just as circles) (6 segments, just like in real tie fighter)
    var circleGeometry1 = new THREE.CircleGeometry(obstaclesRadius * 1.5, 6)
    var wingMaterial1 = new THREE.MeshLambertMaterial({color: 0x393f49, side : THREE.DoubleSide})
    var wing1 = new THREE.Mesh(circleGeometry1, wingMaterial1)
    wing1.position.x = -fighterRadius
    wing1.rotation.y = Math.PI / 2.1

    var circleGeometry2 = new THREE.CircleGeometry(obstaclesRadius * 1.5, 6)
    var wingMaterial2 = new THREE.MeshLambertMaterial({color: 0x393f49, side : THREE.DoubleSide})
    var wing2 = new THREE.Mesh(circleGeometry2, wingMaterial2)
    wing2.position.x = fighterRadius
    wing2.rotation.y = Math.PI / 1.9

    var obj = new THREE.Object3D()
    obj.add(body)
    obj.add(wing1)
    obj.add(wing2)

    obj.rotation.z = Math.random() * Math.PI * 2

    return obj
}

// all enemies that are in-scene
function Enemies(scene) {
    this.scene = scene
    this.enemies = createEnemies()

    this.handleEnemyMovements = function(delta) {
        for (var i = 0; i < this.enemies.length; i++) {
            this.enemies[i].mesh.position.z += wallMovementSpeed * 2 * delta

            this.enemies[i].mesh.rotation.z += delta * 0.1 *  Math.PI

            // reposition them at far plane if they went out of view
            if (this.enemies[i].mesh.position.z > nearPlane) {
                this.enemies[i].mesh.position.z = farPlane
                this.enemies[i].mesh.position.x = (Math.random() * 2 - 1) * 1.5
                this.enemies[i].mesh.position.y = Math.random() * 4 + 1
            }
        }
    }
}

function createEnemies() {
    var numEnemies = 8
    var enemies = []

    for (var i = 1; i <= numEnemies; i++) {
        enemy = new Enemy()
        enemies.push(enemy)

        enemy.mesh.position.x = (Math.random() * 2 - 1) * 2
        // console.log(enemy.mesh.position.x)
        enemy.mesh.position.y = Math.random() * 4 + 1
        // enemy.mesh.position.z = -5
        enemy.mesh.position.z = farPlane + (i / numEnemies) * (farPlane - nearPlane)

        this.scene.addMesh(enemy.mesh)
    }

    return enemies
}