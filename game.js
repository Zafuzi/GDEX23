(function() {
	// debug(true);
	load_assets("data", [
		"room1.png",
		"room2.png",
		"hallway.png",
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
	loadPlayer();
	loadMono();

	addScene("bedroom", bedroom);
	addScene("hallway", hallway);
	addScene("kitchen", kitchen);

	loadScene("bedroom", 0);
}

