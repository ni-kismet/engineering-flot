/* eslint-disable */
/* global $, describe, it, xit, xdescribe, after, afterEach, expect*/

describe('CanvasWrapper', function() {
    var placeholder;
    beforeEach(function() {
        placeholder = setFixtures('<div id="test-container" style="width: 600px;height: 400px">')
            .find('#test-container');
    });

    it('should create a new canvas element', function() {
        var canvas = new Flot.Canvas('myCanvas', placeholder);

        expect(canvas.element).toBeTruthy();
        expect(placeholder.find('.myCanvas')).toBeTruthy();
    });

    it('should reuse an existing canvas with the same class', function() {
        var canvas1 = new Flot.Canvas('myCanvas', placeholder);
        var element1 = placeholder.find('.myCanvas')[0];

        var canvas2 = new Flot.Canvas('myCanvas', placeholder);
        var element2 = placeholder.find('.myCanvas')[0];

        expect(element1).toBe(element2);
        expect(placeholder.find('.myCanvas').length).toBe(1);
    });

    it('should measure the width and height of a text', function() {
        var canvas = newCanvas(placeholder);

        var info = canvas.getTextInfo('', 'text',);

        expect(info.width).toBeGreaterThan(0);
        expect(info.height).toBeGreaterThan(0);
    });

    it('should measure the width and height of a text based on its own CSS', function() {
        var canvas = newCanvas(placeholder);
        appendSetStyleFixtures('.a { font-size: 10px; }');
        appendSetStyleFixtures('.b { font-size: 20px; }');

        var info1 = canvas.getTextInfo('', 'text', 'a');
        var info2 = canvas.getTextInfo('', 'text', 'b');

        expect(info2.width).toBeGreaterThan(info1.width);
        expect(info2.height).toBeGreaterThan(info1.height);
    });

    it('should measure the width and height of a text based on its layer CSS', function() {
        var canvas = newCanvas(placeholder);
        appendSetStyleFixtures('.a { font-size: 10px; }');
        appendSetStyleFixtures('.b { font-size: 20px; }');

        var info1 = canvas.getTextInfo('a', 'text');
        var info2 = canvas.getTextInfo('b', 'text');

        expect(info2.width).toBeGreaterThan(info1.width);
        expect(info2.height).toBeGreaterThan(info1.height);
    });

    it('should measure the width of a text based on its actual length', function() {
        var canvas = newCanvas(placeholder);
        appendSetStyleFixtures('.a { font-size: 10px; }');

        var info1 = canvas.getTextInfo('a', 'text');
        var info2 = canvas.getTextInfo('a', 'longer text');

        expect(info2.width).toBeGreaterThan(info1.width);
    });

    it('should return the same width and height for numbers with the same digit count', function() {
        var canvas = newCanvas(placeholder);
        var info1 = canvas.getTextInfo('', '01234');
        var info2 = canvas.getTextInfo('', '56789');

        expect(info2.width).toBe(info1.width);
    });

    function newCanvas(placeholder) {
        return new Flot.Canvas('myCanvas', placeholder);
    }
});
