mlf.defineComponent("Header", { 
	className: "header",

	_initHeader: function() {
		this._header = {};
		if ( 'stick' in this._options ) {
			this._header.height = this.element.offsetHeight;
			this._header.scrollTop = this._options.stick === 'auto' ? this._header.height : parseInt( this._options.stick );
			
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
		if ( document.body.scrollTop > this._header.scrollTop ) {
			this.element.classList.add( "sticky" );	
			this._header.placeholder.style.display = "block";
		} else {
			this.element.classList.remove( 'sticky' );
			this._header.placeholder.style.display = "none";
		}
	}

} );
