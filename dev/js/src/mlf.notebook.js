
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

        var date = document.createElement( "div" );
        date.className = "date";
        var d = this._options.event.date.split( "." );
        d = new Date( d[2], d[1], d[0] );
        console.log( d.toLocaleString( 'en-US' ) );
        date.innerText = d.toLocaleString( 'en-US', { weekday: 'long', year: 'numeric', month: 'numeric', day: 'numeric' } );
        this.element.appendChild( date );
    },

})