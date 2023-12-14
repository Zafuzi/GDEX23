const hallway = {
	load: loadHallway,
	unload: unloadHallway,
	previous: "bedroom",
	next: "kitchen",
	limits: {
		right: 100,
		left: 100
	}
}

function loadHallway(fromDirection) {
	console.log("Hallway loaded");
	Background.image = Globals.assets["background-2.png"];

	Player.position.x = fromDirection === DIRECTIONS.FROM_RIGHT ? Globals.sw - hallway.limits.right : hallway.limits.left;
	Player.go = Player.position;
}

function unloadHallway() {

}