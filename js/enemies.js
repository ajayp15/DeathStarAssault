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
    var wingMaterial1 = new THREE.MeshLambertMaterial({color: 0x151616, side : THREE.DoubleSide})
    var wing1 = new THREE.Mesh(circleGeometry1, wingMaterial1)
    wing1.position.x = -fighterRadius
    wing1.rotation.y = Math.PI / 2.1

    var circleGeometry2 = new THREE.CircleGeometry(obstaclesRadius * 1.5, 6)
    var wingMaterial2 = new THREE.MeshLambertMaterial({color: 0x151616, side : THREE.DoubleSide})
    var wing2 = new THREE.Mesh(circleGeometry2, wingMaterial2)
    wing2.position.x = fighterRadius
    wing2.rotation.y = Math.PI / 1.9

    /*
        Add wireframe shapes (identical to above but just different color)
        to look cool
    */
    var sphereGeometryWire = new THREE.SphereGeometry(fighterRadius, 8, 5) // make it as low resolution as possible, to optimize
    var bodyMaterialWire = new THREE.MeshLambertMaterial({color: 0x27292d, 
        side : THREE.DoubleSide,
        wireframe: true})
    var bodyWire = new THREE.Mesh(sphereGeometryWire, bodyMaterialWire);

    // create wings now (just as circles) (6 segments, just like in real tie fighter)
    var circleGeometry1Wire = new THREE.CircleGeometry(obstaclesRadius * 1.5, 6)
    var wingMaterial1Wire = new THREE.MeshLambertMaterial({color: 0x393f49, 
        side : THREE.DoubleSide,
        wireframe: true})
    var wing1Wire = new THREE.Mesh(circleGeometry1Wire, wingMaterial1Wire)
    wing1Wire.position.x = -fighterRadius
    wing1Wire.rotation.y = Math.PI / 2.1

    var circleGeometry2Wire = new THREE.CircleGeometry(obstaclesRadius * 1.5, 6)
    var wingMaterial2Wire = new THREE.MeshLambertMaterial({color: 0x393f49, 
        side : THREE.DoubleSide,
        wireframe: true})
    var wing2Wire = new THREE.Mesh(circleGeometry2Wire, wingMaterial2Wire)
    wing2Wire.position.x = fighterRadius
    wing2Wire.rotation.y = Math.PI / 1.9

    /*
        Add the cockpit circle as a final touch
    */
    var sphereGeometry1 = new THREE.SphereGeometry(fighterRadius / 1.5, 8, 5) // make it as low resolution as possible, to optimize
    var cockpitMaterial = new THREE.MeshLambertMaterial({color: 0x151616, side : THREE.DoubleSide})
    var cockpit = new THREE.Mesh(sphereGeometry1, cockpitMaterial);
    cockpit.position.z = fighterRadius / 1.5

    var obj = new THREE.Object3D()
    obj.add(body)
    obj.add(wing1)
    obj.add(wing2)
    obj.add(bodyWire)
    obj.add(wing1Wire)
    obj.add(wing2Wire)
    obj.add(cockpit)

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
                this.enemies[i].mesh.position.y = Math.random() * (4 - 1) + 2
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
        enemy.mesh.position.y = Math.random() * (4 - 1) + 2
        // enemy.mesh.position.z = -5
        enemy.mesh.position.z = farPlane + (i / numEnemies) * (farPlane - nearPlane)

        this.scene.addMesh(enemy.mesh)
    }

    return enemies
}