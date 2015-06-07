var expect = require('chai').expect;
var lint = require('mocha-eslint');

var Layout = require('../layout');


describe('Layout', function() {

	lint(['layout.js']);

	it('should be a object', function () {
		expect(Layout).to.be.a('object');
		expect(Layout.Matrix).to.be.a('function');
		expect(Layout.Rectangle).to.be.a('function');
		expect(Layout.Collection).to.be.a('function');
		expect(Layout.Viewport).to.be.a('function');
		expect(Layout.Boundary).to.be.a('function');
	});

});
