(function() {
	// debug(true);
	load_assets("data", [
		"room1.png",
		"person-r-0.png",
		"person-l-0.png",
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

