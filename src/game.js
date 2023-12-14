import { Squids } from "./squids.js";
import { Background } from "./background.js";
Squids.initialize(60);
Squids.load_assets("data", [
    "background-1.png",
    "background-2.png",
    "background-3.png",
    "person.png",
], [], function (progress, file, asset) {
    // console.log(`Loading ${file}:`, progress * 100 + "%");
    Game.assets[file] = asset;
}, console.error).then(function (x) {
    console.log("done loading", x);
    Squids.debug_flag = true;
    var Main = new Squids.Thing();
    Main.active = true;
    Main.draw_priority(1000);
    Main.listen("draw", function (sq, args) {
        Squids.debug([
            "FPS: " + Squids.stats.fps,
            "TPS: " + Squids.stats.tps,
            "TICK: " + Squids.tick_count
        ]);
    });
    Main.listen("resize", function (dimensions) {
        Game.sw = dimensions.x;
        Game.sh = dimensions.y;
        Game.halfWidth = Game.sw / 2;
        Game.halfHeight = Game.sh / 2;
        Squids.canvas.width = Game.sw;
        Squids.canvas.height = Game.sh;
    });
    start();
}).catch(console.error);
export var Game;
(function (Game) {
    Game.sw = window.innerWidth;
    Game.sh = window.innerHeight;
    Game.halfWidth = Game.sw / 2;
    Game.halfHeight = Game.sh / 2;
    Game.dbg_num = 0;
    function debug_seq() {
        Game.dbg_num += 1;
        return Game.dbg_num;
    }
    Game.debug_seq = debug_seq;
    Game.fonts = {
        monospace: Squids.load_font("monospace", 24, "white"),
    };
    Game.assets = {};
    Game.things = {};
})(Game || (Game = {}));
function start() {
    Game.things["background"] = new Background();
}
//# sourceMappingURL=game.js.map