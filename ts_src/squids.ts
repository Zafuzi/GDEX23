/*!

Squids - An HTML5 canvas-based game engine and a state of mind.

Copyright 2023  Sleepless Software Inc.  All Rights Reserved
See the LICENSE.txt file included with the Squids source code for licensing information

*/

export const NOP = () => {
};

export namespace Squids {

	export interface sImage {
		w: number;
		h: number;
		data: HTMLImageElement;
		smoothing: boolean;
		size: () => Vector;
		make_radius: () => number;
	}

	export interface sFont {
		height: number;
		face: string;
		style: string;
		color: string;
	}

	export interface sListener {
		t: Thing;
		f: Function;
	}

	export interface sBody {
		x: number;
		y: number;
		width: number,
		height: number,
	}

	export enum sListenerTypes {
		physics = "physics",
		tick = "tick",
		animate = "animate",
		draw = "draw",
		pointerdown = "pointerdown",
	}


	export const version = "6.4.0";
	export const code_name = "Quiver";
	export let canvas: HTMLCanvasElement;
	export let ctx: CanvasRenderingContext2D;


	//	-	-	-	-	-	-	-	-	-	-	-	-	-
	//  API
	//	-	-	-	-	-	-	-	-	-	-	-	-	-

	// Internal vars
	let {sqrt, sin, cos, floor, atan2, PI} = Math;

	const PI2 = PI * 2;	// 1 full rotation (360 degrees)
	const PIH = PI / 2;	// one half of PI

	const body = document.body;

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
	export let debug_flag = false;
	let debug_messages = [];

	export function debug(row: number | boolean | string[], content?: string): boolean {
		if (typeof row === "boolean") {
			debug_flag = row;
			return debug_flag;
		}

		if (typeof row === "number") {
			debug_messages[row] = content;
			return debug_flag;
		}

		if (Array.isArray(row)) {
			debug_messages = row;
			return debug_flag;
		}

		return debug_flag;
	}

	//	-	-	-	-	-	-	-	-	-	-	-	-	-

	// last known pointer x,y locations taken from mouse events
	export const pointer = {x: 0, y: 0};

	// Global key up/down status
	// e.g., if( keys[ 'p' ] ) { the "p" key is down }
	// Only useful for polling, not detecting key events
	export const keys = {};


	// Return an every increasing integer which can be used
	// as a unique id.
	export let seq_num = 0;

	export function seq() {
		seq_num += 1;
		return seq_num;
	}

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
	export class Vector {
		public x: number;
		public y: number;
		public z: number;

		constructor(x: number, y?: number, z?: number) {
			this.x = x;
			this.y = y || 0;
			this.z = z || 0;
		}

		public add(vec1: Vector): Vector {
			this.x += vec1.x;
			this.y += vec1.y;
			this.z += vec1.z;
			return this;
		}

		public sub(vec1: Vector): Vector {
			this.x -= vec1.x;
			this.y -= vec1.y;
			this.z -= vec1.z;
			return this;
		}

		public mlt(vec1: Vector): Vector {
			this.x *= vec1.x;
			this.y *= vec1.y;
			this.z *= vec1.z;
			return this;
		}

		public div(vec1: Vector): Vector {
			this.x /= vec1.x;
			this.y /= vec1.y;
			this.z /= vec1.z;
			return this;
		}

		length() {
			return sqrt((this.x * this.x) + (this.y * this.y) + (this.z * this.z));
		}
	}

	export function vec(x: number, y?: number, z?: number): Vector {
		return new Vector(x, y, z);
	}

	//	-	-	-	-	-	-	-	-	-	-	-	-	-

	// Return a font-ish object that you can pass into draw_text().
	// This simply uses any font that the browser can provide.
	// TODO support bold/italic/underline?
	export function load_font(face: string, size: number, color: string): sFont {
		return {
			height: size,
			face: face,
			style: "" + size + "px " + face,
			color: color
		};
	}

