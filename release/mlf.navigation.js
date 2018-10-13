mlf.defineComponent("Navigation", { 
	className: "navigation",

	_initNavigation: function() {
		this._navigation = {};
		if ( 'breakpoint' in this._options ) {
			var button = document.createElement("a");
			button.className = "nav-button";
			button.appendChild(document.createElement("i"));
			//button.innerHTML = "Ξ";
			button.addEventListener("click", this.toggleNavigation.bind(this));
			this.element.parentNode.insertBefore(button, this.element);
		}
	},

	toggleNavigation: function() {
		document.body.classList.toggle("nav-shown");
	},

	add: function( component ) {
		if ( is.instance( component, mlf.MenuItemBranchComponent ) ) {
			mlf.Component.prototype.add.call(this, component);	
			component._options.breakpoint = this._options.breakpoint;
		} else {
			throw new Error( "Not implemented" );
		}
	},
} );


mlf.defineComponent("MenuItemBranch", {
	className: "menu-item-branch",

	_initMenuItemBranch: function() {
		var label = this.element.getElementsByClassName("label")[0];
		label.addEventListener("click", this.toggleMenuItemBranch.bind(this));
	},

	toggleMenuItemBranch: function() {
		if (window.innerWidth > this._options.breakpoint) {
			return;
		}

		this.element.classList.toggle("open");
	}

})