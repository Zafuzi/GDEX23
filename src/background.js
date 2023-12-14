var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
import { Squids } from "./squids.js";
import { Game } from "./game.js";
var Background = /** @class */ (function (_super) {
    __extends(Background, _super);
    function Background() {
        var _this = _super.call(this) || this;
        var instance = _this;
        instance.active = true;
        instance.image = Game.assets["background-1.png"];
        instance.opacity = 1;
        instance.listen("tick", function () {
            instance.scale = Game.sw / instance.image.w;
            instance.position = Squids.vec(Game.sw / 2, Game.sh / 2);
        });
        instance.listen("draw", function () {
            var _a, _b;
            var dx = ((_a = instance.position) === null || _a === void 0 ? void 0 : _a.x) - (instance.image.w * instance.scale) / 2;
            var dy = ((_b = instance.position) === null || _b === void 0 ? void 0 : _b.y) - (instance.image.h * instance.scale) / 2;
            Squids.draw_image(instance.image, dx, dy, instance.opacity, instance.rotation, instance.pivot.x, instance.pivot.y, instance.scale, instance.scale);
        });
        return instance;
    }
    return Background;
}(Squids.Thing));
export { Background };
//# sourceMappingURL=background.js.map