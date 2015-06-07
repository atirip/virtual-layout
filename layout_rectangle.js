(function() {

	'use strict';

	var DIRECTION = {
		UNKN: 1,
		VERTICAL: 2,
		HORIZONTAL: 3
	};

	var VISIBLE = {
		UNKN: 1,
		NO: 2,
		PARTIALLY: 3,
		FULLY: 4,
		COVERS: 5
	};

	var STATUS = {
		UNKN: 1,
		INVISIBLE: 2,
		NOW_INVISIBLE: 3,
		VISIBLE: 4,
		NOW_VISIBLE: 5
	};


	function create(Matrix, Rectangle) {

		// @id can be anything that suits you. for example DOM element id, or that DOM element itself
		function LayoutRectangle(id, x, y, width, height) {
			if ( !(this instanceof LayoutRectangle) ) {
				return new LayoutRectangle(id, x, y, width, height);
			}
			Rectangle.call(this, x, y, width, height);
			this.id = id;

			// transform is set to matrix if it needs to be set on next loop
			this.transform;
			// compare against
			this.lastMatrix = Matrix();

			// those are needed and set by parent (viewport)
			this.visibility = VISIBLE.UNKN;
			this.status = STATUS.UNKN;
			this.horizontalDistance = -1;
			this.verticalDistance = -1;
		}

		LayoutRectangle.STATUS = STATUS;
		LayoutRectangle.DIRECTION = DIRECTION;
		LayoutRectangle.VISIBLE = VISIBLE;

		var proto = LayoutRectangle.prototype = Object.create(Rectangle.prototype);
		proto.constructor = LayoutRectangle;

		proto.makeTransformIf = function() {
			// set this.transform to this.matrix only if matrix has changed
			var matrix = this.matrix;
			if ( this.lastMatrix.equal( matrix ) && this.transform !== undefined ) { // ensure initial run
				this.transform = false;
			} else {
				Matrix.copy(matrix, this.lastMatrix);
				this.transform = matrix;
			}
			return this.transform;
		};

		Object.defineProperty(proto, 'invisible', {
			get: function() {
				return this.status == STATUS.INVISIBLE;
			},
			enumerable: true
		});

		return LayoutRectangle;

	}

	if (typeof define === 'function' && define.amd) {
		define(['./matrix', './rectangle'], create);
	} else if (typeof module !== 'undefined' && module.exports) {
		module.exports = create(require('@atirip/matrix'), require('@atirip/rectangle'));
	} else {
		this.atirip.LayoutRectangle = create(this.atirip.Matrix, this.atirip.Rectangle);
	}

}).call(this);