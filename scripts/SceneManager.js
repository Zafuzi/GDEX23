let SceneManager = new Squid();

const DIRECTIONS = {
	FROM_RIGHT: 1,
	FROM_LEFT: -1
}

function loadSceneManager() {
	SceneManager.activeScene = null;
	SceneManager.scenes = {};

	SceneManager.draw_priority(100);

	let transitionOpacity = 0;
	SceneManager.transitionDir = 0;

	SceneManager.listen("tick", () => {
		if(SceneManager.transition) {
			transitionOpacity += (0.05 * SceneManager.transitionDir);

			if(transitionOpacity >= 1) {
				SceneManager.transitionDir = -1;

				const newScene = SceneManager.nextScene || SceneManager.previousScene;
				if(newScene) {
					let fromDir = SceneManager?.previousScene ? DIRECTIONS.FROM_RIGHT : DIRECTIONS.FROM_LEFT;
					console.log(fromDir);
					loadScene(newScene, fromDir);

					SceneManager.nextScene = null;
					SceneManager.previousScene = null;
				}
			}

			if(transitionOpacity <= 0) {
				console.log("Transition Over");
				transitionOpacity = 0;
				SceneManager.transitionDir = 0;
				SceneManager.transition = false;
			}
		}
	})

	SceneManager.listen("draw", () => {
		if(debug())
		{
			if(SceneManager.activeScene?.limits) {
				 const limitLeft = SceneManager.activeScene.limits?.left;
				 const limitRight = SceneManager.activeScene.limits?.right;

				 if(limitRight) {
					 let color = SceneManager.activeScene.previous ? "blue" : "red";
					 draw_rect_filled(0, 0, limitLeft, Globals.sh, color, 0.3);
				 }

				 if(limitLeft) {
					 let color = SceneManager.activeScene.next ? "blue" : "red";
					 draw_rect_filled(Globals.sw - limitRight, 0, limitRight, Globals.sh, color, 0.3);
				 }
			}
		}

		if(SceneManager.transition) {
			draw_rect_filled(0, 0, Globals.sw, Globals.sh, "black", transitionOpacity);
		}
	})
}

function addScene(sceneName, scene) {
	if(!sceneName || !scene)
	{
		throw new Error("sceneName or scene is null");
	}

	SceneManager.scenes[sceneName] = scene;
}

function nextScene() {
	const activeScene = SceneManager.activeScene;

	if(!activeScene || !activeScene.next) {
		return false;
	}

	SceneManager.transition = true;
	SceneManager.transitionDir = 1;
	SceneManager.nextScene = activeScene.next;
	return true;
}

function previousScene() {
	const activeScene = SceneManager.activeScene;

	if(!activeScene || !activeScene.previous) {
		return false;
	}

	SceneManager.transition = true;
	SceneManager.transitionDir = 1;
	SceneManager.previousScene = activeScene.previous;
	return true;
}

function loadScene(sceneName, fromDirection) {
	const scene = SceneManager.scenes[sceneName];

	if(!scene)
	{
		throw new Error(`No scene with name ${sceneName} exists, did you add it?`);
	}

	SceneManager.activeScene?.unload();
	scene?.load(fromDirection);
	SceneManager.activeScene = scene;
}

function unloadScene(sceneName) {
	const scene = SceneManager.scenes[sceneName];
	if(!scene)
	{
		throw new Error(`No scene with name ${sceneName} exists, did you add it?`);
	}

	SceneManager.scenes[sceneName]?.unload();
	SceneManager.activeScene = null;
}