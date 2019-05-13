/*
  Gameplay settings
*/
var showStats = true
var windowOffset = 0

/*
  Tutorial constants
*/
var timeToShowObjectiveScreen = 8

/*
  Scene constants
*/
var deathstarPlaneSize = 10000
var deathstarTurretCount = 30
var deathstarSmallStructureCount = 2000
var cameraTrailing = 0.5
var shipScaleDS = 15

var displayBoundingBoxes = false

/*
  Gameplay constants
*/
var shipYawVelocity = 80 * 3.14 / 180
var shipPitchVelocity = 80 * 3.14 / 180
var shipRollVelocity = 200 * 3.14 / 180
var shipVelocity = 70
var shipRollMaximumAngle = 45 * 3.14 / 180
var shipPitchMaximumAngle = 80 * 3.14 / 180
var shipMinimumAltitude = 4.5
var shipMaximumAltitude = 250
var shipStartingAltitude = 200

var shipMaximumPlaneCoord = 2500
var shipWeaponMinimumTimeDelay = 0.1
var shipLaserColor = 0xff2222
var shipLaserCutoffDistance = 1000
var shipHitCountHealth = 20
var shipLaserVelocity = 800
var shipHitDisruptionTime = 1.5

var turretGunTurnSpeed = 50 * 3.14 / 180
var turretFireRadius = 1200
var turretMinimumTimeDelay = 2
var turretLaserVelocity = 20
var turretLaserSize = 0.2
var turretLaserCutoffDistance = 1200
var turretLaserColor = 0x22ff22
var turretHitHealth = 10

var turretDestroyCount = 1

var SPACE = 32
var LEFT = 37
var UP = 38
var RIGHT = 39
var DOWN = 40
var FKEY = 70
var SKEY = 83

var zeroVec3 = new THREE.Vector3(0, 0, 0)

// bounding box material
var bbMat = new THREE.MeshBasicMaterial({
    color: 0xff0000,
    wireframe: true
});