	// Set up default font(s)
	const DBG_FONT_SIZE = 16;
	const DBG_LINE_HEIGHT = DBG_FONT_SIZE + (DBG_FONT_SIZE * 0.1);
	const DBG_SHADOW_OFFSET = DBG_FONT_SIZE * 0.1;
	let dbg_font = null;
	let dbg_font_shadow = null;

	//	-	-	-	-	-	-	-	-	-	-	-	-	-

	// load and return an image object given its path.
	export function load_image(path: string, okay?: Function, fail?: Function): void {
		let e: HTMLImageElement = document.createElement("img");
		e.src = path;
		e.style.display = "none";
		e.onload = function () {
			let img: sImage = {
				w: e.width,
				h: e.height,
				data: e,
				smoothing: true,
				size: () => {
					return vec(img.w, img.h);
				},
				make_radius: () => {
					let size = img.size();	// get image w, h
					return ((size.x + size.y) / 2) * 0.5;	// half of average of w and h
				}
			};

			e.remove();	// remove from DOM - not needed anymore

			if (typeof okay === "function") {
				okay(img);
			}
		};
		e.onerror = function (err) {
			if (typeof fail === "function") {
				fail(err);
			}
		};
		body.appendChild(e);	// add image to DOM so it will load
	}

	//	-	-	-	-	-	-	-	-	-	-	-	-	-

	// load and return a sound object given its path.
	export const loaded_sounds = [];

	export function load_sound(path: string, okay?: Function, fail?: Function): void {
		const sound = new Audio(path);
		sound.addEventListener("canplaythrough", () => {
			okay(sound);
		});

		sound.addEventListener("error", (err) => {
			fail(err);
		});

		loaded_sounds.push(sound);
	}

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
	export async function load_assets(base: string, img_paths: string[], snd_paths: string[], progress?: Function, fail?: Function): Promise<any[]> {
		let total = img_paths.length + snd_paths.length;
		let done = 0;

		// setup all paths to load in parallel with Promise.all
		let promises = [];

		for (let path of img_paths) {
			promises.push(new Promise((resolve, reject) => {
				load_image(base + "/" + path, (img: sImage) => {
					done += 1;
					progress(done / total, path, img, 'image');
					resolve(img);
				}, (e: Error) => {
					fail("Error loading image: " + path);
					reject(e);
				});
			}));
		}

		for (let path of snd_paths) {
			promises.push(new Promise((resolve, reject) => {
				load_sound(base + "/" + path, (snd: HTMLAudioElement) => {
					done += 1;
					progress(done / total, path, snd, 'sound');
					resolve(snd);
				}, (e: Error) => {
					fail("Error loading sound: " + path);
					reject(e);
				});
			}));
		}

		// allow loads to fail and return when all promises are rejected or resolved
		const results = await Promise.all(promises);

		console.log("Loaded assets:", results);
		return results;
	}

	// Draw a text str at a given pos, in a given font,
	// with a given alignment and opacity
	// TODO add rotation, scale
	export function draw_text(str: string, x: number, y: number, font: sFont, align: CanvasTextAlign, opa: number, /* rot, scl */) {
		ctx.save();
		ctx.font = font.style;
		ctx.fillStyle = font.color;
		ctx.textBaseline = 'middle';
		ctx.textAlign = align || "center";
		ctx.globalAlpha = opa;
		ctx.fillText(str, x, y);
		let w = ctx.measureText(str).width;
		ctx.restore();
		return w;
	}

	// return the width in pixels of a string WERE IT TO BE drawn in the given font
	export function text_width(str: string, font: sFont) {
		ctx.save();
		ctx.font = font.style;
		ctx.textBaseline = 'middle';
		let w = ctx.measureText(str).width;
		ctx.restore();
		return w;
	}

	// Draw a line from one point to another, with a given color
	export function draw_line(x1 = 0, y1 = 0, x2 = 10, y2 = 10, color = "#777", opacity: number) {
		ctx.save();
		ctx.globalAlpha = opacity;
		ctx.strokeStyle = color;
		ctx.beginPath();
		ctx.moveTo(x1, y1);
		ctx.lineTo(x2, y2);
		ctx.stroke();
		ctx.restore();
	}

