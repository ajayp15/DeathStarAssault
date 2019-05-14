/*
    Dialogs.js: Will create divs that display objectives,
    scores, etc.
*/


function StatusDisplayDS() {
    this.dialog = document.createElement('div');
    var sceneWidth = scene.sceneWidth
    var sceneHeight = scene.sceneHeight

    var dialogWidth = 150
    var dialogHeight = 90
    var healthBarHeight = 15

    this.dialog.id = "statusDisplay"

    // position it
    this.dialog.style.position = 'absolute';
	  this.dialog.style.width = dialogWidth + "px"; // sceneWidth / 5
    this.dialog.style.height = dialogHeight + "px";
    this.dialog.style.top = 10 + 'px';
    this.dialog.style.right = 10 + 'px';

    // shape it
    this.dialog.style.borderRadius = 25 + "px"
    this.dialog.style.paddingTop = 10 + "px"
    this.dialog.style.paddingLeft = 10 + "px"
    this.dialog.style.paddingRight = 10 + "px"

    // add enemies destroyed text
    this.scoreText = document.createElement('div')
    this.dialog.appendChild(this.scoreText)
    this.scoreText.innerHTML = "Turrets Destroyed: " + 0

    // add health text
    this.healthText = document.createElement('div')
    this.dialog.appendChild(this.healthText)
    this.healthText.style.paddingTop = 10 + "px"
    this.healthText.innerHTML = "Ship Status: 100%"

    // add health bar
    this.healthBar = document.createElement('progress')
    this.dialog.appendChild(this.healthBar)
    this.healthBar.value = 100
    this.healthBar.max = 100
    this.healthBar.style.width = dialogWidth + "px"
    this.healthBar.style.height = healthBarHeight + "px"
    // healthBar.style.paddingTop = 5 + "px"
    this.healthBar.style.backgroundColor = "#42f442"

    document.body.appendChild(this.dialog);

    this.setScore = function(score) {
      this.scoreText.innerHTML = "Turrets Destroyed: " + score + "/" + turretDestroyCount
    }

    this.setHealthPct = function(health) {
      health = Math.floor(health)
      this.healthText.innerHTML = "Ship Status: " + health + "%"
      this.healthBar.value = health
    }
}

function createObjectiveDialogDS() {
    var dialog = document.createElement('div');
    var sceneWidth = scene.sceneWidth
    var sceneHeight = scene.sceneHeight

    var dialogWidth = sceneWidth / 2
    var dialogHeight = sceneHeight / 2

    dialog.id = "objectiveDisplay"

    dialog.style.fontSize = dialogHeight / 12 + "px"

    // position it
    dialog.style.position = 'fixed';
	  dialog.style.width = dialogWidth + "px"; // sceneWidth / 5
    dialog.style.height = dialogHeight + "px";

    // shape it
    dialog.style.borderRadius = 25 + "px"
    dialog.style.paddingTop = 10 + "px"
    dialog.style.paddingLeft = 10 + "px"
    dialog.style.paddingRight = 10 + "px"

    dialog.innerHTML =
            "Objective: Destroy " +
            turretDestroyCount +
            " turrets while dodging their lasers and other obstacles in order to clear a path for alliance ships to the trench"
    dialog.innerHTML += "<br><br> Controls: Arrow keys to move, Spacebar to shoot"

    document.body.appendChild(dialog)

    return dialog
}

function createSFoilActionDialogDS() {
    var dialog = document.createElement('div');
    var sceneWidth = scene.sceneWidth
    var sceneHeight = scene.sceneHeight

    var dialogWidth = sceneWidth / 2
    var dialogHeight = sceneHeight / 2

    dialog.id = "objectiveDisplay"

    dialog.style.fontSize = dialogHeight / 12 + "px"

    // position it
    dialog.style.position = 'fixed';
	  dialog.style.width = dialogWidth + "px"; // sceneWidth / 5
    dialog.style.height = dialogHeight + "px";

    // shape it
    dialog.style.borderRadius = 25 + "px"
    dialog.style.paddingTop = 10 + "px"
    dialog.style.paddingLeft = 10 + "px"
    dialog.style.paddingRight = 10 + "px"

    dialog.innerHTML =
            "Red Leader to Red 5: OK Red 5, this is it. Lock S-foils in Attack Position. Press 'S' now and may the force be with you"

    document.body.appendChild(dialog)

    return dialog
}

function createLosingDialogDS() {
    var dialog = document.createElement('div');
    var sceneWidth = scene.sceneWidth
    var sceneHeight = scene.sceneHeight

    var dialogWidth = sceneWidth / 1.5
    var dialogHeight = sceneHeight / 1.5

    dialog.id = "gameOverDisplay"

    dialog.style.fontSize = dialogHeight / 10 + "px"

    // position it
    dialog.style.position = 'fixed';
	  dialog.style.width = dialogWidth + "px"; // sceneWidth / 5
    dialog.style.height = dialogHeight + "px";

    // shape it
    dialog.style.borderRadius = 25 + "px"
    dialog.style.paddingTop = 10 + "px"
    dialog.style.paddingLeft = 10 + "px"
    dialog.style.paddingRight = 10 + "px"


    var endingMessage = document.createElement('div')
    dialog.appendChild(endingMessage)
    endingMessage.innerHTML = "The rebel alliance has lost. The galactic empire reigns supreme."

    var replayButton = document.createElement('button')
    replayButton.id = "replayButton"
    replayButton.style.width = dialogWidth / 2 + "px"
    replayButton.style.height = dialogHeight / 4 + "px"
    replayButton.style.fontSize = dialogHeight / 10 + "px"
    replayButton.innerHTML = "Replay!"

    replayButton.addEventListener("click", restartGameDS) // add this listener
    dialog.appendChild(replayButton)

    document.body.appendChild(dialog)

    return dialog
}
