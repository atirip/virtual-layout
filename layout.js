(function() {

	'use strict';

	function create(Matrix, LayoutRectangle, LayoutRectangleCollection, Viewport, Boundary) {
		return {
			Matrix: Matrix,
			Rectangle: LayoutRectangle,
			Collection: LayoutRectangleCollection,
			Viewport: Viewport,
			Boundary: Boundary
		};
	}

	if (typeof define === 'function' && define.amd) {
		define([
			'./matrix',
			'./layout_rectangle',
			'./layout_rectangle_collection',
			'./viewport',
			'./boundary'
		], create);
	} else if (typeof module !== 'undefined' && module.exports) {
		module.exports = create(
			require('@atirip/matrix'),
			require('./layout_rectangle'),
			require('./layout_rectangle_collection'),
			require('./viewport'),
			require('./boundary')
		);
	}

}).call(this);