	// Draw an unfilled rectangle
	export function draw_rect_unfilled(dx = 0, dy = 0, dw = 10, dh = 10, color = "#777", opa = 1, rot = 0) {
		ctx.save();
		ctx.globalAlpha = opa;

		let ox = dx + (dw * 0.5);
		let oy = dy + (dh * 0.5);
		ctx.translate(ox, oy);
		ctx.rotate(rot * PI2);
		ctx.translate(-ox, -oy);

		ctx.strokeStyle = color;
		ctx.strokeRect(dx, dy, dw, dh);
		ctx.restore();
	}

	// Draw a filled rectangle
	// to alter opacity, change color to something like "rgba(r,g,b,opa)" or similar
	export function draw_rect_filled(x: number, y: number, width: number, height: number, color: string, opacity: number = 1, rotation: number = 0) {
		ctx.save();
		ctx.globalAlpha = opacity;

		let ox = x + (width * 0.5);
		let oy = y + (height * 0.5);
		ctx.translate(ox, oy);
		ctx.rotate(rotation * PI2);
		ctx.translate(-ox, -oy);

		ctx.fillStyle = color;
		ctx.fillRect(x, y, width, height);
		ctx.restore();
	}

	// Draw an unfilled circle with a given radius and color
	export function draw_circle_unfilled(dx = 0, dy = 0, r = 10, color = "#777", opa = 1) {
		ctx.save();
		ctx.globalAlpha = opa;
		ctx.strokeStyle = color;
		ctx.beginPath();
		ctx.ellipse(dx, dy, r, r, 0, 0, 2 * Math.PI);
		ctx.stroke();
		ctx.restore();
	}

	// Draw a cross-hair at dx, dy
	// Really only exists for debug mode
	export function draw_cross(dx = 0, dy = 0, size = 25, color = "#777", opa = 1, rot = 0) {
		ctx.save();
		ctx.globalAlpha = opa;
		ctx.translate(dx, dy);
		ctx.rotate(rot * PI2);
		ctx.translate(-dx, -dy);
		ctx.strokeStyle = color;
		ctx.beginPath();
		ctx.moveTo(dx - size, dy);
		ctx.lineTo(dx + size, dy);
		ctx.stroke();
		ctx.beginPath();
		ctx.moveTo(dx, dy - size);
		ctx.lineTo(dx, dy + size);
		ctx.stroke();
		ctx.restore();
	}

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
	export function draw_image(img: sImage, dx = 0, dy = 0, opa = 1, rot = 0, px = img.w * 0.5, py = img.h * 0.5, scaleX = 1, scaleY = 1, sx = 0, sy = 0, sw = img.w, sh = img.h) {

		ctx.save();
		ctx.imageSmoothingEnabled = img.smoothing;
		ctx.globalAlpha = opa;

		let dw = sw * scaleX;
		let dh = sh * scaleY;

		if (rot == 0) {
			ctx.drawImage(img.data, sx, sy, sw, sh, dx, dy, dw, dh);
		} else {
			ctx.translate(dx + px, dy + py);
			ctx.rotate(rot * PI2);
			ctx.translate(-(dx + px), -(dy + py));
			ctx.drawImage(img.data, sx, sy, sw, sh, dx, dy, dw, dh);
		}

		if (debug_flag) {
			draw_rect_filled(dx, dy, dw, dh, "#0ff", 0.1);
		}

		ctx.restore();
	}

	//	-	-	-	-	-	-	-	-	-	-	-	-	-
	// Events
	//	-	-	-	-	-	-	-	-	-	-	-	-	-

	// This holds references to the event listeners.
	// Each attribute in this object is one of the event types
	// and its corresponding value is another object with
	// an attribute for each Squid id that is listening for that event.
	export const listeners = {
		tick: {},
		draw: {},
		animate: {},
		physics: {},
		pointerdown: {},
	};

