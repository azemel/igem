mlf.defineComponent("Header", { 
	className: "header",

	_initHeader: function() {
		this._header = {};
		if ( 'stick' in this._options ) {
			this._header.scrollTop = this._options.stick === 'auto' ? this.element.offsetHeight : parseInt( this._options.stick );
			window.addEventListener( 'scroll', this._scrollHandler.bind( this ) );
		}
	},

	_scrollHandler: function( e ) {
		if ( e.pageY > this._header.scrollTop ) {
			this.element.classList.add( "sticky" );	
		} else {
			this.element.classList.remove( 'sticky' );
		}
	}

} );
