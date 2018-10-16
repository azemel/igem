
(function () {

	var Slider = function( element ) {
		var
	}

	function Slide(element, options) {
		if (!(this instanceof Slide)) {
			return new Slide(element, options);
		} 
		this._init(element, options);
	}

	function Layer(element, options) {
		if (!(this instanceof Layer)) {
			return new Layer(element, options);
		}
		this._init(element, options);
	}

	function optionsFromAttributes(element) {
		var options = {};
		var attributes = element.attributes;
		for (var i = 0; i < attributes.length; i++) {
			var name = attributes[i].name;
			if (name.startsWith("data-")) {
				var chunks = name.split("-");
				var section = options;
				for (var j = 1; j < chunks.length - 1; j++) {
					if (!(chunks[j] in section)) {
						section[chunks[j]] = {};
					}
					section = section[chunks[j]];
				}
				section[chunks[chunks.length - 1]] = JSON.parse(attributes[i].value);
			}
		}
		return options;

	}

	Slider.prototype = {
		Slide: Slide,
		defaults: {
			cls: {
				slider: "mls",
				slide: "mls-slide",
				layer: "mls-layer",
			} 
		},
		_init: function (element, options) {
			this.element = element;
			options = complementPlain(options, this.defaults);
			this.options = complementPlain(optionsFromAttributes(this.element), options);
			this.slides = [];

			this.id = element.id || null;

			var slideElements = this.element.getElementsByClassName(this.options.cls.slide);
			for (var i = 0; i < slideElements.length; i++) {
				this.addSlide(slideElements[i]);
			}
		},

		addSlide: function (slide, options) {
			if (!(slide instanceof Slide)) {
				slide = Slide(slide, options); 
			} else {
				sldie.options(options);
			}

			this.slides.push(slide);
			if (slide.id != null) {
				this.slides[slide.id] = slide;
			}
		}
	}

	Slide.prototype = {
		defaults: {
			cls: {
				slide: "mls-slide",
				layer: "mls-layer"
			}
		},
		_init: function (element, options) {
			this.element = element;
			options = complementPlain(options, this.defaults);
			this.options = complementPlain(optionsFromAttributes(this.element), options);
			this.layers = [];

			this.id = element.id || null;

			var layerElements = this.element.getElementsByClassName(this.options.cls.layer);
			for (var i = 0; i < layerElements.length; i++) {
				this.addLayer(layerElements[i]);
			}

			this.paralax = {
				origin: {
					x: this.element.offsetWidth / 2,
				},
				shift: {
					x: 0,
				}
			}
			this.element.addEventListener("mousemove", this.paralaxRedraw.bind(this));
		},

		paralaxRedraw: function (e) {
			this.paralax.shift.x = e.clientX - this.paralax.origin.x;
			for (var i in this.layers) {
				this.layers[i].redraw(this.paralax.shift.x);
			}
		},

		addLayer: function (layer, options) {
			if (!(layer instanceof Layer)) {
				layer = Layer(layer, options); 
			} else {
				layer.options(options);
			}

			layer.slide(this);
			this.layers.push(layer);
			if (layer.id != null) {
				this.layers[layer.id] = layer;
			}
		}
	}

	Layer.prototype = {
		_init: function (element, options) {
			this.element = element;
			this._slide = null;
			options = complementPlain(options, this.defaults);
			this.options = complementPlain(optionsFromAttributes(this.element), options);
			console.log(100 + Math.round(1 / this.options.paralax.level) + "%");
			this.element.style.width = 100 + Math.round(100 / this.options.paralax.level) + "%";
			console.log(this.options);
		},

		slide: function (slide) {
			this._slide = slide;
			this.element.style.left = this._slide.element.offsetWidth / 2 - this.element.offsetWidth / 2;
		},

		redraw: function (viewX) {
			var shift = viewX / this.options.paralax.level;
			this.element.style.transform = "translate3d(" + shift + "px,0,0)";
		}
	}



	window.mls = Slider;
})();
