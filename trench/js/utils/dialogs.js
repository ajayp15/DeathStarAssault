/*
    Dialogs.js: Will create divs that display objectives,
    scores, etc.
*/


function createStatusDisplayT(scene) {
    var dialog = document.createElement('div');

    var dialogWidth = 150

    dialog.id = "statusDisplay"

    // position it
    dialog.style.position = 'absolute';
	dialog.style.width = dialogWidth + "px"; // sceneWidth / 5
    dialog.style.height = dialogWidth / 2 + "px";
    dialog.style.top = 10 + 'px';
    dialog.style.right = 10 + 'px';

    // shape it
    dialog.style.borderRadius = 25 + "px"
    dialog.style.paddingTop = 10 + "px"
    dialog.style.paddingLeft = 10 + "px"
    dialog.style.paddingRight = 10 + "px"

    // add enemies destroyed text
    var scoreText = document.createElement('div')
    dialog.appendChild(scoreText)
    scoreText.innerHTML = "TIE Destroyed: " + 0 + "/" + phase1RequiredScore

    // add health text
    var healthText = document.createElement('div')
    dialog.appendChild(healthText)
    healthText.style.paddingTop = 10 + "px"
    healthText.innerHTML = "Ship Status: " + initialHP + "%"

    // add health bar
    var healthBar = document.createElement('progress')
    dialog.appendChild(healthBar)
    healthBar.value = 100
    healthBar.max = 100
    healthBar.style.width = dialogWidth + "px"
    healthBar.style.height = dialogWidth / 10 + "px"
    // healthBar.style.paddingTop = 5 + "px"
    healthBar.style.backgroundColor = "#42f442"

    document.body.appendChild(dialog);

    return {score: scoreText, hpText: healthText, hpBar: healthBar}
}

function createInitialObjectiveDialogT(scene) {
    var dialog = document.createElement('div');
    var sceneWidth = scene.sceneWidth
    var sceneHeight = scene.sceneHeight

    var dialogWidth = sceneWidth / 2
    var dialogHeight = sceneHeight / 2

    dialog.id = "objectiveDisplay"

    dialog.style.fontSize = dialogHeight / 14 + "px"

    // position it
    dialog.style.position = 'fixed';
	dialog.style.width = dialogWidth + "px"; // sceneWidth / 5
    dialog.style.height = dialogHeight + "px";

    // shape it
    dialog.style.borderRadius = 25 + "px"
    dialog.style.paddingTop = 10 + "px"
    dialog.style.paddingLeft = 10 + "px"
    dialog.style.paddingRight = 10 + "px"

    dialog.innerHTML = "Objective: Destroy " + phase1RequiredScore + " TIE Fighters while dodging them and their lasers! The TIEs take 2 hits!"
    dialog.innerHTML += "<br><br> Controls: Arrow keys to move, Spacebar to shoot"

    document.body.appendChild(dialog)

    return dialog
}

function createFinalObjectiveDialogT(scene) {
    var dialog = document.createElement('div');
    var sceneWidth = scene.sceneWidth
    var sceneHeight = scene.sceneHeight

    var dialogWidth = sceneWidth / 2
    var dialogHeight = sceneHeight / 2

    dialog.id = "objectiveDisplay"

    dialog.style.fontSize = dialogHeight / 15 + "px"

    // position it
    dialog.style.position = 'fixed';
	dialog.style.width = dialogWidth + "px"; // sceneWidth / 5
    dialog.style.height = dialogHeight + "px";

    // shape it
    dialog.style.borderRadius = 25 + "px"
    dialog.style.paddingTop = 10 + "px"
    dialog.style.paddingLeft = 10 + "px"
    dialog.style.paddingRight = 10 + "px"

    dialog.innerHTML = "Objective: Shoot your proton torpedos into the death star by aligning the aim! You only get one shot kid!"
    dialog.innerHTML += "<br><br> Controls: Arrow keys to move, Spacebar to shoot"

    document.body.appendChild(dialog)

    return dialog
}

function showGameOverDialogT(scene, state = "default") {
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

    var replayButton = document.createElement('button')
    replayButton.id = "replayButton"
    replayButton.style.width = dialogWidth / 2 + "px"
    replayButton.style.height = dialogHeight / 4 + "px"
    replayButton.style.fontSize = dialogHeight / 10 + "px"
    replayButton.innerHTML = "Replay!"

    var endingMessage = document.createElement('div')
    dialog.appendChild(endingMessage)

    if (state == "default") {
        endingMessage.innerHTML = "You were blasted to bits. You'll get 'em on the next run pilot!"
        replayButton.addEventListener("click", restartGameT) // add this listener
    }
    else if (state == "phase2") {
        endingMessage.innerHTML = "You were unsuccessful in destroying the death star. Aim for the cavity in the wall next time, pilot!"
        dialog.style.fontSize = dialogHeight / 15 + "px"
        replayButton.addEventListener("click", restartGameT) // add this listener
    } else if (state == "deathStarDestroyed") {
        endingMessage.innerHTML = "Great work pilot! You've destroyed the empire's prized possession, the death star. Hope they don't rebuild it..."
        endingMessage.innerHTML += "<br> Game developers: Antony Toron, Ajay Penmatcha"
        dialog.style.fontSize = dialogHeight / 15 + "px"
        replayButton.addEventListener("click", resetToBeginning) // add this listener
    }
    dialog.appendChild(replayButton)

    document.body.appendChild(dialog)

    return dialog
}
