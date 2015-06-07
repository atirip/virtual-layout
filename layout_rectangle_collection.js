(function() {

	'use strict';

	var CALLBACK = {
		UNKN: 1,
		PLACE_PAGES: 2,
		SET_PAGE_CSS: 3,
		TRACKED: 4,
		SET_PAGE_CSS_START: 5,
		SET_PAGE_CSS_END: 6
	};

	function create(Matrix, LayoutRectangle) {

		function LayoutRectangleCollection(callback, context) {

			if ( !(this instanceof LayoutRectangleCollection) ) {
				return new LayoutRectangleCollection(callback, context);
			}
			this.rects = [];
			this.callback = callback;
			this.context = context || this;
			this.originX = 0;
			this.originY = 0;
			LayoutRectangle.call(this);
		}

		LayoutRectangleCollection.CALLBACK = CALLBACK;

		var proto = LayoutRectangleCollection.prototype = Object.create(LayoutRectangle.prototype);
		proto.constructor = LayoutRectangleCollection;

		proto.afterRectanglesChanged = function(next) {
			// TODO: we need to try to keep middle/center page in the same position inside viewport
			this.placeRectangles();
			next && next.apply && next();
		};

		// for multiple inserts and appends in a row,
		proto.appendRectangle = function(rectangle, next) {
			return this.insertRectangleBefore(rectangle, this.rects.length, next);
		};

		// next: - callback function called after 'afterRectanglesChanged()'
		//		 - true to not call 'afterRectanglesChanged' at all, only insert
		//		 - anything else, 'afterRectanglesChanged()' is called without callback
		proto.insertRectangleBefore = function(rectangle, index, next) {
			index = +index||0;
			var existing = this.rects.indexOf(rectangle);
			if ( ~existing ) {
				if ( existing == index || existing == index+1 ) {
					// insert before itself is nonsens, insert before next i is no-op
					return this;
				}
				this.rects.splice(existing, 1);
			}
			this.rects.splice(index, 0, rectangle);
			if ( next !== true ) {
				this.afterRectanglesChanged(next);
			}
			return this;
		};

		proto.removeReactangle = function(index, next) {
			this.rects.splice(index, 1);
			if ( next !== true ) {
				this.afterRectanglesChanged(next);
			}
			return this;
		};

		proto.placeRectangles = function() {
			this.callback.call(this.context, CALLBACK.PLACE_PAGES, this);
			//this.paint();
			return this;
		};

		proto.centerRectangles = function(direction, stash) {
			var horizontally = direction == LayoutRectangle.DIRECTION.HORIZONTAL;
			var width = horizontally ? 'height': 'width';
			var x = horizontally ? 'y': 'x';
			var l = this.rects.length;
			var v = this[width] / 2;
			var rect;
			var bounds;
			while (l--) {
				rect = this.rects[l];
				bounds = rect.bounds;
				// bounding box is adjusted, f.e. when rectangle is rotated then we need to take into account
				// the distance between bounding box x and rectangles x
				rect[x] = v - bounds[width] / 2 - (bounds[x] - rect[x]);
				stash && rect.stash();
			}
			return this;
		};

		proto.lineUpRectangles = function(direction, spaceBetween, spaceAround) {
			var horizontally = direction == LayoutRectangle.DIRECTION.HORIZONTAL;
			var height = horizontally ? 'width' : 'height';
			var width = horizontally ? 'height' : 'width';
			var y = horizontally ? 'x' : 'y';

			var i;
			var rect;
			var bounds;
			var top = 0;
			var rectWidth;
			var maxWidth = 0;

			spaceBetween = +spaceBetween||0;
			spaceAround = +spaceAround||0;

			for (i = 0; rect = this.rects[i]; i++) {
				bounds = rect.bounds;
				rectWidth = bounds[width];
				maxWidth < rectWidth && (maxWidth = rectWidth);
				rect[y] = top + spaceBetween;
				top += bounds[height] + 2*spaceBetween;
			}
			maxWidth += 2*spaceAround;
			this[width] = maxWidth;
			this[height] = top;
			this.stash();
			this.centerRectangles(horizontally, true);
		};

		function applyMatrix() {
			var matrix = this.matrix;
			var l = this.rects.length;
			while (l--) {
				this.rects[l].applyMatrix(matrix);
			}
		}

		/*
			on simple x, y transform (scroll) boundaries are applied at once
			on gesture transform (scale, translate) boundaries are applied at the end of a gesture
		*/
		proto.transform = function(operation, originX, originY, x, y, scale, angle) {
			this.originX = originX;
			this.originY = originY;
			this[operation](originX, originY, x, y, scale, angle);
			applyMatrix.call(this);
		};

		proto.fitTo = function(x, y, scale) {
			this.absTransform(this.originX, this.originY, 0, 0, scale);
			this.x = x;
			this.y = y;
			applyMatrix.call(this);
		};


		/*
			- if now invisible page, but previously visible, then we need to move it to invisible position (apply transform)
			- if now invisible and previously invisible, then do nothing
			- if now visible, but previosly invisible, then we need to move it to visible position (apply transform)
			- if now visible and previously also visible, then we need to (apply transform)
			so we update transform in every situatiom, and the only case we need not to apply it is at page is already
			visible

		*/

		proto.updateRectanglesTransforms = function() {
			var l = this.rects.length;
			var rect;
			while (l--) {
				rect = this.rects[l];
				if ( rect.invisible ) {
					rect.transform = false;
				} else {
					rect.makeTransformIf();
				}
			}
		};

		proto.each = function(idOrFunc, context) {
			!context && ( context = this.context);
			var func = idOrFunc.apply ? idOrFunc.bind(context) : this.callback.bind(context, idOrFunc);
			var i;
			for (i = 0; i < this.rects.length; i++) {
				func(this, this.rects[i], i);
			}
		};

		proto.paint = function() {
			this.callback.call(this.context, CALLBACK.SET_PAGE_CSS_START, this);
			this.each(CALLBACK.SET_PAGE_CSS);
			this.callback.call(this.context, CALLBACK.SET_PAGE_CSS_END, this);
		};

//		proto.track = function(trackedPageIndex) {
//			this.callback(CALLBACK.TRACKED, this, this.rects[trackedPageIndex], trackedPageIndex);
//		};

		proto.dump = function() {
			var i;
			var rect;
			console.log('self', this.x, this.y, this.width, this.height);
			for (i = 0; i < this.rects.length; i++) {
				rect = this.rects[i];
				console.log(i+ ') rectangle', rect.x, rect.y, rect.width, rect.height);
				console.log('visibility', rect.visibility);
				console.log('distance', rect.verticalDistance, rect.horizontalDistance);
			}
		};

		return LayoutRectangleCollection;

	}

	if (typeof define === 'function' && define.amd) {
		define(['./matrix', './layout_rectangle'], create);
	} else if (typeof module !== 'undefined' && module.exports) {
		module.exports = create(require('@atirip/matrix'), require('./layout_rectangle'));
	} else {
		this.atirip.LayoutRectangleCollection = create(this.atirip.Matrix, this.atirip.LayoutRectangle);
	}

}).call(this);