	// special ordered array of "draw" listeners sorted by priority
	let sorted_draw_listeners = [];

	// Get listeners for draw event as array and sort them by priority
	function sort_for_draw() {
		sorted_draw_listeners = Object.values(listeners["draw"]) || [];
		sorted_draw_listeners.sort((a, b) => a.t?.priority - b.t?.priority);
	}

	// Dispatch an event of type 'type' to all things that are listening for it
	// Returns an array of listener references that the event was sent to.
	export function emit(...args: any[]): any[] {
		if (splashing) {
			return;
		}

		let type = args.shift();
		let l = listeners[type];	// get hash of listeners

		// no listeners
		if (!l) {
			return [];
		}

		let objs = Object.values(l);

		if (type === "draw") {	// if in the special case of the draw event ...
			objs = sorted_draw_listeners;	// use this sorted array instead (see listen())
		}

		for (let o of (objs as sListener[])) {	// walk through listeners ...
			let sq : Thing = o.t;		// get Squid reference

			if (sq.active) {
				let fn = o.f;		// get listener func
				fn.apply(sq, args);	// call listener func with remaining args
			}
		}
		return objs;
	}

	function cvt_ptr_event(evt: PointerEvent) {
		return {
			id: evt.pointerId,
			x: evt.clientX - canvas.offsetLeft,
			y: evt.clientY - canvas.offsetTop,
			type: evt.type,
			pointer_type: evt.pointerType,
			primary: evt.isPrimary,
		};
	}

	// Global hash of all instantiated Squids.
	export let all_things = {};

	// Destroy all instantiated Squids
	export function destroy_things() {
		for (let thing of (Object.values(all_things) as Thing[])) {
			thing.destroy();
		}
		all_things = {};
	}

	// Stops all music and audio playing
	export function stop_audio() {
		for (let snd of (loaded_sounds as HTMLAudioElement[])) {
			snd.pause();
		}
	}

	// Destroy all things and Stop all music and audio
	export function reset(cb?: Function) {
		destroy_things();
		stop_audio();
		if (cb) {
			setTimeout(cb, 1);
		}
	}

	//	-	-	-	-	-	-	-	-	-	-	-	-	-
	// Squid
	//	-	-	-	-	-	-	-	-	-	-	-	-	-
	export class Thing {
		public readonly id: number;
		public active: boolean = true;
		public position: Vector;
		public image?: sImage;
		public font?: any;
		public text?: string;
		public rotation?: number;
		public opacity?: number;
		public scale?: number;
		public pivot?: Vector;
		public priority: number = 0;
		public align?: CanvasTextAlign;
		public body?: sBody;
		public velocity?: Vector;
		public velocity_limit?: number;
		public gravity?: Vector;
		public anim?: Anim;

