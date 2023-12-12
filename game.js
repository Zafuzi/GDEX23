(function() {
	// debug(true);
	load_assets("data", [
		"background-1.png",
		"background-2.png",
		"background-3.png",
		"person.png",
	], [], (progress, file, asset) => {
		Globals.assets[file] = asset;
		if (progress >= 1.0) {
			start();
		}
	}, console.error);
})();

function start() {
	loadSceneManager();
	loadBackground();
	loadLighting();
	loadPlayer();
	loadMono();

	addScene("bedroom", bedroom);
	addScene("hallway", hallway);
	addScene("kitchen", kitchen);

	loadScene("hallway", 0);
}

