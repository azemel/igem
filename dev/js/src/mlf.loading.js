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
            // setTimeout( this.trigger.bind( this, { type: "images-loaded", target: this } ), 2000 );
            this.trigger( { type: "images-loaded", target: this } );
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