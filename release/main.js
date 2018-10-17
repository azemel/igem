'use strict';
	
(function () {
	var is;

	is = {
		null: function (o) {
			return o === null;
		},
	
		array: function (o) {
			return Object.prototype.toString.call(o) === '[object Array]';
		},

		object: function (o) {
			return !is.null(o) && typeof o === 'object' && !is.array(o);
		},
	
		plain: function( o ) {
			return is.object(o) && Object.prototype.toString.call(o) === '[object Object]';
		},


		string: function (o) {
			return !is.null(o) && typeof o === 'string';
		},

		instance: function (o, cls) {
			return !is.null(o) && (o instanceof cls);
		},

		function: function (o) {
			return typeof obj === "function";// && typeof obj.nodeType !== "number"
		}
	};
	
	window.is = is;
	
})();


( function() {
	var plain;

	plain = {
		copy: function( o ) {
			if ( !is.plain( o ) ) {
				return o;
			}

			var copy = {};
			for ( var key in o ) {
				if ( is.plain( o[key] ) ) {
					copy[key] = plain.copy( o[key] );
				} else if ( is.array( o[key] ) ) {
					copy[key] = o[key].slice();
				} else {
					copy[key] = o[key];
				}
			}

			return copy;
		},

		merge: function( o1 ) {

			var merged = {};
			for ( var i = 0; i < arguments.length; i++ ) {
				var o = arguments[i];
				
				if ( !is.plain( o ) ) {
					continue;
				}

				for ( var key in o ) {
					if ( key in merged && is.plain( o[key] ) && is.plain( merged[key] ) ) {
						merged[key] = plain.merge( merged[key], o[key] );
					} else if ( is.plain( o[key] ) ) {
						merged[key] = plain.copy( o[key] );
					} else if ( is.array( o[key] ) ) {
						merged[key] = o[key].slice();
					} else {
						merged[key] = o[key];
					}
				}
			}
			
			return merged;
		},
	}

	window.plain = plain;
} )();
	

( function() {
	var arr;
	
	arr = {
		copy: function( a ) {
			return a.slice();
		},
		merge: function( a1 ) {
			var merged = [];

			for ( var i = 0; i < arguments.length; i++ ) {
				var a = arguments[i];
				if ( !is.array( a ) ) continue;

				for ( var j = 0, l = a.length; j < l; j++ ) {
					if ( merged.indexOf( a[j] ) == -1 ) {
						merged.push( a[j] );
					}
				}
			}

			return merged;
		}
	}

	window.arr = arr;
} )();

var extend = function( base, proto ) {
	
	var props = {};
	for ( var key in proto ) {
		props[key] = { value: proto[key], writable: true };
	}

	var o = Object.create( base, props );

	return o;
};


'use strict';

