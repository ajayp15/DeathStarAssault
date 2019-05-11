/*
  Gameplay settings
*/
var showStats = true
var windowOffset = 0

/*
  Scene constants
*/
var deathstarPlaneSize = 10000
var deathstarTurretCount = 30
var deathstarSmallStructureCount = 2000
var cameraTrailing = 0.5
var shipScale = 15

/*
  Gameplay constants
*/
var shipYawVelocity = 100 * 3.14 / 180
var shipPitchVelocity = 100 * 3.14 / 180
var shipRollVelocity = 200 * 3.14 / 180
var shipVelocity = 50
var shipRollMaximumAngle = 40 * 3.14 / 180
var shipPitchMaximumAngle = 70 * 3.14 / 180
var shipMinimumAltitude = 4.5
var shipMaximumAltitude = 200
var shipMaximumPlaneCoord = 2500
var shipWeaponMinimumTimeDelay = 0.3
var shipLaserColor = 0xff2222
var shipLaserCutoffDistance = 400

var turretGunTurnSpeed = 40 * 3.14 / 180
var turretFireRadius = 600
var turretMinimumTimeDelay = 5
var turretLaserVelocity = 20
var turretLaserSize = 1
var turretLaserCutoffDistance = 500
var turretLaserColor = 0x22ff22

var SPACE = 32
var LEFT = 37
var UP = 38
var RIGHT = 39
var DOWN = 40
var FRONT = 70

// bounding box material
var bbMat = new THREE.MeshBasicMaterial({
    color: 0xff0000,
    wireframe: true
});
