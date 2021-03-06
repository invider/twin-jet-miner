/**
 * Created by shaddy on 23.04.17.
 */
var __uniqId = 0;
var ActiveElement = function(x, y, scene, imgs, animationDuration){
    imgs = imgs || [];
    animationDuration = animationDuration || 0;
    this.id = __uniqId ++;
    this.x = x;
    this.y = y;
    this.size = 1;
    this.scaleX = 1.0;
    this.scaleY = 1.0;
    this.airFrictionFactor = 1;
    this.velocity = 0;
    this.horzVelocity = 0;
    this.acceleration = 0;
    this.horzAcceleration = 0;
    this.scene = scene;
    this.type = "ActiveElement";
    this.hp = 100;
    this.imgs = imgs;
    this.currentImg = imgs[0];
    this.index = 0;
    this.frameTick = (animationDuration / imgs.length) / 1000.0;
    this.acum = 0.0;
};

ActiveElement.prototype.init = function(){
};

ActiveElement.prototype.kill = function(){
};

ActiveElement.prototype.hit = function(power){
    this.hp -= power;
    if (this.hp <= 0){
        this.scene.root.kill(this);
    }
};

ActiveElement.prototype.evolve = function(delta, scene){
    if(this.imgs.length > 1 && this.acum >= this.frameTick) {
        if(this.index === (this.imgs.length - 1))
            this.index = 0;
        else
            this.index += 1;
        this.currentImg = this.imgs[this.index];
        this.acum = 0.0;
    }
    else {
        this.acum += delta;
    }

    // autokill for remote areas
	if (this.x > scene.width + 200 ||
		this.y > scene.height + 200 ||
		this.x < -200 ||
		this.y < -200){
			scene.root.kill(this)
    }
};

ActiveElement.prototype.render = function(ctx){
    this.currentImg && ctx.drawImage(this.currentImg, this.x, this.y, this.scaleX, this.scaleY);
};

ActiveElement.prototype.toString = function(){
    return "[" + this.id + ": "+ this.type + " x:" + this.x + " y:" + this.y + "]";
};

