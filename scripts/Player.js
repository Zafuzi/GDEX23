let Player = new Squid();

function loadPlayer() {
	Player.image = Globals.assets["person.png"];

	Player.animations = {
		idleRight: {
			row: 0,
			columns: 2,
			frameRate: 100
		},
		idleLeft: {
			row: 1,
			columns: 2,
			frameRate: 100
		},
		walkingRight: {
			row: 2,
			columns: 8,
			frameRate: 15,
		},
		walkingLeft: {
			row: 3,
			columns: 8,
			frameRate: 15,
		},
	}

	Player.currentAnimation = Player.animations.idleRight;

	// used for sprite sheets
	Player.spriteWidth = 64;
	Player.spriteHeight = 128;

	Player.position = vec(500, Globals.sh - 300);
	Player.scale = 3;
	Player.speed = 0.8;
	Player.frame = 0;

	let go = vec(Player.position);

	Player.listen("tick", () => {
		const {x,y} = Player.position;

		if (go.x < x) {
			Player.position.add(-Player.speed, 0);
		}

		if (go.x > x) {
			Player.position.add(Player.speed, 0);
		}

		// limit player left
		if (x < 300) {
			Player.position.x = 300;
			go.x = 300;
		}

		const distanceToIdle = Math.abs(go.x - x);
		const isWalking = Player.currentAnimation === Player.animations.walkingLeft || Player.currentAnimation === Player.animations.walkingRight;

		if(isWalking && distanceToIdle <= 2) {
			Player.position.x = go.x;
			Player.currentAnimation = Player.currentAnimation === Player.animations.walkingLeft ? Player.animations.idleLeft : Player.animations.idleRight;
			Player.frame = 0;
		}

		if(Globals.tick % Player.currentAnimation.frameRate === 0) {
			Player.frame += 1;

			if(Player.frame > Player.currentAnimation.columns - 1) {
				Player.frame = 0;
			}
		}
	});

	Player.listen("pointerdown", (x, y) => {
		// console.log(x, y);
		go.x = Math.floor(x);

		if (go.x < Player.position.x) {
			Player.currentAnimation = Player.animations.walkingLeft;
			Player.frame = 0;
		}
		if (go.x > Player.position.x) {
			Player.currentAnimation = Player.animations.walkingRight;
			Player.frame = 0;
		}
	});

	Player.listen("draw", (d) => {
		const {x,y} = Player.position;
		const dx = x - (Player.spriteWidth * Player.scale)/2;
		const dy = y - (Player.spriteHeight * Player.scale)/2;

		let pivotX = Player.spriteWidth * 0.5;
		let pivotY = Player.spriteHeight * 0.5;

		// remove the top pixel row to remove black line
		let sourceStart = vec(
			Player.spriteWidth * Player.frame,
			(Player.currentAnimation.row * Player.spriteHeight) + 1
		);

		draw_image(Player.image, dx, dy,
			Player.opacity, Player.rotation, pivotX, pivotY,
			Player.scale, Player.scale,

			sourceStart.x, sourceStart.y,

			Player.spriteWidth, Player.spriteHeight,
		);

		// draw_rect_filled(dx, dy, 10, 10, "green", 1);
		debug(4, "Player position: " + Player.position.x + ", " + Player.position.y)
		debug(5, `PlayerAnimationFrame: ${Player.frame}`);
	});
}