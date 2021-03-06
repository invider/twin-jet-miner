var PlayerSpawn = function () {
    EmptySpace.call(this);
    this.hp = 1000;

    this.render = function (ctx, scene) {
        ctx.drawImage(scene.res.img['door-1'],this.x, this.y, this.width, this.height);
    };
    
    this.hit = function(force){
        this.hp -= force;
        if (this.hp <=0 ){
            this.scene.root.portalKilled();
            this.scene.root.planet.kill(this);
        }
    }
};

Util.extend(PlayerSpawn, EmptySpace);
