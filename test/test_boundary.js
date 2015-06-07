var expect = require('chai').expect;
var lint = require('mocha-eslint');

var Boundary = require('../boundary');


describe('Boundary', function() {

	lint(['boundary.js']);

	it('should be a function', function () {
		expect(Boundary).to.be.a('function');
	});

	it('should create instance', function () {
		var b;

		b = Boundary();
		expect(b.min).to.equal(0);
		expect(b.max).to.equal(0);
		expect(b.multiplierMin).to.equal(0);
		expect(b.multiplierMax).to.equal(0);

		b = Boundary(1, 2);
		expect(b.min).to.equal(1);
		expect(b.max).to.equal(2);
		expect(b.multiplierMin).to.equal(0);
		expect(b.multiplierMax).to.equal(0);

		b = Boundary(1, 2, 3);
		expect(b.min).to.equal(1);
		expect(b.max).to.equal(2);
		expect(b.multiplierMin).to.equal(3);
		expect(b.multiplierMax).to.equal(3);

		b = Boundary(1,2,3,4);
		expect(b.min).to.equal(1);
		expect(b.max).to.equal(2);
		expect(b.multiplierMin).to.equal(3);
		expect(b.multiplierMax).to.equal(4);

		b = Boundary(1,2,3,4);
		var c = Boundary(b);
		expect(c.min).to.equal(1);
		expect(c.max).to.equal(2);
		expect(c.multiplierMin).to.equal(3);
		expect(c.multiplierMax).to.equal(4);



	});

	it('should return reach', function () {
		var b = Boundary(-1, 2);
		expect(b.reach).to.equal(3);
	});

	it('should return outside value', function () {
		var b = Boundary(-1, 2);
		expect( b.outside(7) ).to.equal(5);
		expect( b.outside(-7) ).to.equal(-6);
	});

	it('should return inside value ', function () {
		var b;
		b = Boundary(-1, 2);
		expect( b.set(7) ).to.equal(2);
		expect( b.set(-7) ).to.equal(-1);
		expect( b.set(0) ).to.equal(0);

		b = Boundary(-1, 2, 0.5);
		expect( b.set(7) ).to.equal(4.5);
		expect( b.set(-7) ).to.equal(-4);
		expect( b.set(0) ).to.equal(0);
	});

});
