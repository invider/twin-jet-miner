/**
 * Created by Timur on 22.04.2017.
 */

var Bomb = function(ms, x, y, scene) {
    ActiveElement.call(this, x, y, scene, [ scene.res.img['ice-mono'] ], 100);
    this.counter = ms / 1000.0;
    this.type = "Bomb";
};
Util.extend(Bomb, ActiveElement);

Bomb.prototype.evolve = function(delta, scene) {
    ActiveElement.prototype.evolve.call(this, delta, scene);
    this.counter -= delta;
    if(this.counter <= 0) {
        this.explode();
    }
    scene.physics.clearEvents();
    scene.physics.evolve(this, delta);
};

Bomb.prototype.render = function(ctx, scene) {
    ActiveElement.prototype.render.call(this, ctx, scene);
};

Bomb.prototype.explode = function() {
    scene.root.planet.kill(this.x, this.y, 2);
    scene.root.killNearbyNodes(this.x, this.y, 2)
    scene.root.planet.kill(this);
    scene.attach(new Explosion(this.x, this.y, 0.2, 1000,
          this.scene.res.img['particle-white'], 2, 2, 0.5, 0,
          0, Math.PI*2,
          0.5, 2))
};

Util.extend(Bomb, PlanetElement);
