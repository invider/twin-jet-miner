/**
 * Created by shaddy on 22.04.17.
 */
var Util = {
    renderChildren: function(obj, ctx, scene){
        for (var i=0; i < obj.length; i++){
            obj[i].render.call(ctx, scene);
        }
    },
    evolveChildren: function(obj, delta, scene){
        for (var i=0; i < obj.length; i++){
            obj[i].evolve.call(delta, scene);
        }
    },
    point: function(x0, v0) {
    	return {
    		x: x0 || 0,
    		v: v0 || 0
    	}
    },
    fall: function(point, delta) {
    	var x0 = point.x || 0;
    	var v0 = point.v || 0;
    	point.x = x0 + v0 * delta;
    	point.v = v0 + 9.8 * delta;
    },
    bound: function(point, a, b) {
    	var x = point.x || 0;
    	var v = point.v || 0;
		if(x < Math.min(a, b)) {
			point.x = Math.min(a, b);
			point.v = 0
		} else if(x > Math.max(a, b)) {
			point.x = Math.max(a, b);
			point.v = 0
		}
    }
};