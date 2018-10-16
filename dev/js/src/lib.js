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