		constructor(position?: Vector, image?: sImage, rotation?: number, opacity?: number, scale?: number) {
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

		public listen(evt: sListenerTypes, f: Function): Thing {
			// get listeners for event type
			let l = listeners[evt];
			if(!l) {
				throw new Error(`Unknown event type: ${evt}`);
			}

			// insert wrapped data into hash
			l[this.id.toString()] = {t: this, f};

			if (evt === sListenerTypes.draw) {
				// special case; update priority-sorted list for drawing
				sort_for_draw();
			}

			return this;
		}

		public ignore(evt: sListenerTypes): Thing {
			if (listeners[evt] !== undefined) {
				delete listeners[evt]["" + this.id];
			}
			return this;
		}

		public ignore_all(): Thing {
			for (let type in listeners) {
				delete listeners[type]["" + this.id];
				if (type === "draw") {
					// special case; remove self from sorted draw list
					sorted_draw_listeners = sorted_draw_listeners.filter(o => {
						return o.t !== this;
					});
				}
			}
			return this;
		}

		public draw_priority(n: number): Thing | number {
			if (n === undefined) {
				return this.priority;
			}

			n = floor(n);
			this.priority = n;
			sort_for_draw();
			return this;
		}

		public rotate_to(other: Thing): Thing {
			this.rotation = vector_to_rotation(this.position, other.position);
			return this;
		}

		public default_draw() {
			const instance = this;
			if (!instance.active) {
				return;
			}

			let {scale, opacity, rotation, text, font, align} = instance;
			let {x, y} = instance.position;

			let img = instance.image;
			if (img) {
				let dw = img.w * scale;
				let dh = img.h * scale;
				let dx = x - (dw / 2);
				let dy = y - (dh / 2);

				let pivotX = instance.pivot.x || dw * 0.5;
				let pivotY = instance.pivot.y || dh * 0.5;

				draw_image(img, dx, dy, opacity, rotation, pivotX, pivotY, scale, scale);
			}

			if (text) {
				draw_text(text, x, y, font || dbg_font, align || "center", opacity, /*rotation, scale*/);
			}

			if (debug_flag) {
				draw_cross(x, y, 10, "#0ff", 0.8, rotation);

				let sh = instance.get_body();

				if (sh !== null && sh !== undefined) {
					if (typeof sh === "number") {
						draw_circle_unfilled(x, y, sh * scale, "#0f0", 0.9);
					} else {
						let dx = x - ((sh.x * scale) * 0.5);
						let dy = y - ((sh.y * scale) * 0.5);
						draw_rect_unfilled(dx, dy, sh.x * scale, sh.y * scale, "#f00", 0.9);
					}
				}
			}
		}

		public get_body(): sBody {
			return this.body || {
				x: this.position.x,
				y: this.position.y,
				width: this.image?.w || 0,
				height: this.image?.h || 0,
			}
		}

		// Apply thrust to a squid in the direction that it's facing.
		public move_forward(amount: Vector): Thing {
			let c = rotation_to_vector(this.rotation);

			if (!this.velocity) {
				this.velocity = vec(0, 0);
			}

			c.mlt(amount);
			this.velocity.add(c);
			return this;
		}

		public default_physics(): Thing {
			const instance = this;
			if (!instance.active) {
				return;
			}

			let {position, velocity, gravity, velocity_limit} = instance;
			if (position && velocity) {
				position.add(velocity);
				if (typeof velocity_limit !== "number" || velocity.length() <= velocity_limit) {
					velocity.add(gravity);
				}
			}

			return instance;
		}

		public default_tick() : Thing {
			const instance = this;
			if (!instance.active) {
				return;
			}

			return instance;
		}

		public default_animate() : Thing {
			const instance = this;
			if (!instance.active) {
				return;
			}

			if (instance.image) {
				instance.image = instance.anim.next();
			}

			return instance;
		}

		public destroy(): Thing {
			this.ignore_all();
			delete all_things["" + this.id];
			return this;
		}
	}

	//	-	-	-	-	-	-	-	-	-	-	-	-
	// Anim
	//	-	-	-	-	-	-	-	-	-	-	-	-

	// TODO document this

	export class Anim {

		next() {
			return undefined;
		}
	}

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
	export function vector_to_rotation(s_pos: Vector, t_pos: Vector) {
		let r = atan2(t_pos.y - s_pos.y, t_pos.x - s_pos.x) + PIH;
		r = r / PI2;
		return r;
	}

	//const azimuth = vector_to_rotation;        // deprecate

	// converts a heading/angle to cartesian coords for a distance of 1.0
	// passing in a vec as 'v' makes it write into that vec rather than
	// creating a new one.
	// TODO Make this align with common vector terms
	// TODO integrate with vec
	export function rotation_to_vector(r: number, v?: Vector) {
		r = (r * PI2) - PI;
		if (!v)
			return vec(sin(r), -cos(r));
		v.x = sin(r);
		v.y = -cos(r);
		return v;
	}

	//	-	-	-	-	-	-	-	-	-	-	-	-	-
	// Collisions detection
	//	-	-	-	-	-	-	-	-	-	-	-	-	-

