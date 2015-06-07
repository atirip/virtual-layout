(function() {

	'use strict';

	function Boundary(min, max, multiplierMin, multiplierMax) {
		if ( !(this instanceof Boundary) ) {
			return new Boundary(min, max, multiplierMin, multiplierMax);
		}
		// 0 means hard stop, iOS like rubber effect is 0.5
		this.multiplierMin = this.multiplierMax = this.min = this.max = 0;
		this.initialize(min, max, multiplierMin, multiplierMax);
	}

	Boundary.prototype = {

		initialize: function(min, max, multiplierMin, multiplierMax) {
			if ( Object.prototype.toString.call( min ) == '[object Object]' ) {
				return this.initialize(min.min, min.max, min.multiplierMin, min.multiplierMax);
			} else {
				this.min = +min||0;
				this.max = +max||0;
				if ( multiplierMin !== undefined ) {
					// use just one multiplier to apply that to both
					multiplierMax === undefined && ( multiplierMax = multiplierMin );
					this.multiplierMin = +multiplierMin||0;
				}
				multiplierMax !== undefined && (this.multiplierMax = (+multiplierMax||0));
			}
			return this;
		},

		// this is signed value
		outside: function(value) {
			if ( value < this.min ) {
				return value - this.min;
			} else if ( value > this.max ) {
				return value - this.max;
			}
			return 0;
		},

		// it is clearer of not having this as a setter
		// var x = boundary.set(y) is better than var x = boundary.value = y
		set: function(value) {
			if ( value < this.min ) {
				return this.min + this.outside(value) * this.multiplierMin;
			} else if ( value > this.max ) {
				return this.max + this.outside(value) * this.multiplierMax;
			}
			return value;
		},

		// this is absolute value
		get reach() {
			return Math.abs(this.max - this.min);
		}
	};

	if (typeof define === 'function' && define.amd) {
		define(function(){
			return Boundary;
		});
	} else if (typeof module !== 'undefined' && module.exports) {
		module.exports = Boundary;
	} else {
		(this.atirip||(this.atirip={})).Boundary = Boundary;
	}

}).call(this);
