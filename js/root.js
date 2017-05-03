/** @type Entity */

var _$root = {
    entity: [],
    player: false,
    paused: false,

    init: function(parent, scene) {
        // Create the World!
        this.env = _$env
        this.background = _background;
        this.background.init(this, scene)
        this.planet = levels[scene.level % levels.length];
        this.scene = scene;
        this.planet.init(this, scene);
        this.evilSource = _evilSource;
        this.effect = new LayerNode()
        this.title = new LayerNode()
        this.player = false;
        // fix scene size based on the planet
        scene.width = this.planet.xSize
        scene.height = this.planet.ySize

        // game over tag
        this.gameOverTag = new FloatingText(0, -100,
                "Game Over", "#C02030", "64px alien", "center")
        this.gameOverTag.render = function(ctx, scene) {
            if (!scene.gameoverFlag) return;
            FloatingText.prototype.render.call(this, ctx, scene)
        }
        this.title.attach(this.gameOverTag)

        // stat
        this.fuelTag = new FloatingText(10, 10, "F", "#FF8000", "24px alien")
        this.title.attach(this.fuelTag)
        this.bombTag = new FloatingText(10, 40, "B", "#FF8000", "24px alien")
        this.title.attach(this.bombTag)
        this.wallTag = new FloatingText(10, 70, "W", "#FF8000", "24px alien")
        this.title.attach(this.wallTag)
        this.turretTag = new FloatingText(10, 100, "T", "#FF8000", "24px alien")
        this.title.attach(this.turretTag)
        this.heatTag = new FloatingText(10, 130, "T", "#FF8000", "24px alien")
        this.title.attach(this.heatTag)

        this.levelTag = new FloatingText(-10, 10, "L", "#FFFF00", "24px alien", "right")
        this.title.attach(this.levelTag)
        this.waveTag = new FloatingText(-10, 40, "W", "#FF0090", "24px alien", "right")
        this.title.attach(this.waveTag)

        this.playtimeTag = new FloatingText(10, -10, "P", "#FF8000", "24px alien", "bottom")
        this.title.attach(this.playtimeTag)

        this.fpsTag = new FloatingText(-10, -10, "FPS", "#C04020", "24px alien", "edge")
        this.title.attach(this.fpsTag)
    },

    explode: function(type, src) {
        switch(type) {
        case 'wall':
            this.effect.attach(new Explosion(src.x+0.5, src.y+0.5, 0.1, 1500,
                    scene.res.img['particle-white'], 0.4, 0.4, 0.7, 0.5,
                    0, Math.PI*2,
                    0.5, 0.5))
            this.scene.sfx('hit-1', 0.2)
            break;
        case 'bomb':
            this.effect.attach(new Explosion(src.x+0.5, src.y+0.5, 0.2, 1000,
                  this.scene.res.img['particle-white'], 2, 1, 0.5, 0,
                  0, Math.PI*2,
                  0.5, 2))
            this.scene.sfx('explosion-2', 0.3)
            break;
        case 'player':
            this.effect.attach(new Explosion(src.x+0.5, src.y+0.5, 0.2, 1500,
                  this.scene.res.img['particle-yellow'], 2, 1, 1, 0.5,
                  0, Math.PI*2,
                  0.5, 0.5))
            this.scene.sfx('explosion-3', 0.5)
            break;
        case 'digger':
            this.effect.attach(new Explosion(src.x+0.5, src.y+0.5, 0.2, 1500,
                  this.scene.res.img['particle-red'], 2, 1, 1, 0.5,
                  0, Math.PI*2,
                  0.5, 0.5))
              this.scene.sfx('explosion-1', 0.3)
            break;
        case 'gun':
            this.effect.attach(new Explosion(src.x+0.5, src.y+0.5, 0.2, 1500,
                  this.scene.res.img['particle-blue'], 2, 1, 1, 0.5,
                  0, Math.PI*2,
                  0.5, 0.5))
            this.scene.sfx('explosion-3', 0.3)
            break;
        case 'respawn':
            this.effect.attach(new Explosion(
                src.x+0.5, src.y+0.5,
                0.1, 6000,
                this.scene.res.img['particle-cyan'],
                0.5, 0, 4, 0, // size/v, speed/v
                0, Math.PI*2,
                0.7, 0.2))
            this.scene.sfx('respawn')
            break;
        case 'digger-spawn':
            this.effect.attach(new Explosion(
                src.x+0.5, src.y+0.5,
                0.1, 5000,
                this.scene.res.img['particle-red'],
                0.5, 0, 4, 0, // size/v, speed/v
                0, Math.PI*2,
                0.5, 0.1))
            this.scene.sfx('digger-spawn', 0.2)
            break;
        }
    },
    
    spawnPlayer: function(){
        if (!this.player) {
            if (this.scene.statistic.lifes > 0 && !this.scene.gameoverFlag) {
                this.scene.statistic.lifes--;
                var spawnPoint = this.planet.getSpawnPoint();
                this.player = new Player(spawnPoint.x, spawnPoint.y, this.scene);
                this.entity.push(this.player);
                this.explode('respawn', this.player);
            } else {
                this.scene.gameOver();
            }
        }
    },

    evolve: function(delta, scene) {
        if (scene.keys[this.env.ESC]){
            delete scene.keys[this.env.ESC]
            scene.gameRestart()
        }
        if (scene.keys[this.env.F1]){
            delete scene.keys[this.env.F1]
            scene.levelComplete()
        }
        if (scene.keys[this.env.PAUSE]) {
            delete scene.keys[this.env.PAUSE]
            this.paused = true
        }
        if (this.paused) return

        if (!this.player){
            this.spawnPlayer();
        }
        this.background.evolve(delta, scene)
        this.evilSource.evolve(delta, scene)
        this.planet.evolve(delta, scene);
        Util.evolveChildren(this.entity, delta, scene);
        this.effect.evolve(delta, scene)
        this.title.evolve(delta, scene)

        scene.statusLine = this.scene.statistic.toString();
        scene.checkCompletion();

        // update stat
        if (scene.root.player) {
            this.fuelTag.label = "Fuel: " + Math.floor(scene.root.player.stats.fuel)
        }
        this.bombTag.label = "Bombs: " + scene.statistic.bombs
        this.wallTag.label = "Blocks: " + scene.statistic.walls
        this.turretTag.label = "Turrets: " + scene.statistic.turrets
        this.heatTag.label = "Heat: " +  (scene.root.player ? Math.floor(scene.root.player.stats.overheat*100) : 0) + "°"

        this.levelTag.label = "Level: " + (scene.level+1)
        this.waveTag.label = "Wave: " + (scene.statistic.diggersToSpawn
                - scene.statistic.spawnedDiggers)
        this.playtimeTag.label = "Time: " + Math.floor((scene.statistic.playTime % 3600) / 60)
                + ":" + Math.floor(scene.statistic.playTime % 60)

        this.fpsTag.label = "FPS: " + scene.statistic.fps

        // game over titles
        if (scene.gameoverFlag) {
            scene.gameoverTick += delta
            if (scene.gameoverTick > 2 && scene.gameoverState == 0) {
                scene.gameoverState++
                this.showTitle("Credits", "#80FF20", scene)
            } else if (scene.gameoverTick > 7 && scene.gameoverState == 1) {
                scene.gameoverState++
                this.showTitle("Anatoliy Yakushko", "#FFFF00", scene)
            } else if (scene.gameoverTick > 11 && scene.gameoverState == 2) {
                scene.gameoverState++
                this.showTitle("Boris Sheludchenko", "#FFFF00", scene)
            } else if (scene.gameoverTick > 15 && scene.gameoverState == 3) {
                scene.gameoverState++
                this.showTitle("Tymur Zablockiy", "#FFFF00", scene)
            } else if (scene.gameoverTick > 19 && scene.gameoverState == 4) {
                scene.gameoverState++
                this.showTitle("Igor Khotin", "#FFFF00", scene)
            } else if (scene.gameoverTick > 25 && scene.gameoverState == 5) {
                scene.gameoverState++
                this.showTitle("Specially for Ludum Dare 38 Jam", "#FFC000", scene)
            }
        }
    },

    showTitle: function(msg, color, scene) {
        var title = new FloatingText(-50, scene.screenHeight, msg, color, "32px alien", "right")
        var speed = 20
        title.dy = -speed
        title.lifespan = (scene.screenHeight/2)/speed // live for half a screen
        title.fadein = 2
        title.fadespan = 2
        scene.root.title.attach(title)
    },

    _killNode: function(node){
        //
        //  TODO: optimize this
        //
        var counter = 0;
        while (counter < this.entity.length){
            if (this.entity[counter] == node){
                this.entity.splice(counter, 1);
                counter --;
                if (node.kill) node.kill();
            }
            counter ++;
        }
    },
    killNearbyNodes: function(x, y, r, filter){
        var my = this;
        filter = filter || function(){ return true; };
        this.getNearbyNodes(x,y,r)
            .filter(filter)
            .forEach(function(node){
                my.kill(node)
            });
    },
    /**
     * returns nodelist of nodes in given raduis
     * NOTE: this is only active nodes
     * @param x
     * @param y
     * @param r - radius to detect
     */
    getNearbyNodes: function(x, y, r){
        r = r || 0.5;
        var res = [];
        for (var i=0; i < this.entity.length; i++){
            if (Math.sqrt(Math.pow(x - this.entity[i].x, 2) + Math.pow(y - this.entity[i].y, 2)) <= r){
                res.push(this.entity[i]);
            }
        }
        return res;
    },
    /**
     * kills only active units on coordinates
     * @param toKill
     */
    kill:function(toKill){
        if (!(toKill instanceof Array)){
            toKill = [toKill];
        }
        //
        //  TODO: fix and optimize this
        //
        for (var i=0; i < toKill.length; i++){
            this._killNode(toKill[i]);
        }
    },
    // Actual GameOver event
    portalKilled: function(){
        this.scene.gameoverTick = 0;
        this.scene.gameoverState = 0;
        this.scene.gameOver();
        this.scene.sfx('gameover')
    },
    render: function(ctx, scene) {
        this.background.render(ctx, scene)

        // translate to camera view
        var wFactor = scene.screenWidth / scene.width
        var hFactor = scene.screenHeight / scene.height
        var scaleFactor = Math.min(wFactor, hFactor)
        var verticalEdge =  scene.screenHeight - (scene.height * scaleFactor)
        var horizontalEdge = scene.screenWidth - (scene.width * scaleFactor)
        ctx.translate(horizontalEdge/2,verticalEdge/2)
        ctx.scale(scaleFactor, scaleFactor);

        ctx.imageSmoothingEnabled = true
        this.planet.render(ctx, scene);

        ctx.imageSmoothingEnabled = false
        Util.renderChildren(this.entity, ctx, scene);

        // draw effects
        ctx.imageSmoothingEnabled = true
        this.effect.render(ctx, scene)

        // transform back to origins
        ctx.setTransform(1, 0, 0, 1, 0, 0)

        // draw titles
        this.title.render(ctx, scene)
    }
};
