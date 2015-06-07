var expect = require('chai').expect;
var lint = require('mocha-eslint');

var LayoutRectangleCollection = require('../layout_rectangle_collection');
var LayoutRectangle = require('../layout_rectangle');
var Viewport = require('../viewport');


describe('Viewport', function() {

	lint(['viewport.js']);

	it('should be a function', function () {
		expect(Viewport).to.be.a('function');
	});

	function createPasteboard() {
		var R1 = LayoutRectangle(1, 100, 200);
		var R2 = LayoutRectangle(2, 100, 100);
		var R3 = LayoutRectangle(3, 200, 200);
		var R4 = LayoutRectangle(4, 200, 100);

		var L = LayoutRectangleCollection(function callback(op, self, rect, index) {

		});

		L.appendRectangle(R1, true).appendRectangle(R2, true).appendRectangle(R3, true).appendRectangle(R4);
		L.lineUpRectangles(LayoutRectangle.DIRECTION.VERTICAL, 10, 20);
		return L;
	}

	it('should create instance', function () {

		var V = Viewport('V', createPasteboard(), 400, 300);

		V.resetBoundaries();
		V.centerPasteboard();

		expect( V.width ).to.equal(400);
		expect( V.height ).to.equal(300);

		// pasteboard is 240 x680
		expect( V.pasteboard.x ).to.equal(80);
		expect( V.pasteboard.y ).to.equal(0);

		expect( V.scrollVerticalMax ).to.equal(0);
		expect( V.scrollVerticalMin ).to.equal(-380);
		expect( V.scrollableOffsetHeight ).to.equal(680);

		expect( V.scrollHorizontalMax ).to.equal(160);
		expect( V.scrollHorizontalMin ).to.equal(0);
		expect( V.scrollableOffsetWidth ).to.equal(560);

		expect( V.scrollLeft ).to.equal(80);
		expect( V.scrollTop ).to.equal(0);

		expect( V.horizontalBoundary.max ).to.equal(V.scrollHorizontalMax);
		expect( V.horizontalBoundary.min ).to.equal(V.scrollHorizontalMin);

		expect( V.verticalBoundary.max ).to.equal(V.scrollVerticalMax);
		expect( V.verticalBoundary.min ).to.equal(V.scrollVerticalMin);

		Object.defineProperty(V, 'scrollHorizontalMin', { get: function() {
			return this.scrollMin('width') - Math.min(this.pasteboard.width, this.width);
		}});

		Object.defineProperty(V, 'scrollHorizontalMax', { get: function() {
			return this.scrollMax('width') + Math.min(this.pasteboard.width, this.width);
		}});

		expect( V.scrollHorizontalMax ).to.equal(400);
		expect( V.scrollHorizontalMin ).to.equal(-240);

		expect( V.scrollableOffsetHeight ).to.equal(680);
		expect( V.scrollableOffsetWidth ).to.equal(1040);
		expect( V.scrollLeft ).to.equal(320);
		expect( V.scrollTop ).to.equal(0);

	});


	it('should transform pasteboard', function () {

		var V = Viewport('V', createPasteboard(), 400, 300);
		V.resetBoundaries();
//		V.centerPasteboard();
		Object.defineProperty(V, 'scrollHorizontalMin', { get: function() {
			return this.scrollMin('width') - Math.min(this.pasteboard.width, this.width);
		}});

		Object.defineProperty(V, 'scrollHorizontalMax', { get: function() {
			return this.scrollMax('width') + Math.min(this.pasteboard.width, this.width);
		}});

		var R1 = V.pasteboard.rects[0];
		var R2 = V.pasteboard.rects[1];

		V.transformPasteboard('absTransform', 70, 10, 1000, 2000, 0.5);

		expect( R1.x ).to.equal(1070);
		expect( R1.y ).to.equal(2010);
		expect( R1.width ).to.equal(50);
		expect( R1.height ).to.equal(100);

		expect( R2.x ).to.equal(1070);
		expect( R2.y ).to.equal(2120);
		expect( R2.width ).to.equal(50);
		expect( R2.height ).to.equal(50);


		V.fitPasteboardIntoBoundaries();
		// this will set x to scrollHorizontalMax and y to scrollVerticalMax
		expect( V.pasteboard.x ).to.equal(400);
		expect( V.pasteboard.y ).to.equal(0);
		expect( V.pasteboard.width ).to.equal(240);
		expect( V.pasteboard.height ).to.equal(680);


		expect( R1.x ).to.equal(470);
		expect( R1.y ).to.equal(10);
		expect( R1.width ).to.equal(100);
		expect( R1.height ).to.equal(200);

		expect( R2.x ).to.equal(470);
		expect( R2.y ).to.equal(230);
		expect( R2.width ).to.equal(100);
		expect( R2.height ).to.equal(100);


	});

	it('should set visibility ', function () {

		var V = Viewport('V', createPasteboard(), 400, 300);
		V.resetBoundaries();
		V.centerPasteboard();

		V.updateVisibility();

		var R1 = V.pasteboard.rects[0];
		var R2 = V.pasteboard.rects[1];
		var R3 = V.pasteboard.rects[2];
		var R4 = V.pasteboard.rects[3];

		expect( R4.verticalDistance ).to.equal(420);
		expect( R4.horizontalDistance ).to.equal(0);

		expect( R1.visibility ).to.equal(LayoutRectangle.VISIBLE.FULLY);
		expect( R2.visibility ).to.equal(LayoutRectangle.VISIBLE.PARTIALLY);
		expect( R3.visibility ).to.equal(LayoutRectangle.VISIBLE.NO);
		expect( R4.visibility ).to.equal(LayoutRectangle.VISIBLE.NO);

		expect( V.distanceToBeVisible(LayoutRectangle.DIRECTION.VERTICAL, 3) ).to.equal(270);

	});


});