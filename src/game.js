import { Squids } from "./squids.js";
Squids.load_assets("data", [
    "background-1.png",
    "background-2.png",
    "background-3.png",
    "person.png",
], [], function (progress) {
    console.log("Loading: " + progress * 100 + "%");
    if (progress >= 1.0) {
        Game.start();
    }
}, console.error).then(function (x) {
    Game.start();
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
    function start() {
        Squids.initialize(100);
        Squids.debug_flag = true;
        var Main = new Squids.Thing();
        Main.draw_priority(1000);
        Main.listen(Squids.sListenerTypes.draw, function (sq, args) {
            Squids.debug([
                "FPS: " + Squids.stats.fps,
                "TPS: " + Squids.stats.tps,
                "TICK: " + Squids.tick_count
            ]);
        });
    }
    Game.start = start;
})(Game || (Game = {}));
//# sourceMappingURL=game.js.map