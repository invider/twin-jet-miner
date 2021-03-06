_ = scene = (function(window) {
"use strict"

var TARGET_FPS = 60
var MAX_EVO_TIME = 0.05

var canvas, ctx
var lastFrame = Date.now()

var scene = {
    name: "Scene",
    width: 100,
    height: 100,
    level:0,
    levelRatio:0.2 ,
    pause: true,
    gameoverFlag: false,

    // music
    playing: false,
    musicVolume: 0.3,
    sfxVolume: 1,

    // event flags
    mouseX: 0,
    mouseY: 0,
    mouseButton: '---',
    statusLine: 'No Status',
    keys: {},

    hint: {
        lastHint: 0,
        base: false,
        fuel: false,
        bombs: false,
        blocks: false,
        turrets: false,
    },

    attach: function(node) {
        this.root.entity.push(node)
        if (node.init) node.init(this.root, scene)
    },

    sfx: function(name, vol) {
        var sfx = this.res.sfx[name]
        if (!sfx) {
            console.log("WARNING! Missing sfx [" + name +  "]")
            return
        }
        if (vol) sfx.volume = vol * this.sfxVolume
        else sfx.volume = this.sfxVolume
        sfx.play()
    },

    play: function(name) {
        if (this.playing) {
            this.playing.pause()
        }
        var track = this.res.track[name]
        if (!track) {
            console.log("WARNING! Missing track [" + name +  "]")
            return
        }
        track.currentTime = 0
        track.volume = this.musicVolume
        track.play()
        this.playing = track
    },

    initStatistic: function (scene){
        var statistic = this.statistic = {
            fps: 0,
            turrets: 10,
            maxTurrets: 10,
            walls: 20,
            maxWalls: 20,
            bombs: 5,
            maxBombs: 5,
            lifes: 50000000,
            scene: scene,
            diggersToSpawn: 0 ,
            spawnedDiggers:0,
            diggersAlive:0,
            startTime:0,
            playTime: 0,
            time: 0,
            overheat: 0.0,
        };
        this.statistic.diggersToSpawn = 30 * (this.level * this.levelRatio + 1);
        this.statistic.startTime = new Date().getTime();
        setInterval(function(){
            statistic.time = new Date().getTime();
        }, 100);
    },
    levelComplete: function(){
        this.level ++;
        this.gameReInit();

        // next level floating message
        var nextLevelMsg = new FloatingText(0, 0,
                "Level Up!", "#FF8000", "48px alien", "center")
        nextLevelMsg.lifespan = 7 
        nextLevelMsg.fadespan = 2
        nextLevelMsg.dx = 20
        nextLevelMsg.dy = -20
        this.root.title.attach(nextLevelMsg)
        this.sfx('levelup', 1)
    },
    gameOver: function(){
        this.gameoverFlag = true;
    },
    gameReInit: function(){
        this.root.entity = [];
        this.root.init(this, this);
        this.initStatistic(this);
        this.play('track-1')
    },
    gameRestart: function(){
        this.gameoverFlag = false;
        this.level = 0;
        this.gameReInit();
    },
    checkCompletion:function(){
        if (this.statistic.diggersToSpawn && this.statistic.diggersToSpawn == this.statistic.spawnedDiggers && this.statistic.diggersAlive == 0){
            this.levelComplete();
        }
    }
};
scene.initStatistic(scene);


// === INIT ====
function expandCanvas() {
    var canvas = document.getElementById('canvas')
    var newWidth = window.innerWidth
    var newHeight = window.innerHeight
    canvas.width = scene.screenWidth = newWidth
    canvas.height = scene.screenHeight = newHeight
    canvas.style.width = newWidth + 'px'
    canvas.style.height = newHeight + 'px'
    render(0)
}

function init() {
    scene.manifest = _$resManifest
    scene.res = _$resManager
    scene.res.init(scene)

    load()

    scene.physics = new Physics();
    scene.physics.init(scene);

    // setup canvas
    canvas= document.getElementById("canvas")
    ctx = canvas.getContext("2d")
    expandCanvas()

    // setup scene
    scene.root = _$root
    scene.root.init(scene, scene)


    // initiate the game loop
    if (TARGET_FPS <= 0) {
        setInterval(loop, 1)
    } else {
        setInterval(loop, 1000/TARGET_FPS)
    }
}

function load() {
    scene.manifest.img.forEach( function(img) {
        scene.res.loadImg(img.name, img.src)
    })
    scene.manifest.sfx.forEach( function(sfx) {
        scene.res.loadSfx(sfx.name, sfx.src)
    })
    scene.manifest.music.forEach( function(track) {
        scene.res.initTrack(track.name, track.src)
    })
}


// === GAME LOOP ===

// process input events (controls, random, AI)
function input(delta) {
	// TODO process input handlers
}

function evolve(delta) {
    if (scene.keys[scene.root.env.ADD]) {
        scene.musicVolume += 0.5 * delta
        if (scene.musicVolume > 1) scene.musicVolume = 1
        if (scene.playing) scene.playing.volume = scene.musicVolume
    } else if (scene.keys[scene.root.env.SUB]) {
        scene.musicVolume -= 0.5 * delta
        if (scene.musicVolume < 0) scene.musicVolume = 0
        if (scene.playing) scene.playing.volume = scene.musicVolume
    }

    if (scene.keys[scene.root.env.CLOSE]) {
        scene.sfxVolume += 0.5 * delta
        if (scene.sfxVolume > 1) scene.sfxVolume = 1
    } else if (scene.keys[scene.root.env.OPEN]) {
        scene.sfxVolume -= 0.5 * delta
        if (scene.sfxVolume < 0) scene.sfxVolume = 0
    }


    if (scene.pause) return
    if (!scene.gameoverFlag) scene.statistic.playTime += delta
    scene.root.evolve(delta, scene)
}

var fpsa = 1, fpsc = 0
function render(delta) {
    if (!scene.root) return

    // render load screen
    if (scene.res.loaded < scene.res.expected) {
        scene.root.background.render(ctx, scene)
        var progress = Math.round((scene.res.loaded / scene.res.expected) * 100)
        var loadingStatus = "Loading Resources: " + progress + "%"
        ctx.fillStyle = "#FFFF00"
        ctx.font = '24px alien'
        ctx.textBaseline = 'bottom'
        var thw = ctx.measureText(loadingStatus).width / 2
        ctx.fillText(loadingStatus, scene.screenWidth/2 - thw, scene.screenHeight/2);
        return
    }

    scene.root.render(ctx, scene)

    // calculate fps
    if (fpsa >= 1 && delta > 0) {
        scene.statistic.fps = Math.round(fpsc/fpsa)
        fpsa = delta
        fpsc = 1
    } else {
        fpsc += 1
        fpsa += delta
    }
    /*
    ctx.font = '24px alien'
    ctx.textBaseline = 'bottom'
    ctx.fillStyle = "#FFFF00"
    ctx.fillText(status, 10, 30)
    ctx.fillText(scene.statusLine, 10, 60)
    */
}


function loop() {
    var now = Date.now()
    var delta = (now - lastFrame)/1000
    var fdelta = delta

    // show, react and update cycle
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
    render(fdelta)

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
    scene.keys[code] = true

    // out of pause
    if (scene.root.paused) {
        scene.root.paused = false
        delete scene.keys[scene.root.env.PAUSE]
    }

    e.preventDefault()
    e.stopPropagation()
    return false;
}

function handleKeyUp(e) {
    var code = e.which || e.keyCode
    if (code == 116 || code == 123){
        return true;
    }
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

