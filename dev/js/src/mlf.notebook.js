
mlf.defineComponent( "Notebook", {
    className: "notebook",

    _initNotebook: function() {
    },
});


mlf.defineComponent( "Event", {
    className: "event",

    _initEvent: function() {
        var bullet = document.createElement( "div" );
        bullet.className = "bullet";
        this.element.appendChild( bullet );

        var side = document.createElement( "div" );
        side.className = "side";
        this.element.appendChild( side );
        var date = document.createElement( "div" );
        date.className = "date";
        var d = this._options.event.date.split( "." );
        d = new Date( d[2], d[1], d[0] );
        date.innerText = d.toLocaleString( 'en-US', { weekday: 'long', year: 'numeric', month: 'numeric', day: 'numeric' } );
        side.appendChild( date );

        if ( "type" in this._options.event ) {
            var icon = document.createElement( "i" );
            if ( this._options.event.type === "foreign" ) {
                icon.className ="icon fas fa-plane"
            } else if ( this._options.event.type === "tv" ) {
                icon.className ="icon fas fa-tv"
            } else if ( this._options.event.type === "instagram" ) {
                icon.className ="icon fab fa-instagram"
            }
            side.appendChild( icon );
        }

    },

})