	// Test for circle to circle collision
	// Assumes both hit bodies are set and of the correct type
	export function collide_rad_rad() {
		throw new Error("not implemented");
	}

	// Test for rect to circle collision
	// Assumes both hit bodies are set and of the correct type
	export function collide_rect_rad() {
		throw new Error("not implemented");
	}

	// Test for rect to rect collision
	// Assumes both hit bodies are set and of the correct type
	export function collide_rect_rect() {
		throw new Error("not implemented");
	}

	// Test for a collision between any 2 squids.
	export function collide_squids() {
		throw new Error("not implemented");
	}

	export function collide_pos_squid() {
		throw new Error("not implemented");
	}


	//	-	-	-	-	-	-	-	-	-	-	-	-	-
	// Drawing loop
	// Driven by requestAnimationFrame()
	//	-	-	-	-	-	-	-	-	-	-	-	-	-

	let draw_count = 0;

	// draw the splash screen
	// noinspection SpellCheckingInspection
	const squid_logo_url = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjM2IiBoZWlnaHQ9IjM2NyIgdmlld0JveD0iMCAwIDIzNiAzNjciIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxwYXRoIGQ9Ik01NS4zOTQ1IDE3MS4yNjZMMTAwLjgzMSAzOC4xMDkyTDE4Mi4zNjYgMC40NTMzNjlMMTk1LjQzNyA3OS43NzE4TDE4Mi4zNjYgMTk0Ljk1N0w1NS4zOTQ1IDE3MS4yNjZaIiBmaWxsPSIjREM4NkVBIi8+CjxwYXRoIGQ9Ik01NC4xNDk3IDIyNC4yMUw3Ni41NTY1IDE4MS44ODZMMTAwLjgzMSAxODcuNDg4TDcyLjgyMiAyMjcuMzIyTDg0LjY0NzggMjYwLjMxTDEyMi42MTUgMjY3Ljc3OUwxMTkuNTAzIDMwMS4zODlMODQuNjQ3OCAyOTAuODA4TDc2LjU1NjUgMjY3Ljc3OUw1NC4xNDk3IDIyNC4yMVoiIGZpbGw9IiM5MzMwQTQiLz4KPHBhdGggZD0iTTE4MC40OTkgMjQ4LjQ4NEwxNTkuMzM3IDIwNS41MzhMMTM1LjA2MyAxOTguMDY5TDE2My42OTQgMjU1LjMzMUwxMzUuMDYzIDMyMy43OTZIMTE1Ljc2OEw4NC42NDc4IDM2My4wMDhMMTE5LjUwMyAzNjYuNzQyTDEyOC4yMTcgMzQ1LjU4TDE1Mi40OTEgMzI4Ljc3NUwxODAuNDk5IDI0OC40ODRaIiBmaWxsPSIjOTMzMEE0Ii8+CjxwYXRoIGQ9Ik05NC42MDY0IDIxNC44NzRMMTA3LjY3NyAxOTIuNDY3TDExNS43NjggMTk4LjA2OUwxMDcuNjc3IDIxOC42MDhMMTAwLjgzMSAyNDguNDg0TDk0LjYwNjQgMjE0Ljg3NFoiIGZpbGw9IiM5MzMwQTQiLz4KPHBhdGggZD0iTTEzNS4wNjMgMjA1LjUzOEwxMjQuNDgyIDIwOC4wMjdMMTI4LjIxNyAyMzEuMDU3TDEzNS4wNjMgMjU1LjMzMUwxNDAuNjY1IDIzNC43OTFMMTM1LjA2MyAyMDUuNTM4WiIgZmlsbD0iIzkzMzBBNCIvPgo8cGF0aCBkPSJNMzIuOTg3OCAxOTguMDY5TDYwLjM3MzggMTg3LjQ4OEw0Ni42ODA4IDE3Ni45MDdMMTguNjcyMyAxODcuNDg4TDAgMjUyLjIxOEwzMi45ODc4IDE5OC4wNjlaIiBmaWxsPSIjOTMzMEE0Ii8+CjxwYXRoIGQ9Ik0yMDQuNzczIDIwNS41MzhMMTgzLjYxMSAyMDguMDI3TDIxOS43MTEgMjQ4LjQ4NFYyOTAuODA4TDIzNS44OTQgMjQ4LjQ4NEwyMDQuNzczIDIwNS41MzhaIiBmaWxsPSIjOTMzMEE0Ii8+CjxwYXRoIGQ9Ik04NC42NDc4IDEyOC45ODFMMTAwLjgzMSAxMTkuMDIzTDEyMi42MTUgMTMzLjMzOEw5NC42MDY0IDE1My44NzhMODQuNjQ3OCAxMjguOTgxWiIgZmlsbD0iIzkzMzBBNCIvPgo8cGF0aCBkPSJNMTM1LjA2MyAxNTMuODc4TDE1Mi40OTEgMTMzLjMzOEwxNzEuMTYzIDE1Ny42MTJMMTUyLjQ5MSAxNzMuMTcyTDEzNS4wNjMgMTUzLjg3OFoiIGZpbGw9IiM5MzMwQTQiLz4KPHBhdGggZD0iTTIxMC4zNzUgMTMzLjMzOEwxOTQuMTkyIDE0Ny42NTRMMjAxLjY2MSA5NC43NDg2TDIxMy40ODcgMTA0LjA4NUwyMTAuMzc1IDEzMy4zMzhaIiBmaWxsPSIjOTMzMEE0Ii8+CjxwYXRoIGQ9Ik02MC4zNzM4IDExOS4wMjNMODEuNTM1OCA3MC40NzQ2TDYwLjM3MzggNzYuNjk4N0w1MS4wMzc3IDEwNC4wODVMNjAuMzczOCAxMTkuMDIzWiIgZmlsbD0iIzkzMzBBNCIvPgo8L3N2Zz4K";
	let squid_logo = null;
	let squid_logo_font = null;

