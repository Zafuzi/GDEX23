import {Squids} from "./squids.js";
import {Background} from "./background.js";

Squids.initialize(60);

Squids.load_assets("data", [
	"background-1.png",
	"background-2.png",
	"background-3.png",
	"person.png",
], [], (progress: number, file: string, asset: Squids.sImage | HTMLAudioElement) => {
	// console.log(`Loading ${file}:`, progress * 100 + "%");
	Game.assets[file] = asset;
}, console.error).then(x => {
	console.log("done loading", x);

	Squids.debug_flag = true;

	const Main = new Squids.Thing();
	Main.active = true;
	Main.draw_priority(1000);

	Main.listen("draw", (sq: Squids.Thing, args: any[]) => {
		Squids.debug([
			"FPS: " + Squids.stats.fps,
			"TPS: " + Squids.stats.tps,
			"TICK: " + Squids.tick_count
		]);
	});

	Main.listen("resize", (dimensions: Squids.Vector) => {
		Game.sw = dimensions.x;
		Game.sh = dimensions.y;

		Game.halfWidth = Game.sw / 2;
		Game.halfHeight = Game.sh / 2;

		Squids.canvas.width = Game.sw;
		Squids.canvas.height = Game.sh;
	});

	start();
}).catch(console.error);

export namespace Game {
	export let sw: number = window.innerWidth;
	export let sh: number = window.innerHeight;

	export let halfWidth: number = sw / 2;
	export let halfHeight: number = sh / 2;

	export let dbg_num : number = 0;
	export function debug_seq() {
		dbg_num += 1;
		return dbg_num;
	}

	export const fonts: {[key: string]: Squids.sFont} = {
		monospace: Squids.load_font("monospace", 24, "white"),
	}

	export const assets = {};
	export const things = {};
}

function start() {
	Game.things["background"] = new Background();
}