( function() {

	var DISPLAY_MAP = {
		"A": "inline",
		"B": "inline",
		"I": "inline",
		"IMG": "inline"
	};

	function componentConstructor() {
		return function (element, parent) {
			this.element = element;
			this.parent = parent;

			for ( var i = 0, l = this._init.length; i < l; i++ ) {
				this[this._init[i]].call( this );
			}
		}
	}

	var Component = componentConstructor();

	Component.prototype = {
		__mixins: {}, 
		_defaults: {},

		className: "component",

		_init: ["_initElement", "_initOptions", "_initListeners", "_initChildren"],

		_initElement: function() {

			var style = window.getComputedStyle( this.element );

			var display = style.display;
			if ( display == "none" ) {
				display = DISPLAY_MAP[this.element.tagName] || "block";
			}

			this.attributes = {
				display: display,
			};
		},

		_initChildren: function() {
			this._children = [];
		},

		_initListeners: function() {
			this._listeners = {};	
		},

		_initOptions: function() {

			var options = {};
			var attributes = this.element.attributes;
			for ( var i = 0; i < attributes.length; i++ ) {
				var name = attributes[i].name;
				
				if ( name.startsWith( "data-" ) ) {
					var path = name.slice( 5 ).split( "-" );
					var node = options;
					for ( var j = 0, l = path.length - 1; j < l; j++ ) {
						if ( path[j] in node ) {
							node = node[path[j]];
						} else {
							node = node[path[j]] = {};
						}
					}
					node[path[path.length - 1]] = attributes[i].value;
				}
			}

			this._options = plain.merge( this._defaults, options );
		},

		children: function() {
			return this._children;
		},

		add: function( component ) {
			this._children.push( component );
		},

		on: function( event, options, listener ) {
			if ( arguments.length == 2 ) {
				listener = options;
			}

			if ( "on" + event in this.element ) {
				this.element.addEventListener( event, listener, options );
			} else {
				if ( !( event in this._listeners ) ) {
					this._listeners[event] = [];
				}
				this._listeners[event].push( listener );
				
			}
		},

		trigger: function( event ) {
			
			if ( event.type in this._listeners ) {
				var listeners = this._listeners[event.type];

				for ( var i = 0, l = listeners.length; i < l; i++ ) {
					listeners[i].call(this, event );
				}
			} 
		},

		options: function( section ) {
			if ( arguments.length == 0 ) {
				return this._options;
			} else {
				return this._options[section] || {};
			}
		},

		show: function() {
			this.element.style.display = this.attributes.display;
			this.trigger( { type: "shown" } );
		},

		hide: function() {
			this.element.style.display = "none";
			this.trigger( { type: "hidden" } );
		},

		toogle: function() {
			if (this.element.style.display === "none") {
				this.show();
			} else {
				this.hide();
			}
		}

 
	};


	var mlf = function() { };

	mlf.prototype = {

		Component: Component,

		_components: {},
		_mixins: {},

		defineComponent: function( name, base, mixins, proto ) {

			if ( arguments.length == 1 ) {
				throw new Error( "Not implemented" );
			}

			// name, proto
			if ( arguments.length == 2 ) {
				proto = base;
				base = mlf.prototype.Component;
				mixins = [];
			}

			// name, base|mixins, proto
			if ( arguments.length == 3 ) {
				proto = mixins;
				if ( is.array( base ) ) {
					mixins = base;
					base = mlf.prototype.Component;
				} else {
					mixins = [];
				}
			}

			if ( !name.endsWith( "Component" ) ) {
				name += "Component";
			}

			if ( !base ) {
				base = mlf.prototype.Component;
			} else if ( is.string( base ) ) {
				base = mlf.prototype[base + "Component"];
			}
			// else if ( !is.instance( base, this.Component ) ) {
			 	//throw new Error( "Not implemented" );
			// }

			if ( !mixins ) {
				mixins = [];
			} else if ( !is.array( mixins ) ) {
				throw new Error( "Not implemented" );
			}

			if ( !proto ) {
				proto = {}
			} else if ( !is.plain( proto ) ) {
				throw new Error( "Not implemented" );
			}
				
			proto.name = name;

			var init = [];
			for ( var prop in proto ) {
				if ( prop.startsWith( "_init" ) ) {
					init.push( prop );
				}
			}

			proto._init = arr.merge( base.prototype._init, init );

			var component = componentConstructor();

			component.prototype = extend( base.prototype, proto );

			for ( var i = 0, l = mixins.length; i < l; i++ ) {
				var mixin = mlf.prototype[mixins[i] + "Mixin"];
				component.prototype._init = arr.merge( component.prototype._init, mixin._init ); 
				for ( var prop in mixin ) {
					if ( prop != "_init" ) {
						component.prototype[prop] = mixin[prop];
					}
				}	
			}

			mlf.prototype[name] = component;

			this._components[component.prototype.className] = component;

			return this[name];
		},

		defineMixin: function( name, proto ) {
			if ( !name.endsWith( "Mixin" ) ) {
				name += "Mixin";
			}

			if ( !proto._init ) {
				proto._init = [];
			} else if ( !is.array( proto._init ) ) {
				proto["_init" + name] = proto._init;
				proto._init = ["_init" + name];
			} 

			mlf.prototype[name] = proto;
			mlf.prototype._mixins[name] = proto;	
		},

		_init: function( window ) {
			this.window = window;
			this.document = window.document;

			this.body = this._initComponent( this.document.body );
			this._initChildren( this.body, this.document.body );
		},

		_initComponent: function( element, parent ) {

			var type = this._detectType( element );
			

			if ( type === false ) return false;

			var component = new this._components[type]( element, parent);
			
			// 3. applay all extentions

			return component;
		},

		_initChildren: function( component, element ) {
			var childNode = element.firstChild;
			
			while (childNode !== null) {
				var child = this._initComponent( childNode, component);
				
				if ( child === false ) {
					this._initChildren( component, childNode );
				} else {
					component.add( child );
					this._initChildren( child, childNode );
				}
				childNode = childNode.nextSibling;
            }
		},

		_detectType: function( element ) {

			if (element.nodeType !== 1) {
				return false;
			}

			if ( element.tagName in this._components ) {
				return element.tagName;
			}

			var classes = element.className.split( " " );

			for ( var i = 0, l = classes.length; i < l; i++ ) {
				if ( classes[i] in this._components ) {
					return classes[i]
				}
			}

			return false;
		}

	}

	window.mlf = new mlf();

	window.addEventListener( "load", function() {
        this.mlf._init( this );
        
	} );


} )();


