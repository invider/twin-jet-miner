/**
 * Created by shaddy on 22.04.17.
 */
var _titleBuilder = function (type) {
    switch (type) {
        case "U":
            return new UnbreakableWall();
        case " ":
            return new EmptySpace();
        case "P":
            return new PlayerSpawn();
        case "B":
            return new BaseNode();
        default:
            return new Wall(type);
    }
};

var PlanetProto = function () {
    var my = this;
    var field = [];
    for (var i = 0; i < arguments.length; i++) {
        var chunk = arguments[i].split("\n")
            .map(function (s) {
                return s.trim();
            });

        field = field.concat(chunk);
    }

    this.generate = function(scene) {
        this.x = 0;
        this.y = 0;
        this.xSize = field[0].length;
        this.ySize = field.length;
        this.children = [];
        for (var y = 0; y < this.ySize; y++) {
            var row = [];
            var txtRow = field[y];
            this.children.push(row);
            for (var x = 0; x < this.xSize; x++) {
                row.push(_titleBuilder(txtRow.charAt(x)));
            }
        }
    }
    /**
     *
     * @param x
     * @param y
     * @returns {Entity}
     */
    this.getElement = function(x, y){
        var xx = Math.round(x);
        var yy = Math.round(y);
        if (!this.children[yy] || !this.children[yy][xx]){
            var tmp = this._initElement(new EmptySpace(), this.scene)
            tmp.x = xx;
            tmp.y = yy;
            return tmp;
        }
        return this.children[yy][xx];
    };
    this.setElement = function(x, y, element){
        if (!this.children[y] || !this.children[y][x]){
            return element;
        }
        this.children[Math.floor(y)][Math.floor(x)] = element;
        return element;
    };
    
    this.removeNode = function(node){
        this.setElement(node.x, node.y, this._initElement(new EmptySpace(), this.scene))
    };

    this._initElement = function(node, scene){
        node.init(this, scene);
        return node;
    };
    this.eachNode = function(fn){
        for (var y = 0; y < this.ySize; y++) {
            for (var x = 0; x < this.xSize; x++) {
                if (fn(this.children[y][x], x, y) === false){
                    return false;
                }
            }
        }
    };

    this.init = function (parentNode, scene) {
        this.scene = scene;
        this.generate()
        this.eachNode(function(node, x, y) { my._initElement(node, this.scene)});
        this.eachNode(function(node, x, y) {
            node.x = x;
            node.y = y;
        });
    };

    this.evolve = function (delta, scene) {
        for (var k in this.children) {
            Util.evolveChildren(this.children[k], delta, scene);
        }
    };

    this.render = function (ctx, scene) {
        for (var k in this.children) {
            Util.renderChildren(this.children[k], ctx, scene);
        }
    };
    /**
     * returns nodelist of nodes in given raduis
     * NOTE: this is only planet nodes
     * @param x
     * @param y
     * @param r - radius to detect
     */
    this.getNearbyNodes = function(x, y, r){
        r = r || 1;
        var res = [];
        this.eachNode(function(node, xx, yy){
            if (Math.sqrt(Math.pow(x - xx, 2) + Math.pow(y - yy, 2)) <= r){
                res.push(this.entity[i]);
            }
        });
        return res;
    };
    this.kill = function(x,y, r){
        //
        //  TODO: fix and optimize this
        //
        var toKill = this.getNearbyNodes(x, y, r);
        for (var i=0; i < toKill.length; i++){
            this.removeNode(toKill[i]);
        }
    };
    /**
     * returns player spawn point
     * @returns {{x:number, y:number}}
     */
    this.getSpawnPoint = function(){
        var retVal = false;
        this.eachNode(function(node, x, y){
            if (node instanceof PlayerSpawn){
                retVal = {
                    x: x,
                    y: y
                }
            }
        });
        if (!retVal){
            throw new Error("Could not find player spawn!!!");
        }
        return retVal;
    };
};

/**
 * Planet initializers:
 * X: wall
 *
 * @type {PlanetProto}
 */
var _Planet = new PlanetProto(
    "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
    "X                                                         X",
    "X                XXXXXXXXXX           XXXXXXXXXX          X",
    "X                X        X           X        X          X",
    "X                X        X           X        X          X",
    "X                X        X           X        X          X",
    "X                X        X           X        X          X",
    "X                XXXXXXXXXX           XXXXXXXXXX          X",
    "X                             X                           X",
    "X                              X                          X",
    "X                              X                          X",
    "X                              X                          X",
    "X                            XXXX                         X",
    "X              X           BB                 X           X",
    "X         XXXXXXXXXXXXXXXXBBBBXXXXXXXXXXXXXXXX            X",
    "X           XXXXXXXXXXX  BBBBBBB                          X",
    "X              XXXXXXXXXXBB   P                           X",
    "UUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUU"
);
