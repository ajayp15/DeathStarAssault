var showStats = false; // turns stats on and off
var maxBasicObstacles = 50
var floorWidth = 10 // arbitrarily chosen for now
var floorHeight = 50
var objectGenerationTime = 0.01;
var movementSpeed = 0.1 * 60
var loaded = false
var nearPlane = 6 // sort of arbitrary for detecting if gone out of view
var farPlane = -60 // arbitrary, for generation of blocks
// this causes weird behavior: used to be 1.8
var planeInitY = 1.8 // arbitrary positioning (TODO: figure out for sure which axes are which)
var planeInitZ = 4.5
var turnSpeed = 0.25 * 60;
var cameraDrift = 0.5
var maxVelocity = 0.5 * 60;
var planeVelocityConst = 0.05 * 60
var windowOffset = 10; // to make it not have scroll bars
var initialHP = 100

var loadModel = true // load plane model
var bbMat = new THREE.MeshBasicMaterial({
    color: 0xff0000,
    wireframe: true
  });
var displayBoundingBoxes = false

var laserGeometry = new THREE.CylinderGeometry(0.01, 0.01, 1, 4)
var shipLaserMaterial = new THREE.MeshLambertMaterial({
  color: 0xff0000,
})
var enemyLaserMaterial = new THREE.MeshLambertMaterial({
  color: 0x1bd127,
})

var aimRadius = 0.5
var torpedoRadius = 0.4
var endGameCutsceneTime = 12000
var phase1RequiredScore = 1

var sideWallWidth = 5
var sideWallHeight = 15
var sideWallDepth = 60

var shipScale = 0.6
// obstacles constants
var obstaclesType = "sphere"
var obstaclesRadius = 0.5

var groundLeeway = 1
var ceilingLeeway = 50
var wallsLeeway = 1 // (plane width / 2)
var wallNearPlaneGeneration = nearPlane

// this will be the center point of the game, where the scale is determined by how
// large/where we want to place this center (where the fixed camera will stay/move around)
var center = 3;
var xFar = 6
var yFar = 5
