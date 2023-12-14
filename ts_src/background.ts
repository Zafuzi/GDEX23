import {Squids} from "./squids.js";
import {Game} from "./game.js";

export class Background extends Squids.Thing {
	constructor() {
		super();

		const instance = this;

		instance.active = true;
		instance.image = Game.assets["background-1.png"];
		instance.opacity = 1;

		instance.listen("tick", () => {
			instance.scale = Game.sw / instance.image.w;
			instance.position = Squids.vec(Game.sw / 2, Game.sh / 2);
		});

		instance.listen("draw", () => {
			const dx = instance.position?.x - (instance.image.w * instance.scale)/2;
			const dy = instance.position?.y - (instance.image.h * instance.scale)/2;

			Squids.draw_image(instance.image, dx, dy, instance.opacity, instance.rotation, instance.pivot.x, instance.pivot.y, instance.scale, instance.scale);
		});

		return instance;
	}
}
