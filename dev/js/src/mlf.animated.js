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
			console.log( this.element.style  );
			this.element.style["animation-duration"] = animation.duration + "s";
			this.element.style["animation-delay"] = animation.delay + "s";
			this.element.className += " " + animation.name;

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