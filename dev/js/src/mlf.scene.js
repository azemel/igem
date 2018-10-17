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
