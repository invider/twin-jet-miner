/** @type Entity */
var _$root = {
    x: 100,
    y: 100,

    init: function(parent, scene) {

    },

    evolve: function(delta, scene) {
        this.x += 10*delta;
        this.y += 10*delta;
    },

    render: function(ctx, scene) {
        ctx.strokeStyle="red";
        ctx.rect(this.x,this.y,40,40);
        ctx.stroke();
    }
};
