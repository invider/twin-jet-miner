var Digger = function(params) {
	var coord = Utils.point(params.x, params.y)
	return {
		evolve : function(delta) {
			Utils.fall(point, delta);
			Utils.boundY(point, 0, 200);
		},
		render : function(ctx) {
		}
	}
}