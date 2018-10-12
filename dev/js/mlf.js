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
				console.log(childNode);
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

			if (element.nodeType === 3) {
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
		this.console.log( window.mlf );
	} );


} )();


mlf.defineComponent( "Body", {
	className: "BODY"
} );

