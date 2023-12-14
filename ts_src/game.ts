import {Squids} from "./squids.js";

Squids.load_assets("data", [
	"background-1.png",
	"background-2.png",
	"background-3.png",
	"person.png",
], [], (progress: number) => {
	console.log("Loading: " + progress * 100 + "%");

	if(progress >= 1.0) {
		 Game.start();
	}
}, console.error).then((x) => {
	Game.start();
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

	export function start() {
		Squids.initialize(100);

		Squids.debug_flag = true;

		const Main = new Squids.Thing();
		Main.draw_priority(1000);

		Main.listen(Squids.sListenerTypes.draw, (sq: Squids.Thing, args: any[]) => {
			Squids.debug([
				"FPS: " + Squids.stats.fps,
				"TPS: " + Squids.stats.tps,
				"TICK: " + Squids.tick_count
			]);
		});
	}
}