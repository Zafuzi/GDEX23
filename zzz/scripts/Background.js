const Background = new Squid();
Background.draw_priority(0);

const Lighting = new Squid();
Lighting.draw_priority(2);

function loadBackground() {
	Background.image = Globals.assets["room1.png"];
	Background.px = 0;
	Background.py = 0;
	Background.opacity = 1;

	Background.listen("tick", () => {
		Background.scale = Globals.canvas.width / Background.image.w;
		Background.position = vec(Globals.canvas.width / 2, Globals.canvas.height/2);
	});

	Background.listen("draw", () => {
		const dx = Background.position.x - (Background.image.w * Background.scale)/2;
		const dy = Background.position.y - (Background.image.h * Background.scale)/2;

		draw_rect_filled(0, 0, Globals.sw, Globals.sh, "rgb(72,72,100)");
		draw_image(Background.image, dx, dy, Background.opacity, 0, 0, 0, Background.scale, Background.scale);
	})
}

function loadLighting() {
	Lighting.image = null;

	Lighting.listen("tick", () => {
		Lighting.scale = Background.scale
		Lighting.position = Background.position;
	});

	Lighting.listen("draw", () => {
		if(Lighting.image) {
			const dx = Lighting.position.x - (Lighting.image.w * Lighting.scale)/2;
			const dy = Lighting.position.y - (Lighting.image.h * Lighting.scale)/2;
			draw_image(Lighting.image, dx, dy, Lighting.opacity, 0, 0, 0, Lighting.scale, Lighting.scale);
		}
	});
}