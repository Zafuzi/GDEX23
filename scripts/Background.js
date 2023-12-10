const Background = new Squid();

function loadBackground() {
	Background.image = Globals.assets["room1.png"];
	Background.px = 0;
	Background.py = 0;
	Background.opacity = 1;

	Background.listen("tick", () => {
		Background.scale = Globals.canvas.width / Background.image.w;
		Background.position = vec(Globals.canvas.width / 2, Globals.canvas.height/2);
	});
}