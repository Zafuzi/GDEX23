let Player = new Squid();

function loadPlayer() {
	Player.image = Globals.assets["person-r-0.png"];
	Player.position = vec(500, Globals.sh - 300);
	Player.scale = 3;
	Player.speed = 4;

	let go = vec(Player.position);

	const walkingRightPrefix = "person-r-walking/";
	const walkingLeftPrefix = "person-l-walking/";

	const walkingRightAnimation = new ImgSet(walkingRightPrefix, 8);
	const walkingLeftAnimation = new ImgSet(walkingLeftPrefix, 8);

	const idleRightAnimation = Globals.assets["person-r-0.png"];
	const idleLeftAnimation = Globals.assets["person-l-0.png"];

	Player.draw_priority(110);

	const animationFrameRate = 10;
	let animationFrame = 0;
	let activeAnimation = walkingRightAnimation;
	Player.listen("tick", () => {

		if(activeAnimation && Globals.tick % animationFrameRate === 0) {
			animationFrame++;
			if(animationFrame >= activeAnimation.length) {
				animationFrame = 0;
			}
		}

		if (go.x < Player.position.x) {
			Player.position.add(-Player.speed, 0);
		}

		if (go.x > Player.position.x) {
			Player.position.add(Player.speed, 0);
		}

		// limit player left
		if (Player.position.x < 300) {
			Player.position.x = 300;
			go.x = 300;
		}

		if(Math.abs(go.x - Player.position.x) <= Player.speed) {
			Player.position.x = go.x;
		}

		if(activeAnimation && go.x === Player.position.x) {
			Player.image = (activeAnimation === walkingRightAnimation) ? idleRightAnimation : idleLeftAnimation;
			activeAnimation = null;
		}

		if(activeAnimation) {
			Player.image = activeAnimation[animationFrame];
		}
	});

	Player.listen("pointerdown", (x, y) => {
		// console.log(x, y);
		go.x = Math.floor(x);
		if (go.x < Player.position.x) {
			Player.image = Globals.assets["person-l-0.png"];
			activeAnimation = walkingLeftAnimation;
		}
		if (go.x > Player.position.x) {
			Player.image = Globals.assets["person-r-0.png"];
			activeAnimation = walkingRightAnimation;
		}

	});
}