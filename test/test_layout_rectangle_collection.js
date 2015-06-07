var expect = require('chai').expect;
var lint = require('mocha-eslint');

var LayoutRectangleCollection = require('../layout_rectangle_collection');
var LayoutRectangle = require('../layout_rectangle');
var Rectangle = require('@atirip/rectangle');


describe('LayoutRectangleCollection', function() {

	lint(['layout_rectangle_collection.js']);

	it('should be a function', function () {
		expect(LayoutRectangleCollection).to.be.a('function');
	});

	it('should create instance', function () {

 		var l;
		var r;
		var context = this;


		l = LayoutRectangleCollection(function callback() {
			r = this == l;
		});

		l.callback.call(l.context);
		expect( r ).to.be.ok

		l = LayoutRectangleCollection(function callback() {
			r = this == context;
		}, context);

		l.callback.call(l.context);
		expect( r ).to.be.ok


	});


	it('should insert/append/remove rectangles', function () {

		var top = [];
		var tself = [];
		var trect = [];
		var tindex = [];

		var l = LayoutRectangleCollection(function callback(op, self, rect, index) {
			top.push(op);
			tself.push(self);
			trect.push(rect);
			tindex.push(index);
		});

		// insert
		var r = Rectangle();
		l.insertRectangleBefore(r);
		expect( l.rects.length ).to.equal(1);
		expect( l.rects[0] ).to.equal(r);

		r = Rectangle();
		l.insertRectangleBefore(r);
		expect( l.rects.length ).to.equal(2);
		expect( l.rects[0] ).to.equal(r);

		r = Rectangle();
		l.insertRectangleBefore(r, 0);
		expect( l.rects.length ).to.equal(3);
		expect( l.rects[0] ).to.equal(r);

		r = Rectangle();
		l.insertRectangleBefore(r, 2);
		expect( l.rects.length ).to.equal(4);
		expect( l.rects[2] ).to.equal(r);

		r = Rectangle();
		l.insertRectangleBefore(r, 100);
		expect( l.rects.length ).to.equal(5);
		expect( l.rects[4] ).to.equal(r);

		var c = 0;
		top = [];
		l.insertRectangleBefore(r, 100, function() {
			c++;
		});

		expect( c ).to.equal(1);
		expect( top[0] ).to.equal(LayoutRectangleCollection.CALLBACK.PLACE_PAGES);

		top = [];
		l.insertRectangleBefore(r, 100, true);
		expect( top.length ).to.equal(0);


		// append
		var len = l.rects.length;
		r = Rectangle();
		l.appendRectangle(r);
		expect( l.rects.length ).to.equal(len+1);
		expect( l.rects[len] ).to.equal(r);

		c = 0;
		top = [];
		l.appendRectangle(r, function() {
			c++;
		});

		expect( c ).to.equal(1);
		expect( top[0] ).to.equal(LayoutRectangleCollection.CALLBACK.PLACE_PAGES);

		top = [];
		l.appendRectangle(r, true);
		expect( top.length ).to.equal(0);


		// remove
		// mock rects
		l.rects = [1,2,3,4,5];
		l.removeReactangle(0);
		expect( l.rects ).to.be.deep.equal([2,3,4,5]);
		l.removeReactangle(2);
		expect( l.rects ).to.be.deep.equal([2,3,5]);

		l.removeReactangle(7);
		expect( l.rects ).to.be.deep.equal([2,3,5]);


		c = 0;
		top = [];
		l.removeReactangle(0, function() {
			c++;
		});

		expect( c ).to.equal(1);
		expect( top[0] ).to.equal(LayoutRectangleCollection.CALLBACK.PLACE_PAGES);

		top = [];
		l.removeReactangle(0, true);
		expect( top.length ).to.equal(0);

	});


	it('should center rectangles', function () {
		var R1 = LayoutRectangle(1, 100, 200);
		var R2 = LayoutRectangle(2, 100, 100);
		var R3 = LayoutRectangle(3, 200, 200);
		var R4 = LayoutRectangle(4, 200, 100);
		var L = LayoutRectangleCollection(function callback(op, self, rect, index) {});
		L.appendRectangle(R1, true).appendRectangle(R2, true).appendRectangle(R3, true).appendRectangle(R4);
		L.height = 1000;
		L.width = 1000;
		L.centerRectangles(LayoutRectangle.DIRECTION.VERTICAL);

		expect( R1.x ).to.equal(450);
		expect( R2.x ).to.equal(450);
		expect( R3.x ).to.equal(400);
		expect( R4.x ).to.equal(400);

	});

	it('should line up rectangles', function () {

		var R1 = LayoutRectangle(1, 100, 200);
		var R2 = LayoutRectangle(2, 100, 100);
		var R3 = LayoutRectangle(3, 200, 200);
		var R4 = LayoutRectangle(4, 200, 100);
		var L = LayoutRectangleCollection(function callback(op, self, rect, index) {});
		L.appendRectangle(R1, true).appendRectangle(R2, true).appendRectangle(R3, true).appendRectangle(R4);

		L.lineUpRectangles(LayoutRectangle.DIRECTION.VERTICAL, 10, 20);

		expect( R1.x ).to.equal(70);
		expect( R1.y ).to.equal(10);

		expect( R2.x ).to.equal(70);
		expect( R2.y ).to.equal(230);

		expect( R3.x ).to.equal(20);
		expect( R3.y ).to.equal(350);

		expect( R4.x ).to.equal(20);
		expect( R4.y ).to.equal(570);

		expect( L.width ).to.equal(240);
		expect( L.height ).to.equal(680);
	});

	it('should transform rectangles', function () {

		var R1 = LayoutRectangle(1, 100, 200);
		var R2 = LayoutRectangle(2, 100, 100);
		var R3 = LayoutRectangle(3, 200, 200);
		var R4 = LayoutRectangle(4, 200, 100);
		var L = LayoutRectangleCollection(function callback(op, self, rect, index) {});
		L.appendRectangle(R1, true).appendRectangle(R2, true).appendRectangle(R3, true).appendRectangle(R4);
		L.lineUpRectangles(LayoutRectangle.DIRECTION.VERTICAL, 10, 20);

		L.transform('absTransform', 70, 10, 100, 200, 0.5);

		expect( L.x ).to.equal(135);
		expect( L.y ).to.equal(205);
		expect( L.width ).to.equal(120);
		expect( L.height ).to.equal(340);

		expect( R1.x ).to.equal(170);
		expect( R1.y ).to.equal(210);
		expect( R1.width ).to.equal(50);
		expect( R1.height ).to.equal(100);

		expect( R2.x ).to.equal(170);
		expect( R2.y ).to.equal(320);
		expect( R2.width ).to.equal(50);
		expect( R2.height ).to.equal(50);
	});


//		proto.fitTo = function(e, f, s) {
//			proto.updateRectanglesTransforms = function() {
//
//		proto.paint = function() {
//				proto.track = function(trackedPageIndex) {


});