	function draw_splash() {
		let sw = canvas.clientWidth;
		let sh = canvas.clientHeight;
		draw_rect_filled(0, 0, sw, sh, "#000");
		if (squid_logo) {
			// logo has loaded
			let dx = (sw - squid_logo.w) * 0.5;
			let dy = (sh - squid_logo.h) * 0.25;
			draw_image(squid_logo, dx, dy);
		}
		draw_text("Squids " + Squids.version + " (" + Squids.code_name + ")", sw * 0.5, sh * 0.9, squid_logo_font, "center", 1.0);
	}

	// draw the overlay debug strings
	function draw_debug() {
		let y = DBG_LINE_HEIGHT;
		for (let m of debug_messages) {
			if (m === undefined)
				m = ""
			draw_text(m, DBG_FONT_SIZE, y + DBG_SHADOW_OFFSET, dbg_font_shadow, "left", 0.9);
			draw_text(m, DBG_FONT_SIZE, y, dbg_font, "left", 0.9);
			y += DBG_LINE_HEIGHT;
		}
	}

	function draw(count: number) {
		// clear canvas
		draw_rect_filled(0, 0, canvas.width, canvas.height, "#000");
		emit("draw", count);
		if (debug_flag) {
			draw_debug();
		}
	}

	function frame() {
		draw_count += 1;
		if (splashing) {
			draw_splash();
		} else {
			draw(draw_count);
		}
		requestAnimationFrame(frame);
	}


	//	-	-	-	-	-	-	-	-	-	-	-	-	-
	// Tick loop
	// Driven by setTimeout()
	//	-	-	-	-	-	-	-	-	-	-	-	-	-

	export let tick_count = 0;			// increments each time a "tick" event is emitted
	export let ts_last = 0;
	export let ideal_tps = 100;        // target ticks per second

	let splashing = 300;     // Timer for Squids splash screen

	function update(delta: number, count: number) {
		emit("physics", delta, count);
		emit("tick", delta, count);
		emit("animate", delta, count);
	}

