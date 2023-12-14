const bedroom = {
	load: loadBedroom,
	unload: unloadBedroom,
	next: "hallway",
	limits: {
		left: 300,
		right: 100
	}
}

function loadBedroom(fromDirection) {
	console.log("Bedroom loaded", fromDirection);
	Background.image = Globals.assets["background-1.png"];

	Player.position.x = fromDirection === DIRECTIONS.FROM_RIGHT ? Globals.sw - bedroom.limits.right : bedroom.limits.left;
	Player.go = Player.position;
}

function unloadBedroom() {

}