mlf.defineComponent( "Body", {
	className: "BODY"
} );


( function(mlf) {
	
	var rurl = /url\(["']?(.+?)["']?\)/g;
		
	function preload( src ) {
		if ( src in this._images ) return;
		
		var img = new Image();
		this._images[src] = img;
		this._images.length++;
		img.addEventListener( "load", imageLoaded.bind( this ), { once: true, passive: true } );
		img.src = src;
	};

	function processElement(element) {
		
		if ( element.tagName == "IMG" && element.src ) {
			preload.call(this, element.src);
		}
		
		var bgImage = window.getComputedStyle( element ).getPropertyValue( "background-image" );
		
		if ( bgImage ) {
			var src;
			while ( src = rurl.exec( bgImage ) ) {
				if ( src ) preload.call( this, src[1] );
			}
		}
	}

	function imageLoaded( e ) {
		var src = e.target.src; 
		if ( src in this._images ) {
			delete this._images[src];
			this._images.length--;
		}

		if ( this._images.length === 0 ) {
            setTimeout( this.trigger.bind( this, { type: "images-loaded", target: this } ), 2000 );
            // this.trigger( { type: "images-loaded", target: this } );
		}
	};

	mlf.defineMixin("ImagesWaiting", {
		_init: function() {
			this._
			this._images = {
				length: 0
			};
		
			processElement.call( this, this.element );
			var elements = this.element.getElementsByTagName( "*" );
			for ( var i = 0, l = elements.length; i < l; i++ ) {
				processElement.call( this, elements[i] );
			}
		},
	});

} )(mlf);
( function() {
	
	function parseAnimation( options ) {
		var chunks = options.split( " " );

		var animation = {
			name: chunks[0],
			delay: chunks[1],
			duration: chunks[2] 
		};

		if ( name in this._animations ) {
			animation.type = "js";
		} else {
			animation.type = "css";
		}

		return animation;
	}

	function animate( animation ) {
        if ( animation.type == "css" ) {
            console.log( animation );
			this.element.style["animation-duration"] = animation.duration + "s";
			this.element.style["animation-delay"] = animation.delay + "s";
			this.element.className += " " + animation.name;
            console.log( this.element.className );
			this.element.addEventListener( "animationend", deanimate.bind( this, animation ), { once: true, passive: true }  ); 
		}
	}

	function deanimate( animation ) {
		if ( animation.type == "css" ) {
			this.element.style["animation-duration"] = null;
			this.element.style["animation-delay"] = null;
			this.element.className = this.element.className.replace( " " + animation.name, "" );
		}
	}

	mlf.defineMixin( "Animated", {
		_animations: {},

		_init: function() {
			var options = this.options( "animate" );

			for ( var event in options ) {
				this.on( event, animate.bind( this, parseAnimation.call(this,options[event]) ) );
			}
		},

	})

} )();
mlf.defineComponent("Layer", ["Animated"], { 
	className: "layer",

	play: function() {
		this.show();		
    },

    resize: function() {

    }

} );

mlf.defineComponent( "Scene", ["ImagesWaiting"], {
    className: "scene",

    _initScene: function() {
        this.scene = {}
        this.scene.playing = false;
        
        var spinner = document.createElement( "div" );
        spinner.className = "spinner";
        this.element.appendChild( spinner );
        this.scene.spinner = spinner;
        
        this.on( "images-loaded", this.play.bind( this ) );
        window.addEventListener( "resize", this.resize.bind( this ) );
    },
    
    resize: function() {
        var w = this.element.parentElement.clientWidth;

        if ( w > this._options.scene.width ) {
            w = this._options.scene.width;
        }

        this.scene.width = w;
        this.scene.height = w * this._options.scene.height / this._options.scene.width;
        
        this.element.style.width = this.scene.width + "px";
        this.element.style.height = this.scene.height + "px";
    },

    _resizeChildren: function() {
        for ( var i = 0, l = this._children.length; i < l; i++ ) {
			this._children[i].resize();
		}
    },

	add: function( component ) {
		if ( is.instance( component, mlf.LayerComponent ) ) {
			mlf.Component.prototype.add.call(this, component);	
		} else {
			throw new Error( "Not implemented" );
		}
	},

    play: function() {
        this.scene.spinner.style.display = "none";
        this.scene.playing = true;
		for ( var i = 0, l = this._children.length; i < l; i++ ) {
			this._children[i].play();
		}
	}
});



mlf.defineComponent( "ParalaxLayer", "Layer", {
	className: "layer-paralax",

	_initParalax: function() {
		this.left = this.element.getElementsByClassName( "split-left" )[0];
		this.right = this.element.getElementsByClassName( "split-right" )[0];
        this.paralax = {};
        this.resize();
    },
    
    resize: function() {
        this.element.style.width = 100 + Math.ceil( 100 / this._options.layer.z ) + "%";
        
        var flag = false;
        if ( !this.parent.scene.playing ) {
            this.element.style.visibility = "hidden";
            this.element.style.display = "block";
            flag = true;
        }

        this.paralax.width = this.element.offsetWidth;
        this.paralax.diff = Math.ceil( ( this.paralax.width - this.parent.scene.width ) / 2 );
        
        this.element.style.left = this.parent.element.offsetWidth / 2 - this.paralax.width / 2;

        if ( this.left && this.right ) {
            this.left.style["background-size"] = this.paralax.width + "px auto";
            this.right.style["background-size"] = this.paralax.width + "px auto";
			for ( var i = 0, l = this.left.children.length; i < l; i++ ) {
				this.left.children[i].style.width = this.parent.scene.width + "px";
			}
			for ( var i = 0, l = this.right.children.length; i < l; i++ ) {
				this.right.children[i].style.width = this.parent.scene.width + "px";	
				this.right.children[i].style.position = "absolute";
			}
		}
    
        if ( flag ) {
            this.element.style.display = "none";
            this.element.style.visibility = null;
        }
    },

	play: function() {

		this.show();
		this.redraw();

	},

	redraw: function() {
		var x = 0;
		if ( this._options.layer.z !== 'infinity' && this._options.layer.z != 0 ) {
			var x = Math.ceil(this.parent.paralax.shift.x / this._options.layer.z);
		}
		var y = 0;
		this.element.style.transform = "translate3d(" + x + "px," + y + "px,0)";

        if ( this.left && this.right ) {
			// var cursor = Math.round( this.parent.paralax.ratio * this.layer.width );
			var cursor = this.parent.paralax.cursor + this.paralax.diff - x;
			this.left.style.right = this.paralax.width - cursor + "px";
			this.left.style["background-position-x"] = "0px";
			this.right.style.left = cursor + "px";
			this.right.style["background-position-x"] = -cursor + "px";

			for ( var i = 0, l = this.right.children.length; i < l; i++ ) {
				this.right.children[i].style.left = -cursor + "px";	
			}
		}

	}
} );

mlf.defineComponent( "ParalaxScene", "Scene", {
    className: "scene-paralax",
    
    _initParalaxScene: function() {
        this.paralax = {
            origin: {},
            shift: {
                x: 0,
                y: 0,
            },
            ratio: 0.5
        }
        this.resize();
    },

    resize: function() {
        mlf.SceneComponent.prototype.resize.call( this );
        
        this.paralax.origin = {
            x: this.scene.width / 2,
            y: this.scene.height / 2,
        };
        this.paralax.margin = ( document.body.offsetWidth - this.scene.width ) / 2;
        this.paralax.shift = {
            x: 0,
            y: 0,
        };

        this.paralax.ratio = 0.5;
        this.paralax.cursor = this.scene.width / 2;
        // this.recalcualte( e );
        
        this._resizeChildren();
        this.redraw();
    },

    play: function() {
        
		mlf.SceneComponent.prototype.play.call( this );

        this.redraw();  
		this.element.addEventListener( "mousemove", ( function( e ) {
			this.recalcualte( e );
            this.redraw();
		} ).bind( this ) );
	},

    recalcualte: function( e ) {
        console.log( this.paralax.margin );
        var x = e.clientX - this.paralax.margin;
		this.paralax.shift.x = x - this.paralax.origin.x;
		
		this.paralax.cursor = x;
		var ratio =  x / this.scene.width;
		
		ratio = Math.min( 1, ratio );
		ratio = Math.max( 0, ratio );
		this.paralax.ratio = ratio;
	},

    redraw: function() {
        if ( !this.scene.playing ) return;
		for ( var i in this._children ) {
			if ( "redraw" in this._children[i] ) {
				this._children[i].redraw();
			}
		}
	}
} );


mlf.defineComponent( "Map", ["ImagesWaiting"], {
    className: "map",

    _initMap: function() {
        this.map = {}
        this.resize();
        var fog = document.createElement( "div" );
        fog.className = "fog";
        fog.style.display = "none"
        this.map.fog = fog;
        this.element.appendChild( fog );
        //this.on( "images-loaded", this.play.bind( this ) );
        window.addEventListener( "resize", this.resize.bind( this ) );
        this.element.addEventListener( "click", this.hideCard.bind( this ) );
    },
    
    resize: function() {
        var w = this.element.parentElement.clientWidth;

        if ( w > this._options.map.width ) w = this._options.map.width;

        this.map.scale = w / this._options.map.width;

        this.map.width = w;
        this.map.height = this._options.map.height * this.map.scale;

        this.element.style.width = this.map.width + "px";
        this.element.style.height = this.map.height + "px";
        
        for ( var i = 0, l = this._children.length; i < l; i++ ) {
			this._children[i].resize();
		}
    },

    hideCard: function() {
        if ( this.map.card ) {
            this.map.fog.style.display = "none";
            this.map.card.style.display = "none";  
            this.map.card = null;
        }
    },
    showCard: function( card ) {
        this.map.fog.style.display = "block";
        this.map.card = card;
        this.map.card.style.display = "block";
    }
});


mlf.defineComponent( "Pin", {
    className: "pin",

    _initPin: function() {
        this.pin = {}
        this._options.pin = this._options.pin || {};
        if ( !( "width" in this._options.pin ) ) {
            this._options.pin.width = this.parent._options.map.pin.width;
            this._options.pin.height = this.parent._options.map.pin.height;
        }

        this.pin.card = this.element.getElementsByClassName( "card" )[0];
        this.parent.element.appendChild( this.pin.card );
        this.element.addEventListener( "click", this.showCard.bind( this ) );
        this.pin.card.addEventListener( "click", function(e) {
            e.stopPropagation();
        });

        this.pin.close = document.createElement( "div" );
        this.pin.close.className = "btn-close";
        this.pin.card.appendChild( this.pin.close );
        this.pin.close.addEventListener( "click", this.parent.hideCard.bind( this.parent ) );
        this.resize();
    },

    showCard: function(e) {
        this.parent.hideCard();
        this.parent.showCard( this.pin.card );
        e.stopPropagation();
    },

    resize: function() {
        this.pin.width = this._options.pin.width * this.parent.map.scale;
        this.pin.height = this._options.pin.height * this.parent.map.scale;
        
        this.pin.x = this._options.pin.x * this.parent.map.scale
        this.pin.y = this._options.pin.y * this.parent.map.scale
        this.element.style.width = this.pin.width + "px";
        this.element.style.height = this.pin.height + "px";
        this.element.style.top = this.pin.y + "px";
        this.element.style.left = this.pin.x + "px";
    }
})
mlf.defineComponent("Header", { 
	className: "header",

	_initHeader: function() {
		this._header = {};
		if ( 'stick' in this._options ) {
            this._header.height = this.element.offsetHeight;
            if ( this._options.stick === 'auto' ) {
                this._header.scrollTop = this._header.height;
            } else if ( this._options.stick[0] === "#" ) {
                this._header.scrollTop = document.getElementById( this._options.stick.substr( 1 ) ); 
            } else {
                this._header.scrollTop = parseInt( this._options.stick );
            }
			
			var placeholder = document.createElement("div");
			placeholder.className = "header-placeholder";
			placeholder.style.height = this._header.height + "px";
			placeholder.style.display = "none";
			this.element.parentNode.insertBefore(placeholder, this.element);
			this._header.placeholder = placeholder;

			window.addEventListener( 'scroll', this._scrollHandler.bind( this ) );
		}
	},

    _scrollHandler: function( e ) {
        
        var t = isNaN( this._header.scrollTop ) ? this._header.scrollTop.offsetHeight : this._header.scrollTop; 

		if ( document.body.scrollTop > t ) {
			this.element.classList.add( "sticky" );	
			this._header.placeholder.style.display = "block";
		} else {
			this.element.classList.remove( 'sticky' );
			this._header.placeholder.style.display = "none";
		}
	}

} );

mlf.defineComponent("Navigation", { 
	className: "navigation",

	_initNavigation: function() {
		this._navigation = {};
		if ( 'breakpoint' in this._options ) {
			var button = document.createElement("a");
			button.className = "nav-button";
			button.appendChild(document.createElement("i"));
			//button.innerHTML = "Ξ";
			button.addEventListener("click", this.toggleNavigation.bind(this));
			this.element.parentNode.insertBefore(button, this.element);
		}
	},

	toggleNavigation: function() {
		document.body.classList.toggle("nav-shown");
	},

	add: function( component ) {
		if ( is.instance( component, mlf.MenuItemBranchComponent ) ) {
			mlf.Component.prototype.add.call(this, component);	
			component._options.breakpoint = this._options.breakpoint;
		} else {
			throw new Error( "Not implemented" );
		}
	},
} );


mlf.defineComponent("MenuItemBranch", {
	className: "menu-item-branch",

	_initMenuItemBranch: function() {
		var label = this.element.getElementsByClassName("label")[0];
		label.addEventListener("click", this.toggleMenuItemBranch.bind(this));
	},

	toggleMenuItemBranch: function() {
		if (window.innerWidth > this._options.breakpoint) {
			return;
		}

		this.element.classList.toggle("open");
	}

})

mlf.defineComponent( "Notebook", {
    className: "notebook",

    _initNotebook: function() {
    },
});


mlf.defineComponent( "Event", {
    className: "event",

    _initEvent: function() {
        var bullet = document.createElement( "div" );
        bullet.className = "bullet";
        this.element.appendChild( bullet );

        var date = document.createElement( "div" );
        date.className = "date";
        var d = this._options.event.date.split( "." );
        d = new Date( d[2], d[1], d[0] );
        date.innerText = d.toLocaleString( 'en-US', { weekday: 'long', year: 'numeric', month: 'numeric', day: 'numeric' } );
        this.element.appendChild( date );
    },

})