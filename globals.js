const {
	Squid, vec, load_assets, load_font,
	draw_text, draw_rect_filled, draw_image,
	debug
} = Squids;

const Globals = {
	sw: window.innerWidth,
	sh: window.innerHeight,
	halfHeight: window.innerWidth / 2,
	halfWidth: window.innerHeight / 2,
	resolution: {
		width: 1280,
		height: 720
	},
	assets: {},
	fonts: {
		monospace: load_font("monospace", 24, "white")
	},
	canvas: null,
	ctx: null,
	tick: 0
};

(function () {
	Globals.canvas = document.getElementById("SquidsCanvas");
	Globals.ctx = Globals.canvas.getContext("2d");
	Globals.ctx.imageSmoothingEnabled = false;

	const Main = new Squid();

	Main.listen("tick", () => {
		Globals.tick++;
		Globals.sw = window.innerWidth;
		Globals.sh = window.innerHeight;
		Globals.halfWidth = Globals.sw / 2;
		Globals.halfHeight = Globals.sh / 2;
		Globals.canvas.width = Globals.sw;
		Globals.canvas.height = Globals.sh;
	});

	Main.listen("draw", () => {
		draw_text("Tick: " + Globals.tick, 10, 24, Globals.fonts.monospace, "left");
		draw_text(`Screen: ${Globals.sw}x${Globals.sh}`, 10, 48, Globals.fonts.monospace, "left");
		draw_text(`Halves: ${Globals.halfWidth}x${Globals.halfHeight}`, 10, 72, Globals.fonts.monospace, "left");
	});

	Main.draw_priority(100);
})();

function ImgSet( base, min_len ) {
	let set = [];
	let len = 0;

	for( len = 0; len < min_len; len++ ) {
		const img = Globals.assets[ base + len + ".png" ];
		if( ! img ) { break; }
		set.push( img );
	}

	return set;
}
