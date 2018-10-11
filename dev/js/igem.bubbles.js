mlf.defineComponent( "Bubbles", {
	className: "bubbles",
	_initBubbles: function() {
		this.bubbles = {};
		if ( this.options( "bubbles" ).container ) {
			
		} else {
			this.bubbles.container = this.element;
		}
		this.scheduleBubble();
	},

	scheduleBubble: function() {
		var max = 2000;
		var min = 500;
		var rand = Math.random() * ( max - min ) + min;
		
		setTimeout( this.launchBubble.bind(this), rand);
	},

	launchBubble: function() {	
		var bubble = document.createElement( "div" );
		bubble.className = "bubble";

		var bubbleY = document.createElement( "div" );
		bubbleY.className = "bubble-y";
		bubbleY.appendChild( bubble );
		
		var that = this;
		bubbleY.addEventListener( "animationend", function(e) {
			that.bubbles.container.removeChild( e.target );
		} );


		this.bubbles.container.appendChild( bubbleY );
		this.scheduleBubble();
	}
} );