mlf.defineComponent("Layer", ["Animated"], { 
	className: "layer",

	play: function() {
		this.show();		
	}

} );

mlf.defineComponent( "Scene", ["ImagesWaiting"], {
	className: "scene",

	_initScene: function() {
		this.on( "images-loaded", this.play.bind( this ) );
				
		this.scene = {
			width: this.element.offsetWidth,
			height: this.element.offsetHeight
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
	},

	
	play: function() {
		
		this.paralax = {};
		this.element.style.width = 100 + Math.round( 100 / this._options.layer.z ) + "%";
			
		//this.element.style.height = 100 + Math.round( 100 / this._options.layer.z ) + "%";
		this.element.style.display = "block";		
		this.element.style.left = this.parent.element.offsetWidth / 2 - this.element.offsetWidth / 2;
		
		//this.element.style.top = this.parent.element.offsetHeight / 2 - this.element.offsetHeight / 2;
		this.element.style.visibility = null;

		if ( this.left && this.right ) {
			for ( var i = 0, l = this.left.children.length; i < l; i++ ) {
				this.left.children[i].style.width = this.parent.scene.width + "px";
			}
			for ( var i = 0, l = this.right.children.length; i < l; i++ ) {
				this.right.children[i].style.width = this.parent.scene.width + "px";	
				this.right.children[i].style.position = "absolute";
			}
		}
		this.layer = {
			width: this.element.offsetWidth,
		};

		this.paralax.width = this.element.offsetWidth;
		this.paralax.diff = Math.ceil( ( this.paralax.width - this.parent.scene.width ) / 2 );
		
		
		this.show();
		this.redraw();

	},

	redraw: function() {
		var x = 0;
		if ( this._options.layer.z !== 'infinity' && this._options.layer.z != 0 ) {
			var x = Math.ceil(this.parent.paralax.shift.x / this._options.layer.z);
		}
		//var y = viewShift.y / this._options.layer.z;
		var y = 0;
		this.element.style.transform = "translate3d(" + x + "px," + y + "px,0)";

		if ( this.left && this.right ) {
			// var cursor = Math.round( this.parent.paralax.ratio * this.layer.width );
			var cursor = this.parent.paralax.cursor + this.paralax.diff - x;
			this.left.style.right = this.layer.width - cursor + "px";
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


	play: function() {
		
		this.paralax = {
			origin: {
				x: this.scene.width / 2,
				y: this.scene.height / 2,
			},
			shift: {
				x: 0,
				y: 0,
			},
			ratio: 0.5,
			cursor: this.scene.width / 2
		};

		mlf.SceneComponent.prototype.play.call( this );

		this.element.addEventListener( "mousemove", ( function( e ) {
			this.recalcualte( e );
			this.redraw();
		} ).bind( this ) );
	},

	recalcualte: function( e ) {
		this.paralax.shift.x = e.clientX - this.paralax.origin.x;
		this.paralax.shift.y = e.clientY - this.paralax.origin.y;
		
		this.paralax.cursor = e.clientX;
		var ratio =  e.clientX / this.scene.width;
		
		ratio = Math.min( 1, ratio );
		ratio = Math.max( 0, ratio );
		this.paralax.ratio = ratio;
	},

	redraw: function() {
		for ( var i in this._children ) {
			if ( "redraw" in this._children[i] ) {
				this._children[i].redraw();
			}
		}
	}
} );
