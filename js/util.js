/**
 * Created by shaddy on 22.04.17.
 */
var Util = {
    initChildren: function(obj, parent, scene){
        for (var i=0; i < obj.length; i++){
            obj[i].init.call(ctx, parent, scene);
        }
    },
    renderChildren: function(obj, ctx, scene){
        for (var i=0; i < obj.length; i++){
            obj[i].render.call(ctx, scene);
        }
    },
    evolveChildren: function(obj, delta, scene){
        for (var i=0; i < obj.length; i++){
            obj[i].evolve.call(delta, scene);
        }
    }
};