	// This is what the setInterval actually calls
	function interval() {
		tick_count += 1;
		let ts_now = Date.now();
		let delta = ts_now - ts_last;
		ts_last = ts_now;
		if (splashing) {
			splashing -= 1;
		} else {
			update(delta, tick_count);
		}
	}

	//	-	-	-	-	-	-	-	-	-	-	-	-	-

	export const stats = {tps: 0, fps: 0};

	// This updates ticks and frames per sec values
	let last_tick_count = tick_count;
	let last_draw_count = draw_count;
	setInterval(() => {
		stats.fps = draw_count - last_draw_count;
		last_draw_count = draw_count;
		stats.tps = tick_count - last_tick_count;
		last_tick_count = tick_count;
	}, 1000);

	export function initialize(optional_ideal_ticks_per_second?: number) {
		//	-	-	-	-	-	-	-	-	-	-	-	-	-
		// Canvas related stuff
		//	-	-	-	-	-	-	-	-	-	-	-	-	-

		// Look for a canvas provided by the document.
		// If found, use it, otherwise create one that covers the whole page.

		if (!canvas)		// if no existing canvas found ...
		{
			// create our own
			canvas = document.createElement("canvas");
			canvas.id = "SquidsCanvas";
			canvas.style.position = "absolute";
			canvas.style.left = "0";
			canvas.style.top = "0";
			canvas.style.width = "100vw";
			canvas.style.height = "100vh";
			canvas.style.backgroundColor = "black";

			body.appendChild(canvas);

			canvas.width = canvas.clientWidth;
			canvas.height = canvas.clientHeight;
		}

		ctx = canvas.getContext("2d");

		// Install DOM event listeners for the most commonly used events.
		body.addEventListener("resize", evt => {
			emit("resize", vec(window.innerWidth, window.innerHeight), evt);
		});

		body.addEventListener("pointermove", evt => {
			evt.preventDefault();
			pointer.x = evt.clientX - canvas.offsetLeft;
			pointer.y = evt.clientY - canvas.offsetTop;
			emit("pointermove", pointer.x, pointer.y, cvt_ptr_event(evt));
		});

		body.addEventListener("keyup", evt => {
			let k = evt.key;
			if (k === " ") {
				k = "space";
			}
			keys[k] = false;
			emit("keyup", k, evt);
		});

		body.addEventListener("keydown", evt => {
			let k = evt.key;
			if (k === " ") {
				k = "space";
			}
			keys[k] = true;
			if (k === "`" && evt.ctrlKey) {
				debug_flag = !debug_flag;
			}
			emit("keydown", k, evt);
		});

		body.addEventListener("blur", evt => {
			emit("blur", evt);
		});

		body.addEventListener("focus", evt => {
			emit("focus", evt);
		});

		canvas.addEventListener("pointerdown", evt => {
			evt.preventDefault();
			pointer.x = evt.clientX - canvas.offsetLeft;
			pointer.y = evt.clientY - canvas.offsetTop;
			emit("pointerdown", pointer.x, pointer.y, cvt_ptr_event(evt));
		});

		canvas.addEventListener("pointerup", evt => {
			evt.preventDefault();
			pointer.x = evt.clientX - canvas.offsetLeft;
			pointer.y = evt.clientY - canvas.offsetTop;
			emit("pointerup", pointer.x, pointer.y, cvt_ptr_event(evt));
		});

		if (/([?&])nosplash=/.test(document.location.search)) {
			splashing = 0;
		}

		load_image(squid_logo_url, (image: sImage) => {
			squid_logo = image;
		}, console.error);

		squid_logo_font = load_font("helvetica", 25, "#48a");
		dbg_font = load_font("helvetica", DBG_FONT_SIZE, "#ff0");
		dbg_font_shadow = load_font("helvetica", DBG_FONT_SIZE, "#000");

		ts_last = Date.now();

		// Fire up the ticking and drawing
		setInterval(interval, 1000 / (optional_ideal_ticks_per_second || ideal_tps));
		requestAnimationFrame(frame);
	}
}