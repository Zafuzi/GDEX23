(function() {
	// debug(true);
	load_assets("data", [
		"room1.png",
		"person-r-0.png",
		"person-r-walking/0.png",
		"person-r-walking/1.png",
		"person-r-walking/2.png",
		"person-r-walking/3.png",
		"person-r-walking/4.png",
		"person-r-walking/5.png",
		"person-r-walking/6.png",
		"person-r-walking/7.png",
		"person-l-0.png",
		"person-l-walking/0.png",
		"person-l-walking/1.png",
		"person-l-walking/2.png",
		"person-l-walking/3.png",
		"person-l-walking/4.png",
		"person-l-walking/5.png",
		"person-l-walking/6.png",
		"person-l-walking/7.png",
	], [], (progress, file, asset) => {
		Globals.assets[file] = asset;
		if (progress >= 1.0) {
			start();
		}
	}, console.error);
})();

function start() {
	loadBackground();
	loadPlayer();
	loadMono();
}

