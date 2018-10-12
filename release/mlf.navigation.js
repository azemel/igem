mlf.defineComponent("Navigation", { 
	className: "navigation",

	_initNavigation: function() {
		console.log(this);
		this._navigation = {};
		if ( 'breakpoint' in this._options ) {
			var button = document.createElement("a");
			button.className = "nav-button";
			button.innerHTML = "Ξ";
			button.addEventListener("click", this.toggleNavigation.bind(this));
			this.element.insertBefore(button, this.element.firstChild);
		}
	},

	toggleNavigation: function() {
		this.element.classList.toggle("shown");
	}

} );
