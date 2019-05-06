var showStats = true; // turns stats on and off
var maxBasicObstacles = 50;
var floorWidth = 10 // arbitrarily chosen for now
var floorHeight = 50
var objectGenerationTime = 0.5;
var movementSpeed = 0.1
var nearPlane = 6 // sort of arbitrary for detecting if gone out of view
// this causes weird behavior: used to be 1.8
var planeInitY = 1.8 // arbitrary positioning (TODO: figure out for sure which axes are which)
var planeInitZ = 4.5
var turnSpeed = 0.25;
var maxVelocity = 0.5;
var windowOffset = 10; // to make it not have scroll bars