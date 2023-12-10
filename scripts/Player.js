let Player = new Squid();

function loadPlayer() {
	Player.image = Globals.assets["person-r-0.png"];
	Player.position = vec(500, Globals.sh - 300);
	Player.scale = 3;

	let go = vec(Player.position);

	Player.draw_priority(110);

	Player.listen("tick", () => {
		if (go.x < Player.position.x) {
			Player.position.add(-2, 0);
		}
		if (go.x > Player.position.x) {
			Player.position.add(2, 0);
		}

		// limit player left
		if (Player.position.x < 300) {
			Player.position.x = 300;
			go.x = 300;
		}
	});

	Player.listen("pointerdown", (x, y) => {
		console.log(x, y);
		go.x = Math.floor(x);
		if (go.x < Player.position.x) {
			Player.image = Globals.assets["person-l-0.png"];
		}
		if (go.x > Player.position.x) {
			Player.image = Globals.assets["person-r-0.png"];
		}
	});
}