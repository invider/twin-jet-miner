
_ = scene = (function(window) {
"use strict"

var TARGET_FPS = 60
var MAX_EVO_TIME = 0.1

var cnv, ctx
var lastFrame = Date.now()

var scene = {
    mouseX: 0,
    mouseY: 0,
    mouseButton: '---',
    keys: {},
}


// === INIT ====
function expandCanvas() {
    var canvas = document.getElementById('canvas')
    var newWidth = window.innerWidth
    var newHeight = window.innerHeight
    scene.width = canvas.width = newWidth
    scene.height = canvas.height = newHeight
    canvas.style.width = newWidth + 'px'
    canvas.style.height = newHeight + 'px'
    render(0)
}

function init() {
    cnv = document.getElementById("canvas")
    ctx = cnv.getContext("2d")
    //cnv.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT); //Chrome
    //cnv.mozRequestFullScreen(); //Firefox

    expandCanvas()

	load()

    // initiate the game loop
    if (TARGET_FPS <= 0) {
        setInterval(loop, 1)
    } else {
        setInterval(loop, 1000/TARGET_FPS)
    }
}

function load() {
	// TODO start loading
}



// === GAME LOOP ===

// process input events (controls, random, AI)
function input(delta) {
	// TODO process input handlers
}

function evolve(delta) {
	// update scene
}

var fps = 0, fpsa = 1, fpsc = 0
function render(delta) {
    // clear
    ctx.fillStyle = "#220044"
    ctx.fillRect(0,0,cnv.width,cnv.height)

    // draw everything

    // draw status
    ctx.fillStyle = "#FFFF00"
    ctx.font = '24px alien'
    ctx.textBaseline = 'bottom'

    if (fpsa >= 1 && delta > 0) {
        fps = Math.round(fpsc/fpsa)
        fpsa = delta
        fpsc = 1
    } else {
        fpsc += 1
        fpsa += delta
    }

    var status = 'fps: ' + fps
        +' mouse: ' + scene.mouseX + 'x' + scene.mouseY + ', ' + scene.mouseButton
        + " Keyboard: "
    for (var k in scene.keys) {
        status += "-" + k
    }
    status += '-'
    ctx.fillText(status, 10, 30)
}


function loop() {
    var now = Date.now()
    var delta = (now - lastFrame)/1000

    // show, react and update cycle
    render(delta)
    input(delta)

    // evolve multiple times in small quants
    // to compensate possible lag due to rendering delays
    while(delta > 0) {
        if (delta > MAX_EVO_TIME) {
            evolve(MAX_EVO_TIME);
        } else {
            evolve(delta);
        }
        delta -= MAX_EVO_TIME
    }
    lastFrame = now
}



// === EVENTS ===
function handleMouse(e) {
    e = e || window.event
    scene.mouseX = e.pageX
    scene.mouseY = e.pageY
    e.preventDefault()
    e.stopPropagation()
    return false;
}

function handleMouseDown(e) {
    switch (e.button) {
    case 0: scene.mouseButton = '*--';
            break;
    case 1: scene.mouseButton = '-*-';
            break;
    case 2: scene.mouseButton = '--*';
            break;
    }
    e.preventDefault()
    e.stopPropagatton = e.button
    return false;
}

function handleMouseUp(e) {
    scene.mouseButton = '---'
}

function handleMouseDoubleClick(e) {
    switch (e.button) {
    case 0: scene.mouseButton = '+--';
            break;
    case 1: scene.mouseButton = '-+-';
            break;
    case 2: scene.mouseButton = '--+';
            break;
    }
    e.preventDefault()
    e.stopPropagatton = e.button
    return false;
}

function handleMouseOut(e) {
    for (var k in scene.keys) {
        delete scene.keys[k]
    }
}

function handleContextMenu() {
    return false;
}

function handleKeyDown(e) {
    var code = e.which || e.keyCode

    scene.keys[code] = 1

    e.preventDefault()
    e.stopPropagation()
    return false;
}

function handleKeyUp(e) {
    var code = e.which || e.keyCode
    delete scene.keys[code]

    e.preventDefault()
    e.stopPropagation()
    return false;
}


// bind to events
window.addEventListener('resize', expandCanvas, false)
window.onload = init;
window.onmousemove = handleMouse
window.onmousedown = handleMouseDown
window.onmouseup = handleMouseUp
window.onmouseout = handleMouseOut
window.ondblclick = handleMouseDoubleClick
window.oncontextmenu = handleContextMenu
window.onkeydown = handleKeyDown
window.onkeyup = handleKeyUp


return scene;

}(this))

