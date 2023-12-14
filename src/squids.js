/*!

Squids - An HTML5 canvas-based game engine and a state of mind.

Copyright 2023  Sleepless Software Inc.  All Rights Reserved
See the LICENSE.txt file included with the Squids source code for licensing information

*/
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
export var NOP = function () {
};
export var Squids;
(function (Squids) {
    var sListenerTypes;
    (function (sListenerTypes) {
        sListenerTypes["physics"] = "physics";
        sListenerTypes["tick"] = "tick";
        sListenerTypes["animate"] = "animate";
        sListenerTypes["draw"] = "draw";
        sListenerTypes["pointerdown"] = "pointerdown";
    })(sListenerTypes = Squids.sListenerTypes || (Squids.sListenerTypes = {}));
    Squids.version = "6.4.0";
    Squids.code_name = "Quiver";
    //	-	-	-	-	-	-	-	-	-	-	-	-	-
    //  API
    //	-	-	-	-	-	-	-	-	-	-	-	-	-
    // Internal vars
    var sqrt = Math.sqrt, sin = Math.sin, cos = Math.cos, floor = Math.floor, atan2 = Math.atan2, PI = Math.PI;
    var PI2 = PI * 2; // 1 full rotation (360 degrees)
    var PIH = PI / 2; // one half of PI
    var body = document.body;
    //	-	-	-	-	-	-	-	-	-	-	-	-	-
    // Debugging
    // When debug mode is on, the messages in the debug_messages array
    // are drawn to the display overlaying everything else
    // as well as lines that show the collision rects/circles,
    // image boundaries and origins, etc.
    //      debug()                 return status of debug flag; true = debug mode is on
    //      debug( flag )           set status of debug flag
    //      debug( n, msg )         set debug msg number 'n' to 'msg'
    //      debug( [ msg, ... ] )   set all debug_messages
    //	-	-	-	-	-	-	-	-	-	-	-	-	-
    Squids.debug_flag = false;
    var debug_messages = [];
    function debug(row, content) {
        if (typeof row === "boolean") {
            Squids.debug_flag = row;
            return Squids.debug_flag;
        }
        if (typeof row === "number") {
            debug_messages[row] = content;
            return Squids.debug_flag;
        }
        if (Array.isArray(row)) {
            debug_messages = row;
            return Squids.debug_flag;
        }
        return Squids.debug_flag;
    }
    Squids.debug = debug;
    //	-	-	-	-	-	-	-	-	-	-	-	-	-
    // last known pointer x,y locations taken from mouse events
    Squids.pointer = { x: 0, y: 0 };
    // Global key up/down status
    // e.g., if( keys[ 'p' ] ) { the "p" key is down }
    // Only useful for polling, not detecting key events
    Squids.keys = {};
    // Return an every increasing integer which can be used
    // as a unique id.
    Squids.seq_num = 0;
    function seq() {
        Squids.seq_num += 1;
        return Squids.seq_num;
    }
    Squids.seq = seq;
    // vec is a vector object and is used extensively by Squid objects and
    // other functions.
    // They are used to define x,y positions and w,h sizes.
    // The vec() function always creates a new object.
    // Usages:
    // 		vec()			=  { x:0, y:0, z:0 }
    // 		vec( 1 )		=  { x:1, y:1, z:1 }
    // 		vec( 1, 2 )		=  { x:1, y:2, z:0 }
    // 		vec( 1, 2, 3 )	=  { x:1, y:2, z:3 }
    // 		vec( v )		=  { x:v.x, y:v.y, z:v.z } (clones a vec)
    var Vector = /** @class */ (function () {
        function Vector(x, y, z) {
            this.x = x;
            this.y = y || 0;
            this.z = z || 0;
        }
        Vector.prototype.add = function (vec1) {
            this.x += vec1.x;
            this.y += vec1.y;
            this.z += vec1.z;
            return this;
        };
        Vector.prototype.sub = function (vec1) {
            this.x -= vec1.x;
            this.y -= vec1.y;
            this.z -= vec1.z;
            return this;
        };
        Vector.prototype.mlt = function (vec1) {
            this.x *= vec1.x;
            this.y *= vec1.y;
            this.z *= vec1.z;
            return this;
        };
        Vector.prototype.div = function (vec1) {
            this.x /= vec1.x;
            this.y /= vec1.y;
            this.z /= vec1.z;
            return this;
        };
        Vector.prototype.length = function () {
            return sqrt((this.x * this.x) + (this.y * this.y) + (this.z * this.z));
        };
        return Vector;
    }());
    Squids.Vector = Vector;
    function vec(x, y, z) {
        return new Vector(x, y, z);
    }
    Squids.vec = vec;
    //	-	-	-	-	-	-	-	-	-	-	-	-	-
    // Return a font-ish object that you can pass into draw_text().
    // This simply uses any font that the browser can provide.
    // TODO support bold/italic/underline?
    function load_font(face, size, color) {
        return {
            height: size,
            face: face,
            style: "" + size + "px " + face,
            color: color
        };
    }
    Squids.load_font = load_font;
    // Set up default font(s)
    var DBG_FONT_SIZE = 16;
    var DBG_LINE_HEIGHT = DBG_FONT_SIZE + (DBG_FONT_SIZE * 0.1);
    var DBG_SHADOW_OFFSET = DBG_FONT_SIZE * 0.1;
    var dbg_font = null;
    var dbg_font_shadow = null;
    //	-	-	-	-	-	-	-	-	-	-	-	-	-
    // load and return an image object given its path.
    function load_image(path, okay, fail) {
        var e = document.createElement("img");
        e.src = path;
        e.style.display = "none";
        e.onload = function () {
            var img = {
                w: e.width,
                h: e.height,
                data: e,
                smoothing: true,
                size: function () {
                    return vec(img.w, img.h);
                },
                make_radius: function () {
                    var size = img.size(); // get image w, h
                    return ((size.x + size.y) / 2) * 0.5; // half of average of w and h
                }
            };
            e.remove(); // remove from DOM - not needed anymore
            if (typeof okay === "function") {
                okay(img);
            }
        };
        e.onerror = function (err) {
            if (typeof fail === "function") {
                fail(err);
            }
        };
        body.appendChild(e); // add image to DOM so it will load
    }
    Squids.load_image = load_image;
    //	-	-	-	-	-	-	-	-	-	-	-	-	-
    // load and return a sound object given its path.
    Squids.loaded_sounds = [];
    function load_sound(path, okay, fail) {
        var sound = new Audio(path);
        sound.addEventListener("canplaythrough", function () {
            okay(sound);
        });
        sound.addEventListener("error", function (err) {
            fail(err);
        });
        Squids.loaded_sounds.push(sound);
    }
    Squids.load_sound = load_sound;
    //	-	-	-	-	-	-	-	-	-	-	-	-	-
    // Load many images and sounds with progress call-back.
    // Intended as a way for displaying progress bar while loading stuff.
    // The images and sounds arguments are arrays of path strings.
    // The progress callback function is called after each image or
    // sound file is loaded with:
    // 		- a number, 0.0 thru 1.0, telling you how far along it is.
    // 		- the path of the file just loaded
    // 		- the actual object loaded
    // 		- the type of object it is, either "image" or "sound"
    // The fail callback function receives an explanatory error string
    // TODO: Make this take one array of all assets rather separate ones for images & sounds
    function load_assets(base, img_paths, snd_paths, progress, fail) {
        return __awaiter(this, void 0, void 0, function () {
            var total, done, promises, _loop_1, _i, img_paths_1, path, _loop_2, _a, snd_paths_1, path, results;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        total = img_paths.length + snd_paths.length;
                        done = 0;
                        promises = [];
                        _loop_1 = function (path) {
                            promises.push(new Promise(function (resolve, reject) {
                                load_image(base + "/" + path, function (img) {
                                    done += 1;
                                    progress(done / total, path, img, 'image');
                                    resolve(img);
                                }, function (e) {
                                    fail("Error loading image: " + path);
                                    reject(e);
                                });
                            }));
                        };
                        for (_i = 0, img_paths_1 = img_paths; _i < img_paths_1.length; _i++) {
                            path = img_paths_1[_i];
                            _loop_1(path);
                        }
                        _loop_2 = function (path) {
                            promises.push(new Promise(function (resolve, reject) {
                                load_sound(base + "/" + path, function (snd) {
                                    done += 1;
                                    progress(done / total, path, snd, 'sound');
                                    resolve(snd);
                                }, function (e) {
                                    fail("Error loading sound: " + path);
                                    reject(e);
                                });
                            }));
                        };
                        for (_a = 0, snd_paths_1 = snd_paths; _a < snd_paths_1.length; _a++) {
                            path = snd_paths_1[_a];
                            _loop_2(path);
                        }
                        return [4 /*yield*/, Promise.all(promises)];
                    case 1:
                        results = _b.sent();
                        console.log("Loaded assets:", results);
                        return [2 /*return*/, results];
                }
            });
        });
    }
    Squids.load_assets = load_assets;
    // Draw a text str at a given pos, in a given font,
    // with a given alignment and opacity
    // TODO add rotation, scale
    function draw_text(str, x, y, font, align, opa) {
        Squids.ctx.save();
        Squids.ctx.font = font.style;
        Squids.ctx.fillStyle = font.color;
        Squids.ctx.textBaseline = 'middle';
        Squids.ctx.textAlign = align || "center";
        Squids.ctx.globalAlpha = opa;
        Squids.ctx.fillText(str, x, y);
        var w = Squids.ctx.measureText(str).width;
        Squids.ctx.restore();
        return w;
    }
    Squids.draw_text = draw_text;
    // return the width in pixels of a string WERE IT TO BE drawn in the given font
    function text_width(str, font) {
        Squids.ctx.save();
        Squids.ctx.font = font.style;
        Squids.ctx.textBaseline = 'middle';
        var w = Squids.ctx.measureText(str).width;
        Squids.ctx.restore();
        return w;
    }
    Squids.text_width = text_width;
    // Draw a line from one point to another, with a given color
    function draw_line(x1, y1, x2, y2, color, opacity) {
        if (x1 === void 0) { x1 = 0; }
        if (y1 === void 0) { y1 = 0; }
        if (x2 === void 0) { x2 = 10; }
        if (y2 === void 0) { y2 = 10; }
        if (color === void 0) { color = "#777"; }
        Squids.ctx.save();
        Squids.ctx.globalAlpha = opacity;
        Squids.ctx.strokeStyle = color;
        Squids.ctx.beginPath();
        Squids.ctx.moveTo(x1, y1);
        Squids.ctx.lineTo(x2, y2);
        Squids.ctx.stroke();
        Squids.ctx.restore();
    }
    Squids.draw_line = draw_line;
    // Draw an unfilled rectangle
    function draw_rect_unfilled(dx, dy, dw, dh, color, opa, rot) {
        if (dx === void 0) { dx = 0; }
        if (dy === void 0) { dy = 0; }
        if (dw === void 0) { dw = 10; }
        if (dh === void 0) { dh = 10; }
        if (color === void 0) { color = "#777"; }
        if (opa === void 0) { opa = 1; }
        if (rot === void 0) { rot = 0; }
        Squids.ctx.save();
        Squids.ctx.globalAlpha = opa;
        var ox = dx + (dw * 0.5);
        var oy = dy + (dh * 0.5);
        Squids.ctx.translate(ox, oy);
        Squids.ctx.rotate(rot * PI2);
        Squids.ctx.translate(-ox, -oy);
        Squids.ctx.strokeStyle = color;
        Squids.ctx.strokeRect(dx, dy, dw, dh);
        Squids.ctx.restore();
    }
    Squids.draw_rect_unfilled = draw_rect_unfilled;
    // Draw a filled rectangle
    // to alter opacity, change color to something like "rgba(r,g,b,opa)" or similar
    function draw_rect_filled(x, y, width, height, color, opacity, rotation) {
        if (opacity === void 0) { opacity = 1; }
        if (rotation === void 0) { rotation = 0; }
        Squids.ctx.save();
        Squids.ctx.globalAlpha = opacity;
        var ox = x + (width * 0.5);
        var oy = y + (height * 0.5);
        Squids.ctx.translate(ox, oy);
        Squids.ctx.rotate(rotation * PI2);
        Squids.ctx.translate(-ox, -oy);
        Squids.ctx.fillStyle = color;
        Squids.ctx.fillRect(x, y, width, height);
        Squids.ctx.restore();
    }
    Squids.draw_rect_filled = draw_rect_filled;
    // Draw an unfilled circle with a given radius and color
    function draw_circle_unfilled(dx, dy, r, color, opa) {
        if (dx === void 0) { dx = 0; }
        if (dy === void 0) { dy = 0; }
        if (r === void 0) { r = 10; }
        if (color === void 0) { color = "#777"; }
        if (opa === void 0) { opa = 1; }
        Squids.ctx.save();
        Squids.ctx.globalAlpha = opa;
        Squids.ctx.strokeStyle = color;
        Squids.ctx.beginPath();
        Squids.ctx.ellipse(dx, dy, r, r, 0, 0, 2 * Math.PI);
        Squids.ctx.stroke();
        Squids.ctx.restore();
    }
    Squids.draw_circle_unfilled = draw_circle_unfilled;
    // Draw a cross-hair at dx, dy
    // Really only exists for debug mode
    function draw_cross(dx, dy, size, color, opa, rot) {
        if (dx === void 0) { dx = 0; }
        if (dy === void 0) { dy = 0; }
        if (size === void 0) { size = 25; }
        if (color === void 0) { color = "#777"; }
        if (opa === void 0) { opa = 1; }
        if (rot === void 0) { rot = 0; }
        Squids.ctx.save();
        Squids.ctx.globalAlpha = opa;
        Squids.ctx.translate(dx, dy);
        Squids.ctx.rotate(rot * PI2);
        Squids.ctx.translate(-dx, -dy);
        Squids.ctx.strokeStyle = color;
        Squids.ctx.beginPath();
        Squids.ctx.moveTo(dx - size, dy);
        Squids.ctx.lineTo(dx + size, dy);
        Squids.ctx.stroke();
        Squids.ctx.beginPath();
        Squids.ctx.moveTo(dx, dy - size);
        Squids.ctx.lineTo(dx, dy + size);
        Squids.ctx.stroke();
        Squids.ctx.restore();
    }
    Squids.draw_cross = draw_cross;
    // Draw image onto canvas at dx,dy, with opacity, rotation, and scaling
    // Arguments:
    // 	img = the source image
    // 	dx,dy = destination x,y
    // 	opa = opacity
    // 	rot = rotation angle
    // 	px,py = x,y of pivot point for rotation image top-left corner
    // 	scaleX, scaleY = scaling factor 1.0 = normal size
    // 	sx,sy = x,y offset into img of top left corner of sub-rectangle
    // 	sw,sh = sw,sh width and height of sub-rectangle
    function draw_image(img, dx, dy, opa, rot, px, py, scaleX, scaleY, sx, sy, sw, sh) {
        if (dx === void 0) { dx = 0; }
        if (dy === void 0) { dy = 0; }
        if (opa === void 0) { opa = 1; }
        if (rot === void 0) { rot = 0; }
        if (px === void 0) { px = img.w * 0.5; }
        if (py === void 0) { py = img.h * 0.5; }
        if (scaleX === void 0) { scaleX = 1; }
        if (scaleY === void 0) { scaleY = 1; }
        if (sx === void 0) { sx = 0; }
        if (sy === void 0) { sy = 0; }
        if (sw === void 0) { sw = img.w; }
        if (sh === void 0) { sh = img.h; }
        Squids.ctx.save();
        Squids.ctx.imageSmoothingEnabled = img.smoothing;
        Squids.ctx.globalAlpha = opa;
        var dw = sw * scaleX;
        var dh = sh * scaleY;
        if (rot == 0) {
            Squids.ctx.drawImage(img.data, sx, sy, sw, sh, dx, dy, dw, dh);
        }
        else {
            Squids.ctx.translate(dx + px, dy + py);
            Squids.ctx.rotate(rot * PI2);
            Squids.ctx.translate(-(dx + px), -(dy + py));
            Squids.ctx.drawImage(img.data, sx, sy, sw, sh, dx, dy, dw, dh);
        }
        if (Squids.debug_flag) {
            draw_rect_filled(dx, dy, dw, dh, "#0ff", 0.1);
        }
        Squids.ctx.restore();
    }
    Squids.draw_image = draw_image;
    //	-	-	-	-	-	-	-	-	-	-	-	-	-
    // Events
    //	-	-	-	-	-	-	-	-	-	-	-	-	-
    // This holds references to the event listeners.
    // Each attribute in this object is one of the event types
    // and its corresponding value is another object with
    // an attribute for each Squid id that is listening for that event.
    Squids.listeners = {
        tick: {},
        draw: {},
        animate: {},
        physics: {},
        pointerdown: {},
    };
    // special ordered array of "draw" listeners sorted by priority
    var sorted_draw_listeners = [];
    // Get listeners for draw event as array and sort them by priority
    function sort_for_draw() {
        sorted_draw_listeners = Object.values(Squids.listeners["draw"]) || [];
        sorted_draw_listeners.sort(function (a, b) { var _a, _b; return ((_a = a.t) === null || _a === void 0 ? void 0 : _a.priority) - ((_b = b.t) === null || _b === void 0 ? void 0 : _b.priority); });
    }
    // Dispatch an event of type 'type' to all things that are listening for it
    // Returns an array of listener references that the event was sent to.
    function emit() {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        if (splashing) {
            return;
        }
        var type = args.shift();
        var l = Squids.listeners[type]; // get hash of listeners
        // no listeners
        if (!l) {
            return [];
        }
        var objs = Object.values(l);
        if (type === "draw") { // if in the special case of the draw event ...
            objs = sorted_draw_listeners; // use this sorted array instead (see listen())
        }
        for (var _a = 0, _b = objs; _a < _b.length; _a++) { // walk through listeners ...
            var o = _b[_a];
            var sq = o.t; // get Squid reference
            if (sq.active) {
                var fn = o.f; // get listener func
                fn.apply(sq, args); // call listener func with remaining args
            }
        }
        return objs;
    }
    Squids.emit = emit;
    function cvt_ptr_event(evt) {
        return {
            id: evt.pointerId,
            x: evt.clientX - Squids.canvas.offsetLeft,
            y: evt.clientY - Squids.canvas.offsetTop,
            type: evt.type,
            pointer_type: evt.pointerType,
            primary: evt.isPrimary,
        };
    }
    // Global hash of all instantiated Squids.
    Squids.all_things = {};
    // Destroy all instantiated Squids
    function destroy_things() {
        for (var _i = 0, _a = Object.values(Squids.all_things); _i < _a.length; _i++) {
            var thing = _a[_i];
            thing.destroy();
        }
        Squids.all_things = {};
    }
    Squids.destroy_things = destroy_things;
    // Stops all music and audio playing
    function stop_audio() {
        for (var _i = 0, _a = Squids.loaded_sounds; _i < _a.length; _i++) {
            var snd = _a[_i];
            snd.pause();
        }
    }
    Squids.stop_audio = stop_audio;
    // Destroy all things and Stop all music and audio
    function reset(cb) {
        destroy_things();
        stop_audio();
        if (cb) {
            setTimeout(cb, 1);
        }
    }
    Squids.reset = reset;
    //	-	-	-	-	-	-	-	-	-	-	-	-	-
    // Squid
    //	-	-	-	-	-	-	-	-	-	-	-	-	-
    var Thing = /** @class */ (function () {
        function Thing(position, image, rotation, opacity, scale) {
            this.active = true;
            this.priority = 0;
            this.id = seq();
            this.position = position;
            this.image = image;
            this.rotation = rotation;
            this.opacity = opacity;
            this.scale = scale;
            this.listen(sListenerTypes.physics, this.default_physics);
            this.listen(sListenerTypes.tick, this.default_tick);
            this.listen(sListenerTypes.animate, this.default_animate);
            this.listen(sListenerTypes.draw, this.default_draw);
        }
        Thing.prototype.listen = function (evt, f) {
            // get listeners for event type
            var l = Squids.listeners[evt];
            if (!l) {
                throw new Error("Unknown event type: ".concat(evt));
            }
            // insert wrapped data into hash
            l[this.id.toString()] = { t: this, f: f };
            if (evt === sListenerTypes.draw) {
                // special case; update priority-sorted list for drawing
                sort_for_draw();
            }
            return this;
        };
        Thing.prototype.ignore = function (evt) {
            if (Squids.listeners[evt] !== undefined) {
                delete Squids.listeners[evt]["" + this.id];
            }
            return this;
        };
        Thing.prototype.ignore_all = function () {
            var _this = this;
            for (var type in Squids.listeners) {
                delete Squids.listeners[type]["" + this.id];
                if (type === "draw") {
                    // special case; remove self from sorted draw list
                    sorted_draw_listeners = sorted_draw_listeners.filter(function (o) {
                        return o.t !== _this;
                    });
                }
            }
            return this;
        };
        Thing.prototype.draw_priority = function (n) {
            if (n === undefined) {
                return this.priority;
            }
            n = floor(n);
            this.priority = n;
            sort_for_draw();
            return this;
        };
        Thing.prototype.rotate_to = function (other) {
            this.rotation = vector_to_rotation(this.position, other.position);
            return this;
        };
        Thing.prototype.default_draw = function () {
            var instance = this;
            if (!instance.active) {
                return;
            }
            var scale = instance.scale, opacity = instance.opacity, rotation = instance.rotation, text = instance.text, font = instance.font, align = instance.align;
            var _a = instance.position, x = _a.x, y = _a.y;
            var img = instance.image;
            if (img) {
                var dw = img.w * scale;
                var dh = img.h * scale;
                var dx = x - (dw / 2);
                var dy = y - (dh / 2);
                var pivotX = instance.pivot.x || dw * 0.5;
                var pivotY = instance.pivot.y || dh * 0.5;
                draw_image(img, dx, dy, opacity, rotation, pivotX, pivotY, scale, scale);
            }
            if (text) {
                draw_text(text, x, y, font || dbg_font, align || "center", opacity);
            }
            if (Squids.debug_flag) {
                draw_cross(x, y, 10, "#0ff", 0.8, rotation);
                var sh = instance.get_body();
                if (sh !== null && sh !== undefined) {
                    if (typeof sh === "number") {
                        draw_circle_unfilled(x, y, sh * scale, "#0f0", 0.9);
                    }
                    else {
                        var dx = x - ((sh.x * scale) * 0.5);
                        var dy = y - ((sh.y * scale) * 0.5);
                        draw_rect_unfilled(dx, dy, sh.x * scale, sh.y * scale, "#f00", 0.9);
                    }
                }
            }
        };
        Thing.prototype.get_body = function () {
            var _a, _b;
            return this.body || {
                x: this.position.x,
                y: this.position.y,
                width: ((_a = this.image) === null || _a === void 0 ? void 0 : _a.w) || 0,
                height: ((_b = this.image) === null || _b === void 0 ? void 0 : _b.h) || 0,
            };
        };
        // Apply thrust to a squid in the direction that it's facing.
        Thing.prototype.move_forward = function (amount) {
            var c = rotation_to_vector(this.rotation);
            if (!this.velocity) {
                this.velocity = vec(0, 0);
            }
            c.mlt(amount);
            this.velocity.add(c);
            return this;
        };
        Thing.prototype.default_physics = function () {
            var instance = this;
            if (!instance.active) {
                return;
            }
            var position = instance.position, velocity = instance.velocity, gravity = instance.gravity, velocity_limit = instance.velocity_limit;
            if (position && velocity) {
                position.add(velocity);
                if (typeof velocity_limit !== "number" || velocity.length() <= velocity_limit) {
                    velocity.add(gravity);
                }
            }
            return instance;
        };
        Thing.prototype.default_tick = function () {
            var instance = this;
            if (!instance.active) {
                return;
            }
            return instance;
        };
        Thing.prototype.default_animate = function () {
            var instance = this;
            if (!instance.active) {
                return;
            }
            if (instance.image) {
                instance.image = instance.anim.next();
            }
            return instance;
        };
        Thing.prototype.destroy = function () {
            this.ignore_all();
            delete Squids.all_things["" + this.id];
            return this;
        };
        return Thing;
    }());
    Squids.Thing = Thing;
    //	-	-	-	-	-	-	-	-	-	-	-	-
    // Anim
    //	-	-	-	-	-	-	-	-	-	-	-	-
    // TODO document this
    var Anim = /** @class */ (function () {
        function Anim() {
        }
        Anim.prototype.next = function () {
            return undefined;
        };
        return Anim;
    }());
    Squids.Anim = Anim;
    /*
    const Anim = function (images, fps = 10, loop = true, playing = true) {

        let ts_start = Date.now();

        let anim = {
            images,
            loop,
            playing,
            fps,
            frame: 0,
        };

        anim.play = function (start_frame = 0) {
            anim.frame = start_frame;
            anim.playing = true;
            ts_start = Date.now();
            return anim;
        };

        anim.restart = function () {
            return anim.play(0);
        }

        anim.stop = function () {
            anim.playing = false;
            return anim;
        }

        anim.next = function () {
            if (anim.playing) {
                let ts_elapsed = Date.now() - ts_start;
                anim.frame = floor(ts_elapsed / (1000 / fps));
                if (anim.frame >= images.length) {
                    // trying to step to next, non-existent frame.
                    if (loop) {
                        anim.play(0);
                        //anim.frame = 0;
                        //ts_start = Date.now();
                    } else {
                        anim.playing = false;
                        anim.frame = images.length - 1;
                    }
                }
            }
            return images[anim.frame];
        }

        return anim;
    };
    */
    //	-	-	-	-	-	-	-	-	-	-	-	-
    // takes a source position and a target position and
    // returns a number from 0.0 thru PI * 2 that represents the angle
    // between the two, or the "heading" from source to target
    // TODO Make this align with common vector terms
    // TODO integrate with vec
    function vector_to_rotation(s_pos, t_pos) {
        var r = atan2(t_pos.y - s_pos.y, t_pos.x - s_pos.x) + PIH;
        r = r / PI2;
        return r;
    }
    Squids.vector_to_rotation = vector_to_rotation;
    //const azimuth = vector_to_rotation;        // deprecate
    // converts a heading/angle to cartesian coords for a distance of 1.0
    // passing in a vec as 'v' makes it write into that vec rather than
    // creating a new one.
    // TODO Make this align with common vector terms
    // TODO integrate with vec
    function rotation_to_vector(r, v) {
        r = (r * PI2) - PI;
        if (!v)
            return vec(sin(r), -cos(r));
        v.x = sin(r);
        v.y = -cos(r);
        return v;
    }
    Squids.rotation_to_vector = rotation_to_vector;
    //	-	-	-	-	-	-	-	-	-	-	-	-	-
    // Collisions detection
    //	-	-	-	-	-	-	-	-	-	-	-	-	-
    // Test for circle to circle collision
    // Assumes both hit bodies are set and of the correct type
    function collide_rad_rad() {
        throw new Error("not implemented");
    }
    Squids.collide_rad_rad = collide_rad_rad;
    // Test for rect to circle collision
    // Assumes both hit bodies are set and of the correct type
    function collide_rect_rad() {
        throw new Error("not implemented");
    }
    Squids.collide_rect_rad = collide_rect_rad;
    // Test for rect to rect collision
    // Assumes both hit bodies are set and of the correct type
    function collide_rect_rect() {
        throw new Error("not implemented");
    }
    Squids.collide_rect_rect = collide_rect_rect;
    // Test for a collision between any 2 squids.
    function collide_squids() {
        throw new Error("not implemented");
    }
    Squids.collide_squids = collide_squids;
    function collide_pos_squid() {
        throw new Error("not implemented");
    }
    Squids.collide_pos_squid = collide_pos_squid;
    //	-	-	-	-	-	-	-	-	-	-	-	-	-
    // Drawing loop
    // Driven by requestAnimationFrame()
    //	-	-	-	-	-	-	-	-	-	-	-	-	-
    var draw_count = 0;
    // draw the splash screen
    // noinspection SpellCheckingInspection
    var squid_logo_url = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjM2IiBoZWlnaHQ9IjM2NyIgdmlld0JveD0iMCAwIDIzNiAzNjciIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxwYXRoIGQ9Ik01NS4zOTQ1IDE3MS4yNjZMMTAwLjgzMSAzOC4xMDkyTDE4Mi4zNjYgMC40NTMzNjlMMTk1LjQzNyA3OS43NzE4TDE4Mi4zNjYgMTk0Ljk1N0w1NS4zOTQ1IDE3MS4yNjZaIiBmaWxsPSIjREM4NkVBIi8+CjxwYXRoIGQ9Ik01NC4xNDk3IDIyNC4yMUw3Ni41NTY1IDE4MS44ODZMMTAwLjgzMSAxODcuNDg4TDcyLjgyMiAyMjcuMzIyTDg0LjY0NzggMjYwLjMxTDEyMi42MTUgMjY3Ljc3OUwxMTkuNTAzIDMwMS4zODlMODQuNjQ3OCAyOTAuODA4TDc2LjU1NjUgMjY3Ljc3OUw1NC4xNDk3IDIyNC4yMVoiIGZpbGw9IiM5MzMwQTQiLz4KPHBhdGggZD0iTTE4MC40OTkgMjQ4LjQ4NEwxNTkuMzM3IDIwNS41MzhMMTM1LjA2MyAxOTguMDY5TDE2My42OTQgMjU1LjMzMUwxMzUuMDYzIDMyMy43OTZIMTE1Ljc2OEw4NC42NDc4IDM2My4wMDhMMTE5LjUwMyAzNjYuNzQyTDEyOC4yMTcgMzQ1LjU4TDE1Mi40OTEgMzI4Ljc3NUwxODAuNDk5IDI0OC40ODRaIiBmaWxsPSIjOTMzMEE0Ii8+CjxwYXRoIGQ9Ik05NC42MDY0IDIxNC44NzRMMTA3LjY3NyAxOTIuNDY3TDExNS43NjggMTk4LjA2OUwxMDcuNjc3IDIxOC42MDhMMTAwLjgzMSAyNDguNDg0TDk0LjYwNjQgMjE0Ljg3NFoiIGZpbGw9IiM5MzMwQTQiLz4KPHBhdGggZD0iTTEzNS4wNjMgMjA1LjUzOEwxMjQuNDgyIDIwOC4wMjdMMTI4LjIxNyAyMzEuMDU3TDEzNS4wNjMgMjU1LjMzMUwxNDAuNjY1IDIzNC43OTFMMTM1LjA2MyAyMDUuNTM4WiIgZmlsbD0iIzkzMzBBNCIvPgo8cGF0aCBkPSJNMzIuOTg3OCAxOTguMDY5TDYwLjM3MzggMTg3LjQ4OEw0Ni42ODA4IDE3Ni45MDdMMTguNjcyMyAxODcuNDg4TDAgMjUyLjIxOEwzMi45ODc4IDE5OC4wNjlaIiBmaWxsPSIjOTMzMEE0Ii8+CjxwYXRoIGQ9Ik0yMDQuNzczIDIwNS41MzhMMTgzLjYxMSAyMDguMDI3TDIxOS43MTEgMjQ4LjQ4NFYyOTAuODA4TDIzNS44OTQgMjQ4LjQ4NEwyMDQuNzczIDIwNS41MzhaIiBmaWxsPSIjOTMzMEE0Ii8+CjxwYXRoIGQ9Ik04NC42NDc4IDEyOC45ODFMMTAwLjgzMSAxMTkuMDIzTDEyMi42MTUgMTMzLjMzOEw5NC42MDY0IDE1My44NzhMODQuNjQ3OCAxMjguOTgxWiIgZmlsbD0iIzkzMzBBNCIvPgo8cGF0aCBkPSJNMTM1LjA2MyAxNTMuODc4TDE1Mi40OTEgMTMzLjMzOEwxNzEuMTYzIDE1Ny42MTJMMTUyLjQ5MSAxNzMuMTcyTDEzNS4wNjMgMTUzLjg3OFoiIGZpbGw9IiM5MzMwQTQiLz4KPHBhdGggZD0iTTIxMC4zNzUgMTMzLjMzOEwxOTQuMTkyIDE0Ny42NTRMMjAxLjY2MSA5NC43NDg2TDIxMy40ODcgMTA0LjA4NUwyMTAuMzc1IDEzMy4zMzhaIiBmaWxsPSIjOTMzMEE0Ii8+CjxwYXRoIGQ9Ik02MC4zNzM4IDExOS4wMjNMODEuNTM1OCA3MC40NzQ2TDYwLjM3MzggNzYuNjk4N0w1MS4wMzc3IDEwNC4wODVMNjAuMzczOCAxMTkuMDIzWiIgZmlsbD0iIzkzMzBBNCIvPgo8L3N2Zz4K";
    var squid_logo = null;
    var squid_logo_font = null;
    function draw_splash() {
        var sw = Squids.canvas.clientWidth;
        var sh = Squids.canvas.clientHeight;
        draw_rect_filled(0, 0, sw, sh, "#000");
        if (squid_logo) {
            // logo has loaded
            var dx = (sw - squid_logo.w) * 0.5;
            var dy = (sh - squid_logo.h) * 0.25;
            draw_image(squid_logo, dx, dy);
        }
        draw_text("Squids " + Squids.version + " (" + Squids.code_name + ")", sw * 0.5, sh * 0.9, squid_logo_font, "center", 1.0);
    }
    // draw the overlay debug strings
    function draw_debug() {
        var y = DBG_LINE_HEIGHT;
        for (var _i = 0, debug_messages_1 = debug_messages; _i < debug_messages_1.length; _i++) {
            var m = debug_messages_1[_i];
            if (m === undefined)
                m = "";
            draw_text(m, DBG_FONT_SIZE, y + DBG_SHADOW_OFFSET, dbg_font_shadow, "left", 0.9);
            draw_text(m, DBG_FONT_SIZE, y, dbg_font, "left", 0.9);
            y += DBG_LINE_HEIGHT;
        }
    }
    function draw(count) {
        // clear canvas
        draw_rect_filled(0, 0, Squids.canvas.width, Squids.canvas.height, "#000");
        emit("draw", count);
        if (Squids.debug_flag) {
            draw_debug();
        }
    }
    function frame() {
        draw_count += 1;
        if (splashing) {
            draw_splash();
        }
        else {
            draw(draw_count);
        }
        requestAnimationFrame(frame);
    }
    //	-	-	-	-	-	-	-	-	-	-	-	-	-
    // Tick loop
    // Driven by setTimeout()
    //	-	-	-	-	-	-	-	-	-	-	-	-	-
    Squids.tick_count = 0; // increments each time a "tick" event is emitted
    Squids.ts_last = 0;
    Squids.ideal_tps = 100; // target ticks per second
    var splashing = 300; // Timer for Squids splash screen
    function update(delta, count) {
        emit("physics", delta, count);
        emit("tick", delta, count);
        emit("animate", delta, count);
    }
    // This is what the setInterval actually calls
    function interval() {
        Squids.tick_count += 1;
        var ts_now = Date.now();
        var delta = ts_now - Squids.ts_last;
        Squids.ts_last = ts_now;
        if (splashing) {
            splashing -= 1;
        }
        else {
            update(delta, Squids.tick_count);
        }
    }
    //	-	-	-	-	-	-	-	-	-	-	-	-	-
    Squids.stats = { tps: 0, fps: 0 };
    // This updates ticks and frames per sec values
    var last_tick_count = Squids.tick_count;
    var last_draw_count = draw_count;
    setInterval(function () {
        Squids.stats.fps = draw_count - last_draw_count;
        last_draw_count = draw_count;
        Squids.stats.tps = Squids.tick_count - last_tick_count;
        last_tick_count = Squids.tick_count;
    }, 1000);
    function initialize(optional_ideal_ticks_per_second) {
        //	-	-	-	-	-	-	-	-	-	-	-	-	-
        // Canvas related stuff
        //	-	-	-	-	-	-	-	-	-	-	-	-	-
        // Look for a canvas provided by the document.
        // If found, use it, otherwise create one that covers the whole page.
        if (!Squids.canvas) // if no existing canvas found ...
         {
            // create our own
            Squids.canvas = document.createElement("canvas");
            Squids.canvas.id = "SquidsCanvas";
            Squids.canvas.style.position = "absolute";
            Squids.canvas.style.left = "0";
            Squids.canvas.style.top = "0";
            Squids.canvas.style.width = "100vw";
            Squids.canvas.style.height = "100vh";
            Squids.canvas.style.backgroundColor = "black";
            body.appendChild(Squids.canvas);
            Squids.canvas.width = Squids.canvas.clientWidth;
            Squids.canvas.height = Squids.canvas.clientHeight;
        }
        Squids.ctx = Squids.canvas.getContext("2d");
        // Install DOM event listeners for the most commonly used events.
        body.addEventListener("resize", function (evt) {
            emit("resize", vec(window.innerWidth, window.innerHeight), evt);
        });
        body.addEventListener("pointermove", function (evt) {
            evt.preventDefault();
            Squids.pointer.x = evt.clientX - Squids.canvas.offsetLeft;
            Squids.pointer.y = evt.clientY - Squids.canvas.offsetTop;
            emit("pointermove", Squids.pointer.x, Squids.pointer.y, cvt_ptr_event(evt));
        });
        body.addEventListener("keyup", function (evt) {
            var k = evt.key;
            if (k === " ") {
                k = "space";
            }
            Squids.keys[k] = false;
            emit("keyup", k, evt);
        });
        body.addEventListener("keydown", function (evt) {
            var k = evt.key;
            if (k === " ") {
                k = "space";
            }
            Squids.keys[k] = true;
            if (k === "`" && evt.ctrlKey) {
                Squids.debug_flag = !Squids.debug_flag;
            }
            emit("keydown", k, evt);
        });
        body.addEventListener("blur", function (evt) {
            emit("blur", evt);
        });
        body.addEventListener("focus", function (evt) {
            emit("focus", evt);
        });
        Squids.canvas.addEventListener("pointerdown", function (evt) {
            evt.preventDefault();
            Squids.pointer.x = evt.clientX - Squids.canvas.offsetLeft;
            Squids.pointer.y = evt.clientY - Squids.canvas.offsetTop;
            emit("pointerdown", Squids.pointer.x, Squids.pointer.y, cvt_ptr_event(evt));
        });
        Squids.canvas.addEventListener("pointerup", function (evt) {
            evt.preventDefault();
            Squids.pointer.x = evt.clientX - Squids.canvas.offsetLeft;
            Squids.pointer.y = evt.clientY - Squids.canvas.offsetTop;
            emit("pointerup", Squids.pointer.x, Squids.pointer.y, cvt_ptr_event(evt));
        });
        if (/([?&])nosplash=/.test(document.location.search)) {
            splashing = 0;
        }
        load_image(squid_logo_url, function (image) {
            squid_logo = image;
        }, console.error);
        squid_logo_font = load_font("helvetica", 25, "#48a");
        dbg_font = load_font("helvetica", DBG_FONT_SIZE, "#ff0");
        dbg_font_shadow = load_font("helvetica", DBG_FONT_SIZE, "#000");
        Squids.ts_last = Date.now();
        // Fire up the ticking and drawing
        setInterval(interval, 1000 / (optional_ideal_ticks_per_second || Squids.ideal_tps));
        requestAnimationFrame(frame);
    }
    Squids.initialize = initialize;
})(Squids || (Squids = {}));
//# sourceMappingURL=squids.js.map