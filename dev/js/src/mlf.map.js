
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