

(function () {
	mlf.prototype.animate = function (options) {
		this.options = mergePlain(this.defaults, options, optionsFromElement(this.element, "animate"));
	}

	Animated.prototype = {
		_init: function (element, options) {
			this.element = element;
		}
	}

})();

function runFish() {
	var tick = 0;
	
	
	var fish = document.getElementById("fish");
	var fish_img = fish.getElementsByTagName("img");
	
	function moveFish() {
		var x = tick * 50;
		var y = 100 * Math.sin(x);
		fish.style.transform = "translate3d(" + x + "px," + y + "px,0)";
		tick++;
	}

	var flik = 15;
	function flikFish() {
		fish_img[0].style.transform = "perspective(800px) rotateY(" + flik + "deg)";
		flik = flik > 0 ? -5 : 15;
	}

	
	setInterval(moveFish, 1000);
	setInterval(flikFish, 500);

}

var MLFElement = constructor("MLFElemnt");


function constructor(name) {
	this[name] = function (element, options) {
		console.log(element);
	};
	return this[name];
}

MLFElement.prototype.bar = function () {
	
}

var Animate = constructor("Animate");

Animate.prototype = new MLFElement;

Animate.prototype.foo = function () {
	console.log("foo");
}

console.log(Animate);

var a = new Animate(1);

console.log(a);