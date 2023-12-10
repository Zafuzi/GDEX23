/*!

Squids - An HTML5 canvas-based game engine and a state of mind.

Copyright 2023  Sleepless Software Inc.  All Rights Reserved
See the LICENSE.txt file included with the Squids source code for licensing information

*/

function SQUIDS() {

    //	-	-	-	-	-	-	-	-	-	-	-	-	-
    //  API
    //	-	-	-	-	-	-	-	-	-	-	-	-	-

    // Internal vars
    let { random, sqrt, sin, cos, floor, abs, atan2, PI } = Math;

    const PI2 = PI * 2;	// 1 full rotation (360 degrees)
    const PIH = PI / 2;	// one half of PI

    const body = document.body;


    //	-	-	-	-	-	-	-	-	-	-	-	-	-
    // Debugging 
    // When debug mode is on, the messages in the dbg_msgs array
    // are drawn to the display overlaying everything else
    // as well as lines that show the collision rects/circles,
    // image boundaries and origins, etc.
    //      debug()                 return status of debug flag; true = debug mode is on
    //      debug( flag )           set status of debug flag
    //      debug( n, msg )         set debug msg number 'n' to 'msg'
    //      debug( [ msg, ... ] )   set all dbg msgs
    //	-	-	-	-	-	-	-	-	-	-	-	-	-
    let dbg_flag = false;
    let dbg_msgs = [];
    let debug = function( ...args ) {
        if( args.length >= 2 ) {
            dbg_msgs[ args[ 0 ] | 0 ] = args[ 1 ];
        }
        else
        if( args.length >= 1 ) {
            if( args[ 0 ] instanceof Array ) {
                dbg_msgs = args[ 0 ];
            } else {
                dbg_flag = !! args[ 0 ];
            }
        }
        return dbg_flag;
    };


    //	-	-	-	-	-	-	-	-	-	-	-	-	-

    // last known pointer x,y locations taken from mouse events
    let pointer = { x: 0, y: 0 };

    // Global key up/down status
    // e.g., if( keys[ 'p' ] ) { the "p" key is down }
    // Only useful for polling, not detecting key events
    let keys = {};


    // Return an every increasing integer which can be used
    // as a unique id.
    let seq_num = 0;
    let seq = function() {
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
    let vec = function( x = 0, y = 0, z = 0 ) {

        if( typeof x === "number" ) {
            if( arguments.length == 1 ) {
                y = x; z = x;
            }
        } else {
            y = x.y; z = x.z; x = x.x;
        }
        let v = {
            x, y, z,
        };

        // add 
        v.add = function(x = 0, y = 0, z = 0) {
            if( typeof x === "number" ) {
                if( arguments.length == 1 ) {
                    z = y = x;
                }
            } else {
                z = x.z; y = x.y; x = x.x;
            }
            v.x += x; v.y += y; v.z += z;
            return v;
        }

        // subtract
        v.sub = function(x = 0, y = 0, z = 0) {
            if( typeof x === "number" ) {
                if( arguments.length == 1 ) {
                    z = y = x;
                }
            } else {
                z = x.z; y = x.y; x = x.x;
            }
            v.x -= x; v.y -= y; v.z -= z;
            return v;
        }

        // multiply
        v.mlt = function(x = 0, y = 0, z = 0) {
            if( typeof x === "number" ) {
                if( arguments.length == 1 ) {
                    z = y = x;
                }
            } else {
                z = x.z; y = x.y; x = x.x;
            }
            v.x *= x, v.y *= y, v.z *= z;
            return v;
        }

        // divide
        v.div = function(x = 0, y = 0, z = 0) {
            if( typeof x === "number" ) {
                if( arguments.length == 1 ) {
                    z = y = x;
                }
            } else {
                z = x.z; y = x.y; x = x.x;
            }
            v.x /= x; v.y /= y; v.z /= z;
            return v;
        }

        v.qmag = function() {
            return ( v.x * v.x ) + ( v.y * v.y );   // XXX z?
        }

        v.mag = function() {
            return sqrt( v.qmag() );
        };

        return v;
    };


    //	-	-	-	-	-	-	-	-	-	-	-	-	-

    // Return a font-ish object that you can pass into draw_text().
    // This simply uses any font that the browser can provide.
    // TODO support bold/italic/underline?
    let load_font = function( face, size, color ) {
        let font = { height: size, face: face, style: "" + size + "px " + face, color: color };
        return font;
    };

    // Set up default font(s)
    const DBG_FONT_SIZE = 16;
    const DBG_LINE_HEIGHT = DBG_FONT_SIZE + ( DBG_FONT_SIZE * 0.1 );
    const DBG_SHADOW_OFFSET = DBG_FONT_SIZE * 0.1;
    let dbg_font = load_font( "helvetica", DBG_FONT_SIZE, "#ff0" );
    let dbg_font_shadow = load_font( "helvetica", DBG_FONT_SIZE, "#000" );


    //	-	-	-	-	-	-	-	-	-	-	-	-	-

    // load and return an image object given its path.
    let load_image = function( path, okay = ()=>{}, fail = ()=>{} ) {
        let e = document.createElement( "img" );
        e.src = path;
        e.style.display = "none";
        e.onload = function() {
            let img = {
                w: e.width,
                h: e.height,
                data: e,
                smoothing: true,
            };
            img.size = function() {
                return vec( img.w, img.h );
            };
            img.make_radius = function() {
                let size = img.size();	// get image w, h
                return ( ( size.x + size.y ) / 2 ) * 0.5;	// half of average of w and h
            };
            e.remove();	// remove from DOM - not needed anymore
            okay(img);
        };
        e.onerror = function(err) {
            fail(err);
        };
        body.appendChild(e);	// add image to DOM so it will load
    };


    //	-	-	-	-	-	-	-	-	-	-	-	-	-

    // load and return a sound object given its path.
    let loaded_sounds = [];
    let load_sound = function( path, okay = ()=>{} , fail = ()=>{} ) {
        let snd = new Howl({
            src: [ path ], 
            onload: () => {
                okay( snd );
            },
            onloaderror: err => {
                fail( err );
            },
        });
        loaded_sounds.push( snd );
    };


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
    // TODO: Make this take one array of all assets rather separate ones for imgs & snds
    let load_assets = function( base, img_paths, snd_paths, progress = ()=>{} , fail = ()=>{} ) {

        let total = img_paths.length + snd_paths.length;

        let done =  0;

        let rp = sleepless.runp();      // XXX remove dependency on runp()
        for( let path of img_paths ) {
            rp.add( fin => {
                load_image( base + "/" + path, img => {
                    done += 1;
                    progress( done / total, path, img, 'image' );
                    fin();
                }, e => {
                    fail( "Error loading image: "+path );
                }); 
            } );
        }

        for( let path of snd_paths ) {
            rp.add( fin => {
                load_sound( base + "/" + path, snd => {
                    done += 1;
                    progress( done / total, path, snd, 'sound' );
                    fin();
                }, e => {
                    fail( "Error loading sound: "+path );
                }); 
            } );
        }

        rp.run( ()=>{}  );	// load 'em up, cowboy

    };


    //	-	-	-	-	-	-	-	-	-	-	-	-	-
    // Canvas related stuff
    //	-	-	-	-	-	-	-	-	-	-	-	-	-

    // Look for a canvas provided by the document.
    // If found, use it, otherwise create one that covers the whole page.

    let canvas = document.getElementById("SquidsCanvas");	// look for provided canvas
    if(!canvas)		// if no existing canvas found ...
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

    let screen = { width: canvas.clientWidth, height: canvas.clientHeight };
    //const screen = function() {
     //   return { width: canvas.clientWidth, height: canvas.clientHeight };
    //};

    const ctx = canvas.getContext("2d");

    // Draw a text str at a given pos, in a given font,
    // with a given alignment and opacity
    // TODO add rotation, scale
    let draw_text = function( str, x, y, font, align, opa, /* rot, scl */ ) {
        ctx.save();
        ctx.font = font.style;
        ctx.fillStyle = font.color;
        ctx.textBaseline = 'middle';
        ctx.textAlign = align || 'center';
        ctx.globalAlpha = opa;
        ctx.fillText( str, x, y );
        let w = ctx.measureText( str ).width;
        ctx.restore();
        return w;
    };

    // return the width in pixels of a string WERE IT TO BE drawn in the given font
    let text_width = function( str, font ) {
        ctx.save();
        ctx.font = font.style;
        ctx.textBaseline = 'middle';
        let w = ctx.measureText( str ).width;
        ctx.restore();
        return w;
    };


    // Draw a line from one point to another, with a given color
    let draw_line = function( x1 = 0, y1 = 0, x2 = 10, y2 = 10, color = "#777", opa ) {
        ctx.save();
        ctx.globalAlpha = opa;
        ctx.strokeStyle = color;
        ctx.beginPath();
        ctx.moveTo( x1, y1 );
        ctx.lineTo( x2, y2 );
        ctx.stroke();
        ctx.restore();
    }

    // Draw an unfilled rectangle
    let draw_rect_unfilled = function( dx = 0, dy = 0, dw = 10, dh = 10, color = "#777", opa = 1, rot = 0 ) {
        ctx.save();
        ctx.globalAlpha = opa;

        let ox = dx + (dw * 0.5);
        let oy = dy + (dh * 0.5);
        ctx.translate( ox, oy );
        ctx.rotate( rot * PI2 );
        ctx.translate( -ox, -oy );

        ctx.strokeStyle = color;
        ctx.strokeRect(dx, dy, dw, dh);
        ctx.restore();
    }

    // Draw a filled rectangle
    // to alter opacity, change color to something like "rgba(r,g,b,opa)" or similar
    let draw_rect_filled = function( x, y, w, h, color, opa = 1, rot = 0 ) {
        ctx.save();
        ctx.globalAlpha = opa;

        let ox = x + (w * 0.5);
        let oy = y + (h * 0.5);
        ctx.translate( ox, oy );
        ctx.rotate( rot * PI2 );
        ctx.translate( -ox, -oy );

        ctx.fillStyle = color;
        ctx.fillRect( x, y, w, h);
        ctx.restore();
    };


    // Draw an unfilled circle with a given radius and color
    let draw_circle_unfilled = function( dx = 0, dy = 0, r = 10, color = "#777", opa = 1 ) {
        ctx.save();
        ctx.globalAlpha = opa;
        ctx.strokeStyle = color;
        ctx.beginPath();
        ctx.ellipse( dx, dy, r, r, 0, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.restore();
    }

    // Draw a crosshair at dx, dy
    // Really only exists for debug mode
    let draw_cross = function( dx = 0 , dy = 0 , size = 25 , color = "#777", opa = 1, rot = 0 ) {
        ctx.save();
        ctx.globalAlpha = opa;
        ctx.translate( dx, dy );
        ctx.rotate( rot * PI2 );
        ctx.translate( -dx, -dy );
        ctx.strokeStyle = color;
        ctx.beginPath();
        ctx.moveTo( dx - size, dy );
        ctx.lineTo( dx + size, dy );
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo( dx, dy - size );
        ctx.lineTo( dx, dy + size );
        ctx.stroke();
        ctx.restore();
    }

    // Draw image onto canvas at dx,dy, with opacity, rotation, and scaling
    // Arguments:
    // 	img = the source image
    // 	dx,dy = destination x,y
    // 	opa = opacity (gangnam style)
    // 	rot = rotation angle
    // 	px,py = x,y of pivot point for rotation image top-left corner
    // 	sclx,scly = scaling factor 1.0 = normal size
    // 	sx,sy = x,y offset into img of top left corner of sub-rectangle
    // 	sw,sh = sw,sh width and height of subrectangle
    let draw_image = function( img, dx = 0, dy = 0, opa = 1, rot = 0, px = img.w * 0.5, py = img.h * 0.5, sclx = 1, scly = 1, sx = 0, sy = 0, sw = img.w, sh = img.h ) {

        ctx.save();
        ctx.imageSmoothingEnabled = img.smoothing;
        ctx.globalAlpha = opa;

        let dw = sw * sclx;
        let dh = sh * scly;

        if(rot == 0) {
            ctx.drawImage(img.data, sx, sy, sw, sh, dx, dy, dw, dh );
        } else {
            ctx.translate(dx + px, dy + py);
            ctx.rotate( rot * PI2 );
            ctx.translate(-(dx + px), -(dy + py));
            ctx.drawImage(img.data, sx, sy, sw, sh, dx, dy, dw, dh);
        }

        if( dbg_flag ) {
            draw_rect_filled( dx, dy, dw, dh, "#0ff", 0.1);
        }

        ctx.restore();
    };


    //	-	-	-	-	-	-	-	-	-	-	-	-	-
    // Events
    //	-	-	-	-	-	-	-	-	-	-	-	-	-

    // This holds references to the event listeners.
    // Each attribute in this object is one of the event types
    // and its corresponding value is another object with
    // an attribute for each Squid id that is listening for that event.
    const listeners = {
        // tick: {
        //      "1": { t: squid, f: func },
        //      ...
        // }
        // ...
    };

    // special ordered array of "draw" listeners sorted by priority
    let sorted_draw_listeners = [];

    // Get listeners for draw event as array and sort them by priority
    let sort_for_draw = function() {
        sorted_draw_listeners = Object.values( listeners[ "draw" ] ) || [];
        sorted_draw_listeners.sort( ( a, b ) => a.t.priority - b.t.priority );
    }

    // Dispatch an event of type 'type' to all things that are listening for it
    // Returns an array of listener references that the event was sent to.
    let emit = function( ...args ) {
        if( splashing )
            return;
        //let args = Array.prototype.slice.call( arguments ); // convert args to real array
        //args.shift();				// discard the first arg (type)
        let type = args.shift();
        let l = listeners[ type ];	// get hash of listeners
        if( ! l )
            return [];			// no listeners
        let objs = Object.values( l );
        if( type === "draw" ) {	// if in the special case of the draw event ...
            objs = sorted_draw_listeners;	// use this sorted array instead (see listen())
        }
        for( let o of objs ) {	// walk through listeners ...
            let sq = o.t;		// get Squid reference
            if( sq.active ) {
                let fn = o.f;		// get listener func
                fn.apply( sq, args );	// call listener func with remaining args
            }
        }
        return objs;
    }


    // Install DOM event listeners for the most commonly used events.

    body.addEventListener( "resize", evt => {
        emit("resize", vec( window.innerWidth, window.innerHeight ), evt);
    } );

    let cvt_ptr_event = function( evt ) {
        return {
            id: evt.pointerId,
            x: evt.clientX - canvas.offsetLeft,
            y: evt.clientY - canvas.offsetTop,
            type: evt.type,
            pointer_type: evt.pointerType,
            primary: evt.isPrimary,
        };
    };

    canvas.addEventListener( "pointerdown", evt => {
        evt.preventDefault();
        pointer.x = evt.clientX - canvas.offsetLeft;
        pointer_y = evt.clientY - canvas.offsetTop;
        emit( "pointerdown", pointer.x, pointer_y, cvt_ptr_event( evt ) );
    } );

    canvas.addEventListener( "pointerup", evt => {
        evt.preventDefault();
        pointer.x = evt.clientX - canvas.offsetLeft;
        pointer_y = evt.clientY - canvas.offsetTop;
        emit( "pointerup", pointer.x, pointer_y, cvt_ptr_event( evt ) );
    } );

    body.addEventListener( "pointermove", evt => {
        evt.preventDefault();
        pointer.x = evt.clientX - canvas.offsetLeft;
        pointer_y = evt.clientY - canvas.offsetTop;
        emit( "pointermove", pointer.x, pointer_y, cvt_ptr_event( evt ) );
    } );

    body.addEventListener( "keyup", evt => {
        let k = evt.key;
        if( k === " " ) {
            k = "space";
        }
        keys[ k ] = false;
        emit( "keyup", k, evt );
    } );

    body.addEventListener( "keydown", evt => {
        let k = evt.key;
        if(k === " ") {
            k = "space";
        }
        keys[ k ] = true;
        if( k === "`" && evt.ctrlKey ) {
            dbg_flag = ! dbg_flag;
        }
        emit("keydown", k, evt);
    } );

    body.addEventListener( "blur", evt => {
        emit("blur", evt);
    } );

    body.addEventListener( "focus", evt => {
        emit("focus", evt);
    } );
 
    /*
    // convert array of touch events to an array of id, x, y objects
    let touches2array = function( touches ) {
        let arr = [];
        for( let t of touches ) {
            arr.push( { id: t.identifier, x: t.pageX, y: t.pageY } );
        }
        return arr;
    };

    body.addEventListener( "touchstart", evt => {
        evt.preventDefault();
        emit( "touchstart", touches2array( evt.changedTouches ) ); 
    } );

    body.addEventListener( "touchmove", evt => {
        evt.preventDefault();
        emit( "touchmove", touches2array( evt.changedTouches ) ); 
    } );

    body.addEventListener( "touchend", evt => {
        evt.preventDefault();
        emit( "touchend", touches2array( evt.changedTouches ) ); 
    } );

    body.addEventListener( "touchcancel", evt => {
        evt.preventDefault();
        emit( "touchcancel", touches2array( evt.changedTouches ) ); 
    } );
    */


    // Global hash of all instantiated Squids.
    let all_things = {};

    // Destroy all instantiated Squids 
    let destroy_things = function() {
        for( let thing of Object.values( all_things ) ) {
            thing.destroy();
        }
        all_things = {};
    };

    // Stops all music and audio playing
    let stop_audio = function() {
        for( let snd of loaded_sounds ) {
            snd.off();
            snd.stop();
        }
        // XXX loaded_sounds keeps growing!
    };


    // Destroy all things and Stop all music and audio
    let reset = function( cb ) {
        destroy_things();
        stop_audio();
        if( cb ) {
            setTimeout( cb, 1 );
        }
    };


    //	-	-	-	-	-	-	-	-	-	-	-	-	-
    // Squid
    //	-	-	-	-	-	-	-	-	-	-	-	-	-
    const Squid = function( position = vec( 0, 0 ), img = null, rot = 0, opa = 1, scl = 1 ) {

        const self = this

        // Create a unique and immutable id number
        Object.defineProperty( self, "id", { value: seq(), writable: false, } );

        // This flag controls whether this squid should be behave normally, or be inert
        // If false, then the tick, physics, draw, animate, functions will not operate,
        // even though it continues to exist
        self.active = true;

        // ------------------------
        // Events
        // ------------------------

        // Listen for an event
        self.listen = function( evt_type, f = ()=>{}  ) {

            let l = listeners[ evt_type ];		// get listeners for event type
            if( l === undefined ) {				// if hash doesn't yet exist ...
                l = listeners[ evt_type ] = {};	// create it
            }

            l[ ""+self.id ] = { t: self, f };	// insert wrapped data into hash

            if( evt_type === "draw" ) {
                // special case; update priority-sorted list for drawing
                sort_for_draw();
            }

            return self;
        }

        // Stop listening for an event
        self.ignore = function( evt_type ) {
            if( listeners[ evt_type ] !== undefined ) {
                delete listeners[ evt_type ][ ""+self.id ];
            }
            return self;
        };

        // Stop listening for all events
        self.ignore_all = function() {
            for( let type in listeners ) {
                // remove self from listeners
                //for( let o of Object.values( listeners[ type ] ) ) {
                //    if( self === o.t ) {
                //        self.ignore( type );
                //    }
                //}
                delete listeners[ type ][ ""+self.id ];
                if( type == "draw" ) {
                    // special case; remove self from sorted draw list
                    sorted_draw_listeners = sorted_draw_listeners.filter( o => {
                        return o.t !== self;
                    });
                }
            }
            return self;
        };

 
        // ------------------------
        // Appearance
        // ------------------------

        self.position = position;
        self.image = img;
        self.font = null;
        self.text = null;
        self.rotation = rot;    // 0.0 - 1.0
        self.opacity = opa;
        self.scale = scl;
        self.pivot = vec( 0, 0 );
        self.priority = 0;	
        self.align = "center";

        // Set visual draw priority - lower numbers drawn first
        self.draw_priority = function( n ) {
            if( n === undefined )
                return self.priority;
            n = floor( n );
            self.priority = n;		// store new pri
            sort_for_draw();
            return self;
        }

        // rotate this squid to face another squid
        self.rotate_to = function( other ) {
            self.rotation = vector_to_rotation( self.position, other.position );
            return self;
        };

        // Generic, default squid drawing function
        self.default_draw = function() {

            if( ! self.active )
                return;

            let { scale, opacity, rotation, text, font, align } = self; // to avoid self.*
            let { x, y } = self.position;

            let img = self.image;
            if( img ) {
                let dw = img.w * scale;	// width of scaled img to dest
                let dh = img.h * scale;	// height of scaled img to dest
                let dx = x - (dw / 2);	// offset left 1/2 img width
                let dy = y - (dh / 2);	// offset up 1/2 img height
                let pvtx = dw * 0.5;
                let pvty = dh * 0.5;
                draw_image( img, dx, dy, opacity, rotation, pvtx, pvty, scale, scale );
            }

            if( text ) {
                draw_text( text, x, y, font || dbg_font, align || "center", opacity, rotation, scale );
            }

            if( dbg_flag ) {
                // debug mode; draw some additional stuff 
                draw_cross( x, y, 10, "#0ff", 0.8, rotation ); // crosshair at squid pos
                // draw collision body
                let sh = self.body;
                if( sh !== null && sh !== undefined ) {
                    if( typeof sh === "number" ) {
                        // circle
                        draw_circle_unfilled( x, y, sh * scale, "#0f0", 0.9 );
                    } else {
                        // rect
                        let dx = x - ( ( sh.x * scale ) * 0.5 );
                        let dy = y - ( ( sh.y * scale ) * 0.5 );
                        draw_rect_unfilled( dx, dy, sh.x * scale, sh.y * scale, "#f00", 0.9 );
                    }
                }
            }
        };


        // ------------------------
        // Physics (motion, and collision detection)
        // TODO: replace this with a better physics engine (matter.js?)
        // ------------------------

        self.velocity = vec( 0, 0 );
        self.velocity_limit = null;
        self.gravity = vec( 0, 0 );

        // Apply thrust to a squid in the direction that it's facing.
        // TODO modify velocity without making new vecs
        // XXX Move out of squids.js
        self.thrust = function( amount ) {
            let c = rotation_to_vector( self.rotation );
            if( ! self.velocity )
                self.velocity = vec( 0 );
            c.mlt( amount );
            self.velocity.add( c );
        };

        // Collision body
        // One of:
        //		- null		none - an incorporeal squid
        //		- number	circular body with this radius
        //		- vec		rectangular body with this width and hight
        // XXX: The rectangular body doesn't rotate with the squid imagery
        self.body = null;

        self.default_physics = function() {
            
            if( ! self.active ) 
                return;

            // simplistic newtonian motion
            // XXX broken
            if( self.position && self.velocity ) {
                self.position = vec( self.position ).add( self.velocity );
                if( typeof self.velocity_limit !== "number" || self.velocity.length() <= self.velocity_limit )
                    self.velocity = vec( self.velocity ).add( self.gravity );
            }

            // simplistic collision detection
            if( self.body ) {
                if( listeners[ "collide" ] ) {
                    let others = Object.values( listeners[ "collide" ] );
                    let sq1 = self;
                    let other = null;
                    for( let l of others ) {
                        other = l.t;
                        if( self === other )
                            continue;	// don't collide with yourself
                        if( ! collide_squids( self, other ) )
                            continue;   // not touching
                        // Call collide event listener of "other"
                        // When we get around to testing other against self,
                        // that'll end up doing the same for self (TODO: Optimize ?)
                        l.f.apply( self, [ self, other, ] );
                    }
                }
            }

            return self;
        };


        // ------------------------
        // Tick / Update
        // ------------------------
        self.default_tick = function() {
        };


        // ------------------------
        // Animation
        // ------------------------

        self.default_animate = function() {
            if( self.active && self.anim ) 
                self.image = self.anim.next();
        };


        // ------------------------
        // Install default handlers
        // ------------------------

        self.listen( "physics", self.default_physics );
        self.listen( "tick", self.default_tick );
        self.listen( "animate", self.default_animate );
        self.listen( "draw", self.default_draw );


        // Remove from the set of all instantiated squids
        self.destroy = function() {
            self.ignore_all();
            delete all_things[ ""+self.id ];
        };

        // Add myself to the set of all instantiated squids
        all_things[ ""+self.id ] = self ;

        return self;

    };



    //	-	-	-	-	-	-	-	-	-	-	-	-
    // Anim
    //	-	-	-	-	-	-	-	-	-	-	-	-
    
    // TODO document this

    const Anim = function( imgs, fps = 10, loop = true, playing = true ) {

        let ts_start = Date.now();

        let anim = {
            imgs,
            loop,
            playing,
            fps,
            frame: 0,
        };

        anim.play = function( start_frame = 0 ) {
            anim.frame = start_frame;
            anim.playing = true;
            ts_start = Date.now();
            return anim;
        };

        anim.restart = function() {
            return anim.play( 0 );
        }

        anim.stop = function() {
            anim.playing = false;
            return anim;
        }

        anim.next = function() {
            if( anim.playing ) {
                let ts_elapsed = Date.now() - ts_start;
                anim.frame = floor( ts_elapsed / ( 1000 / fps ) );
                if( anim.frame >= imgs.length ) {
                    // trying to step to next, non-existent frame.
                    if( loop ) {
                        anim.play( 0 );
                        //anim.frame = 0;
                        //ts_start = Date.now();
                    } else {
                        anim.playing = false;
                        anim.frame = imgs.length - 1;
                    }
                }
            }
            return imgs[ anim.frame ];
        }

        return anim;
    };


    //	-	-	-	-	-	-	-	-	-	-	-	-

    // takes a source position and a target position and 
    // returns a number from 0.0 thru PI * 2 that represents the angle
    // between the two, or the "heading" from source to target
    // TODO Make this align with common vector terms
    // TODO integrate with vec
    let vector_to_rotation = function( s_pos, t_pos ) {
        let r = atan2( t_pos.y - s_pos.y, t_pos.x - s_pos.x ) + PIH;
        r = r / PI2;
        return r;
    }
    //const azimuth = vector_to_rotation;        // deprecate

    // converts a heading/angle to cartesion coords for a distance of 1.0
    // passing in a vec as 'v' makes it write into that vec rather than
    // creating a new one.
    // TODO Make this align with common vector terms
    // TODO integrate with vec
    let rotation_to_vector = function( r, v ) {
        r = ( r * PI2 ) - PI;
        if( ! v ) 
            return vec( sin( r ), -cos( r ) );
        v.x = sin( r );
        v.y = -cos( r );
        return v;
    }
    // const cartes = rotation_to_vector;  // deprecate



    //	-	-	-	-	-	-	-	-	-	-	-	-	-
    // Collisions detection
    //	-	-	-	-	-	-	-	-	-	-	-	-	-

    // Test for circle to circle collision
    // Assumes both hit bodies are set and of the correct type
    let collide_rad_rad = function( sq1, sq2 ) {
        let scl1 = sq1.scale;
        let scl2 = sq2.scale;
        let rr = ( ( sq1.body * scl1 ) + ( sq2.body * scl2 ) );
        let rhit = rr * rr;
        let xx = abs( sq2.position.x - sq1.position.x );
        let yy = abs( sq2.position.y - sq1.position.y );
        let rdist = (xx * xx) + (yy * yy);
        return rdist < rhit;
    };

    // Test for rect to circle collision
    // Assumes both hit bodies are set and of the correct type
    let collide_rect_rad = function( sq1, sq2 ) {
        let scl1 = sq1.scale;
        let hw = ( sq1.body.x * scl1 ) * 0.5;
        let hh = ( sq1.body.y * scl1 ) * 0.5;
        let rad = sq2.body * sq2.scale;
        let p1x = sq1.position.x;
        let p1y = sq1.position.y;
        let p2x = sq2.position.x;
        let p2y = sq2.position.y;
        if( p2x + rad < p1x - hw )
            return false;
        if( p2x - rad > p1x + hw )
            return false;
        if( p2y + rad < p1y - hh )
            return false;
        if( p2y - rad > p1y + hh )
            return false;
        return true;
    };

    // Test for rect to rect collision
    // Assumes both hit bodiess are set and of the correct type
    let collide_rect_rect = function( sq1, sq2 ) {

        // scale up the hit rects
        let p1 = sq1.position;
        let p2 = sq2.position;
        let size1 = vec( sq1.body ).mlt( sq1.scale );
        let size2 = vec( sq2.body ).mlt( sq2.scale );

        let d = abs( p1.x - p2.x );
        let s = ( size1.x + size2.x ) * 0.5;
        if( d > s )
            return false;

        d = abs( p1.y - p2.y );
        s = ( size1.y + size2.y ) * 0.5;
        if( d > s )
            return false;

        return true;
    };

    // Test for a collision between any 2 squids.
    let collide_squids = function( sq1, sq2 ) {
        let sh1 = sq1.body;
        let sh2 = sq2.body;
        if( sh1 === null || sh1 === undefined || sh2 === null || sh2 === undefined ) 
            return false;	// need two actual bodies to make a collision
        if( typeof sh1 === "number" ) {
            if( typeof sh2 === "number" ) {
                // ---> sq1.circle to sq2.circle
                if( collide_rad_rad( sq1, sq2 ) ) {
                    return true;
                }
            } else {
                // ---> sq1.circle to sq2.square
                if( collide_rect_rad( sq2, sq1 ) ) {
                    return true;
                }
            }
        } else {
            if( typeof sh2 === "number" ) {
                // ---> sq1.square to sq2.circle
                if( collide_rect_rad( sq1, sq2 ) ) {
                    return true;
                }
            } else {
                // ---> sq1.square to sq2.square
                if( collide_rect_rect( sq1, sq2 ) ) {
                    return true;
                }
            }
        }
        return false;
    }

    // Run simple collision detection on all squids that are 
    // listening for the "collide" event.
    /*
    let collide = function() {
        if( ! listeners["collide"] )
            return;
        let colliders = Object.values( listeners[ "collide" ] );
        for( let co1 of colliders ) {
            for( let co2 of colliders ) {
                let sq1 = co1.t;
                let sq2 = co2.t;
                if( sq1 === sq2 )
                    continue;	// don't collide with yourself
                if( ! collide_squids( sq1, sq2 ) )
                    continue;
                // call collide event listener on sq1
                // when we get around to testing sq2 against sq1
                // we'll end up doing the same for sq2 (TODO: Optimize this)
                co1.f.apply( sq1, [ sq2, sq1 ] );
            }
        }
    }
    */


    // Test to see if a point is within a squid's body
    const pos_test_squid = new Squid();
    pos_test_squid.body = 1;
    let collide_pos_squid = function( pos, sq2 ) {
        let sq1 = pos_test_squid;
        sq1.position.x = pos.x;
        sq1.position.y = pos.y;
        let hit = collide_squids( sq1, sq2 );
        return hit
    }



    //	-	-	-	-	-	-	-	-	-	-	-	-	-
    // Drawing loop
    // Driven by requestAnimationFrame()
    //	-	-	-	-	-	-	-	-	-	-	-	-	-

    let draw_count = 0;

    // draw the splash screen
    const squid_logo_url = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjM2IiBoZWlnaHQ9IjM2NyIgdmlld0JveD0iMCAwIDIzNiAzNjciIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxwYXRoIGQ9Ik01NS4zOTQ1IDE3MS4yNjZMMTAwLjgzMSAzOC4xMDkyTDE4Mi4zNjYgMC40NTMzNjlMMTk1LjQzNyA3OS43NzE4TDE4Mi4zNjYgMTk0Ljk1N0w1NS4zOTQ1IDE3MS4yNjZaIiBmaWxsPSIjREM4NkVBIi8+CjxwYXRoIGQ9Ik01NC4xNDk3IDIyNC4yMUw3Ni41NTY1IDE4MS44ODZMMTAwLjgzMSAxODcuNDg4TDcyLjgyMiAyMjcuMzIyTDg0LjY0NzggMjYwLjMxTDEyMi42MTUgMjY3Ljc3OUwxMTkuNTAzIDMwMS4zODlMODQuNjQ3OCAyOTAuODA4TDc2LjU1NjUgMjY3Ljc3OUw1NC4xNDk3IDIyNC4yMVoiIGZpbGw9IiM5MzMwQTQiLz4KPHBhdGggZD0iTTE4MC40OTkgMjQ4LjQ4NEwxNTkuMzM3IDIwNS41MzhMMTM1LjA2MyAxOTguMDY5TDE2My42OTQgMjU1LjMzMUwxMzUuMDYzIDMyMy43OTZIMTE1Ljc2OEw4NC42NDc4IDM2My4wMDhMMTE5LjUwMyAzNjYuNzQyTDEyOC4yMTcgMzQ1LjU4TDE1Mi40OTEgMzI4Ljc3NUwxODAuNDk5IDI0OC40ODRaIiBmaWxsPSIjOTMzMEE0Ii8+CjxwYXRoIGQ9Ik05NC42MDY0IDIxNC44NzRMMTA3LjY3NyAxOTIuNDY3TDExNS43NjggMTk4LjA2OUwxMDcuNjc3IDIxOC42MDhMMTAwLjgzMSAyNDguNDg0TDk0LjYwNjQgMjE0Ljg3NFoiIGZpbGw9IiM5MzMwQTQiLz4KPHBhdGggZD0iTTEzNS4wNjMgMjA1LjUzOEwxMjQuNDgyIDIwOC4wMjdMMTI4LjIxNyAyMzEuMDU3TDEzNS4wNjMgMjU1LjMzMUwxNDAuNjY1IDIzNC43OTFMMTM1LjA2MyAyMDUuNTM4WiIgZmlsbD0iIzkzMzBBNCIvPgo8cGF0aCBkPSJNMzIuOTg3OCAxOTguMDY5TDYwLjM3MzggMTg3LjQ4OEw0Ni42ODA4IDE3Ni45MDdMMTguNjcyMyAxODcuNDg4TDAgMjUyLjIxOEwzMi45ODc4IDE5OC4wNjlaIiBmaWxsPSIjOTMzMEE0Ii8+CjxwYXRoIGQ9Ik0yMDQuNzczIDIwNS41MzhMMTgzLjYxMSAyMDguMDI3TDIxOS43MTEgMjQ4LjQ4NFYyOTAuODA4TDIzNS44OTQgMjQ4LjQ4NEwyMDQuNzczIDIwNS41MzhaIiBmaWxsPSIjOTMzMEE0Ii8+CjxwYXRoIGQ9Ik04NC42NDc4IDEyOC45ODFMMTAwLjgzMSAxMTkuMDIzTDEyMi42MTUgMTMzLjMzOEw5NC42MDY0IDE1My44NzhMODQuNjQ3OCAxMjguOTgxWiIgZmlsbD0iIzkzMzBBNCIvPgo8cGF0aCBkPSJNMTM1LjA2MyAxNTMuODc4TDE1Mi40OTEgMTMzLjMzOEwxNzEuMTYzIDE1Ny42MTJMMTUyLjQ5MSAxNzMuMTcyTDEzNS4wNjMgMTUzLjg3OFoiIGZpbGw9IiM5MzMwQTQiLz4KPHBhdGggZD0iTTIxMC4zNzUgMTMzLjMzOEwxOTQuMTkyIDE0Ny42NTRMMjAxLjY2MSA5NC43NDg2TDIxMy40ODcgMTA0LjA4NUwyMTAuMzc1IDEzMy4zMzhaIiBmaWxsPSIjOTMzMEE0Ii8+CjxwYXRoIGQ9Ik02MC4zNzM4IDExOS4wMjNMODEuNTM1OCA3MC40NzQ2TDYwLjM3MzggNzYuNjk4N0w1MS4wMzc3IDEwNC4wODVMNjAuMzczOCAxMTkuMDIzWiIgZmlsbD0iIzkzMzBBNCIvPgo8L3N2Zz4K";
    let squid_logo = null; 
    load_image( squid_logo_url, img => { squid_logo = img; }, console.error );
    let squid_logo_font = load_font( "helvetica", 25, "#48a" );
    const draw_splash = function() {
        let sw = canvas.clientWidth;
        let sh = canvas.clientHeight;
        draw_rect_filled( 0, 0, sw, sh, "#000");
        if( squid_logo ) {
            // logo has loaded
            let dx = ( sw - squid_logo.w ) * 0.5;
            let dy = ( sh - squid_logo.h ) * 0.25;
            draw_image( squid_logo, dx, dy );
        }
        draw_text( "Squids "+Squids.version+" ("+Squids.code_name+")", sw * 0.5, sh * 0.9, squid_logo_font, "center", 1.0 );
    };

    // draw the overlay debug strings
    const draw_debug = function() {
        let y = DBG_LINE_HEIGHT;
        for( let m of dbg_msgs ) {
            if( m === undefined )
                m = ""
            draw_text( m, DBG_FONT_SIZE, y + DBG_SHADOW_OFFSET, dbg_font_shadow, "left", 0.9 );
            draw_text( m, DBG_FONT_SIZE, y, dbg_font, "left", 0.9 );
            y += DBG_LINE_HEIGHT;
        }
    };

    const on_draw_default = function( count ) {
        // clear canvas
        draw_rect_filled( 0, 0, screen.width, screen.height, "#000");
        emit( "draw" );
        /*for( let thing of Object.values( all_things ) ) {
            if( thing.on_draw ) {
                thing.on_draw( count );
            }
        }*/
        if( dbg_flag ) {
            draw_debug();
        }
    };

    const frame = function() {
        draw_count += 1;
        if( splashing ) {
            draw_splash();
        } else {
            Squids.on_draw( draw_count );
        }
        requestAnimationFrame( frame );
    };


    //	-	-	-	-	-	-	-	-	-	-	-	-	-
    // Tick loop
    // Driven by setTimeout()
    //	-	-	-	-	-	-	-	-	-	-	-	-	-

    let tick_count = 0;			// increments each time a "tick" event is emitted
    let may_tick = false;		// flag controlling dispatch of "tick" events to listeners
    let ts_last = Date.now();
    const ideal_tps = 100;        // target ticks per second
    let tick_id = false;

    let splashing = 300;     // Timer for Squids splash screen
    if( /(\?|&)nosplash=/.test( document.location.search ) ) {
        splashing = 0;
    }

    const on_time_default = function( delta, count ) {
        emit( "physics", delta, count );
        emit( "tick", delta, count );
        emit( "animate", delta, count );
    };

    // This is what the setInterval actually calls
    const interval = function() {
        tick_count += 1;
        let ts_now = Date.now();
        let delta = ts_now - ts_last;
        ts_last = ts_now;
        if( splashing ) {
            splashing -= 1;
        } else {
            Squids.on_time( delta, tick_count );
        }
    }



    //	-	-	-	-	-	-	-	-	-	-	-	-	-

    const stats = { tps: 0, fps: 0 };

    // This updates ticks and frames per sec values
    let last_tick_count = tick_count;
    let last_draw_count = draw_count;
    setInterval( () => {
        stats.fps = draw_count - last_draw_count;
        last_draw_count = draw_count;
        stats.tps = tick_count - last_tick_count;
        last_tick_count = tick_count;
    }, 1000 );


    //	-	-	-	-	-	-	-	-	-	-	-	-	-

    const globalize = function() {
        for( let k in Squids ) {
            globalThis[ k ] = Squids[ k ];
        }
    }

    let Squids = {
        debug,
        reset,
        vec,
        emit,
        load_font,
        load_sound,
        load_image,
        load_assets,
        draw_text,
        text_width,
        draw_line,
        draw_rect_unfilled,
        draw_rect_filled,
        draw_circle_unfilled,
        draw_cross,
        draw_image,
        Squid,
        Anim,
        vector_to_rotation,
        rotation_to_vector,
        vector_to_rotation,
        rotation_to_vector,
        collide_squids,
        collide_pos_squid,
        pointer,
        keys,
        screen,
        stats,
        on_time: on_time_default,
        on_draw: on_draw_default,
        globalize,
    };

    Object.defineProperty( Squids, "version", { value: "6.4.0", code_name: "Grumble", writable: false, } );
    Object.defineProperty( Squids, "code_name", { value: "Quiver", writable: false, } );


    // Fire up the ticking and drawing
    setInterval( interval, 1000 / ideal_tps );
    requestAnimationFrame( frame );


    return Squids;
}

globalThis.Squids = new SQUIDS();

