const kitchen = {
	load: loadKitchen,
	unload: unloadKitchen,
	previous: "hallway",
	limits: {
		right: 300,
		left: 100
	}
}

function loadKitchen(fromDirection) {
	console.log("Kitchen loaded");
	Background.image = Globals.assets["background-3.png"];

	Player.position.x = fromDirection === DIRECTIONS.FROM_RIGHT ? Globals.sw - kitchen.limits.right : kitchen.limits.left;
	Player.go = Player.position;
}

function unloadKitchen() {
}