var expect = require('chai').expect;
var lint = require('mocha-eslint');

var file = 'layout_rectangle.js'
var LayoutRectangle = require('../' + file);
var Matrix = require('@atirip/matrix');
var Rectangle = require("@atirip/rectangle");


describe('LayoutRectangle', function() {

	lint([file]);

	it('should be a function', function () {
		expect(LayoutRectangle).to.be.a('function');
	});

	it('should create instance', function () {
		var l = LayoutRectangle('foo', 1,2,3,4);
		expect( l.id ).to.equal('foo');
		expect( l.x ).to.equal(1);
		expect( l.y ).to.equal(2);
		expect( l.width ).to.equal(3);
		expect( l.height ).to.equal(4);
	});

	it('should return invisibility', function () {
		var l = LayoutRectangle('foo', 1,2,3,4);
		expect( l.invisible ).to.be.not.ok;
		l.status = LayoutRectangle.STATUS.INVISIBLE;
		expect( l.invisible ).to.be.ok;
	});

	it('should return transform', function () {
		var l = LayoutRectangle('foo', 1,2,3,4);
		var t = l.makeTransformIf();
		expect( t.equal({ a: 1, b: 0, c: 0, d: 1, e: 1, f: 2 }) ).to.be.ok;
		var t = l.makeTransformIf();
		expect( t ).to.be.not.ok;
		var t = l.makeTransformIf();
		expect( t ).to.be.not.ok;
		l.y = 7;
		var t = l.makeTransformIf();
		expect( t.equal({ a: 1, b: 0, c: 0, d: 1, e: 1, f: 7 }) ).to.be.ok;
	});

});