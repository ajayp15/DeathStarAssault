/*
    Dialogs.js: Will create divs that display objectives,
    scores, etc.
*/


function createStatusDisplay(scene) {
    var dialog = document.createElement('div');
    var sceneWidth = scene.sceneWidth
    var sceneHeight = scene.sceneHeight

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
    scoreText.innerHTML = "TIEs Destroyed: " + 0

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