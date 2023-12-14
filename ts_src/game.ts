import {Squids} from "ts_src/squids";

Squids.load_assets("data", [
	"room1.png",
	"room2.png",
	"hallway.png",
	"person.png",
], [], (progress: number) => {
	console.log("Loading: " + progress + "%");

	if(progress >= 1.0) {
		 start();
	}
}, console.error);

function start() {

}