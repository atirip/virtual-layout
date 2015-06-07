(function() {

	'use strict';

	var TRACK = {
		CENTER: 1, // horizontally
		MIDDLE: 2, // vertically
		BULLSEYE: 3 // both
	};

	function create(Boundary, LayoutRectangle) {

		// id can be anything that suits you. for example DOM element id, or that DOM element itself
		function Viewport(id, pasteboard, x, y, width, height) {
			if ( !(this instanceof Viewport) ) {
				return new Viewport(id, pasteboard, x, y, width, height);
			}
			LayoutRectangle.call(this, id, x, y, width, height);
			this.pasteboard = pasteboard;
			this.horizontalBoundary = Boundary();
			this.verticalBoundary = Boundary();
			this.scaleBoundary = Boundary(1, 1);
			this.trackingAimFor;
			this.visibilityIgnore;
			// based on trackingAimFor
			this.tracked = -1;

			this.afterPasteboardChanged = function() {
				this.resetBoundaries();
			}.bind(this);

		}

		var DIRECTION = LayoutRectangle.DIRECTION;
		var STATUS = LayoutRectangle.STATUS;
		var VISIBLE = LayoutRectangle.VISIBLE;
		Viewport.TRACK = TRACK;

		var proto = Viewport.prototype = Object.create(LayoutRectangle.prototype);
		proto.constructor = Viewport;

		// aim can be MIDDLE, CENTER or BULLSEYE
		// ignore cane be VERTICAL or HORIZONTAL
		function calculateVisibility(trackingAimFor, visibilityIgnore) {
			var middle = this.cy;
			var center = this.cx;
			var i;
			var boundaries;
			var visibility;

			var top;
			var left;
			var bottom;
			var right;
			var rect;

			var viewportTop = this.origin.y;
			var viewportLeft = this.origin.x;
			var viewportBottom = this.bottom.y;
			var viewportRight = this.right.x;

			var vert = visibilityIgnore == DIRECTION.VERTICAL;
			var hor	= visibilityIgnore == DIRECTION.HORIZONTAL;

			var trackedPageIndex = -1;
			var trackResult;

			for (i = 0; rect = this.pasteboard.rects[i]; i++) {
				boundaries = rect.bounds;
				visibility = VISIBLE.NO;

				left = boundaries.origin.x;
				top = boundaries.origin.y;
				right = boundaries.right.x;
				bottom = boundaries.bottom.y;

				if ( (vert || (bottom >= viewportTop && top <= viewportBottom)) &&
					(hor || (right >= viewportLeft && left <= viewportRight)) ) {
					// directly visible, possibly partially
					visibility = VISIBLE.PARTIALLY;
				}
				if ( ((vert || top >= viewportTop && bottom <= viewportBottom)) &&
					(hor || (left >= viewportLeft && right <= viewportRight)) ) {
					// fully inside viewport
					visibility = VISIBLE.FULLY;
				}

				// if over middle/center then 0, otherwise edge distance
				rect.verticalDistance = top <= middle && bottom >= middle ? 0 : (bottom < middle ? bottom-middle : top-middle);
				rect.horizontalDistance = left <= center && right >= center ? 0 : (right < center ? right-center : center-left);

				if ( rect.visibility == VISIBLE.UNKN ) {
					// initial run
					rect.status = visibility == VISIBLE.NO ? STATUS.NOW_INVISIBLE : STATUS.NOW_VISIBLE;
				} else if ( rect.visibility == VISIBLE.NO ) {
					// previously invisible
					rect.status = visibility == VISIBLE.NO ? STATUS.INVISIBLE : STATUS.NOW_VISIBLE;
				} else {
					// previously visible
					rect.status = visibility == VISIBLE.NO ? STATUS.NOW_INVISIBLE : STATUS.VISIBLE;
				}
				rect.visibility = visibility;

				// trackingAimFor can be MIDDLE, CENTER or BULLSEYE
				if ( trackingAimFor ) {

					if ( (trackingAimFor != TRACK.CENTER) && (top <= middle && bottom >= middle) ) {
						trackResult = TRACK.MIDDLE;
					}

					if ( (trackingAimFor != TRACK.MIDDLE) && (left <= center && right >= center) ) {
						trackResult = trackResult == TRACK.MIDDLE ? TRACK.BULLSEYE : TRACK.CENTER;
					}

					if ( trackingAimFor == TRACK.BULLSEYE && trackResult != TRACK.BULLSEYE ) {
						trackResult = 0;
					}

					if (trackResult) {
						trackedPageIndex = i;
						trackingAimFor = 0; // we found the tracked one
					}

				}

			}
			return trackedPageIndex;
		}

		proto.resetBoundaries = function() {
			this.horizontalBoundary.initialize(this.scrollHorizontalMin, this.scrollHorizontalMax);
			this.verticalBoundary.initialize(this.scrollVerticalMin, this.scrollVerticalMax);
		};

		proto.setPasteboardDimensions = function(width, height) {
			this.pasteboard.width(width).height(height).stash();
		};

		proto.centerPasteboard = function(vertically) {
			var width = vertically ? 'height' : 'width';
			var x = (this[width] - this.pasteboard[width]) / 2;
			this.transformPasteboard('absTransform', 0, 0, x);
		};

		// scrollMin and scrollMin should never be directly called, they are exposed only to be used when redefining
		// 'scrollVerticalMin' and friends to allow more granulated control over scrolling
		proto.scrollMin = function(prop) {
			var v = this[prop];
			var p = this.pasteboard[prop];
			return v < p ? v - p : 0;
		};

		proto.scrollMax = function(prop) {
			var v = this[prop];
			var p = this.pasteboard[prop];
			return v < p ? 0 : v - p;
		};

		proto.transformPasteboard = function(operation, originX, originY, x, y, scale) {
			this.pasteboard.transform(operation, originX, originY, x, y, scale);
			this.resetBoundaries();
		};

		proto.fitPasteboardIntoBoundaries = function() {
			var matrix = this.pasteboard.matrix;
			this.pasteboard.fitTo(
				this.horizontalBoundary.set(matrix.e),
				this.verticalBoundary.set(matrix.f),
				this.scaleBoundary.set(matrix.a)
			);
		};

		proto.updateVisibility = function() {
			var trackedPageIndex = calculateVisibility.call(this, this.trackingAimFor, this.visibilityIgnore);
			this.pasteboard.updateRectanglesTransforms();
			if ( trackedPageIndex != this.tracked && ~trackedPageIndex) {
				this.pasteboard.track( this.tracked = trackedPageIndex );
			}
		};

		proto.distanceToBeVisible = function(direction, index) {
			var vert = direction == DIRECTION.VERTICAL;
			var rect = this.pasteboard.rects[index];
			var distance = vert ? rect.verticalDistance : rect.horizontalDistance;
			if ( ~distance && rect.status < STATUS.VISIBLE ) {
				// distance is from closest edge to center
				return Math.abs(distance) - (this[vert ? 'height' : 'width'] / 2);
			}
			return -1;
		};

//		proto.insertRectangleBefore = function(rectangle, index, next) {
//			index = +index||0;
//			var existing = this.rects.indexOf(rectangle);
//			if ( ~existing ) {
//				if ( existing == index || existing == index+1 ) {
//					// insert before itself is nonsens, insert before next i is no-op
//					return this;
//				}
//				this.rects.splice(existing, 1);
//			}
//			this.rects.splice(index, 0, rectangle);
//			if ( next !== true ) {
//				this.afterRectanglesChanged(next);
//			}
//			return this;
//		};
//
//		proto.removeReactangle = function(index, next) {
//			this.rects.splice(index, 1);
//			if ( next !== true ) {
//				this.afterRectanglesChanged(next);
//			}
//			return this;
//		};
//
//		proto.placeRectangles = function() {
//

		proto.paint = function() {
			this.updateVisibility();
			this.pasteboard.paint();
		};

		proto.dump = function() {
			console.log('viewport', this.width, this.height);
			console.log('pasteboard', this.pasteboard.x, this.pasteboard.y, this.pasteboard.width, this.pasteboard.height);
			this.pasteboard.dump();
		};

		(function getter(prop, func) {
			Object.defineProperty(proto, prop, {get: func, enumerable: true});
			return getter;
		})(
			'scrollVerticalMin', function() {
				return this.scrollMin('height');
			}
		)(
			'scrollVerticalMax', function() {
				return this.scrollMax('height');
			}
		)(
			'scrollHorizontalMin', function() {
				return this.scrollMin('width');
			}
		)(
			'scrollHorizontalMax', function() {
				return this.scrollMax('width');
			}
		)(
			// this is imaginary scrollable element width e.q. how wide pasteboard needed to be to be able to scroll
			// into our limits, if specific max and min are used, then this is not the width of the pasteboard
			'scrollableOffsetWidth', function() {
				return this.scrollHorizontalMax - this.scrollHorizontalMin + this.width;
			}
		)(
			// see above
			'scrollableOffsetHeight', function() {
				return this.scrollVerticalMax - this.scrollVerticalMin + this.height;
			}
		)(
			'scrollLeft', function() {
				return this.scrollHorizontalMax - this.pasteboard.x;
			}
		)(
			'scrollTop', function() {
				return this.scrollVerticalMax - this.pasteboard.y;
			}
		);

		return Viewport;

	}

	if (typeof define === 'function' && define.amd) {
		define(['./boundary', './layout_rectangle'], create);
	} else if (typeof module !== 'undefined' && module.exports) {
		module.exports = create(require('./boundary'), require('./layout_rectangle'));
	} else {
		this.atirip.Viewport = create(this.atirip.Boundary, this.atirip.LayoutRectangle);
	}

}).call(this);