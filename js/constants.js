var showStats = true; // turns stats on and off
var maxBasicObstacles = 200 * 3 // 50
var floorWidth = 10 // arbitrarily chosen for now
var floorHeight = 50
var objectGenerationTime = 0.01;
var movementSpeed = 0.1 * 60
var nearPlane = 6 // sort of arbitrary for detecting if gone out of view
var farPlane = -60 // arbitrary, for generation of blocks
// this causes weird behavior: used to be 1.8
var planeInitY = 1.8 // arbitrary positioning (TODO: figure out for sure which axes are which)
var planeInitZ = 4.5
var turnSpeed = 0.25 * 60;
var cameraDrift = 1
var maxVelocity = 0.5 * 60;
var planeVelocityConst = 0.05 * 60
var windowOffset = 10; // to make it not have scroll bars

// obstacles constants
var obstaclesType = "sphere"
var obstaclesRadius = 0.5

// this will be the center point of the game, where the scale is determined by how
// large/where we want to place this center (where the fixed camera will stay/move around)
var center = 3;
var xFar = 20
var yFar = 20

