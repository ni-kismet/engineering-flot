/* eslint-disable */
/* global $, describe, it, xit, xdescribe, after, afterEach, expect*/

describe("flatdata plugin", function() {
    var placeholder, plot;
    var options = {
        series: {
            shadowSize: 0, // don't draw shadows
            lines: { show: false},
            points: { show: true, fill: false, symbol: 'circle' }
        }
    };

    beforeEach(function() {
        placeholder = setFixtures('<div id="test-container" style="width: 600px;height: 400px">')
            .find('#test-container');
    });

    it('should add two numbers', function () {
        var result = composeImages(2, 3);
        expect(result).toBe(5);
    });

    it('should call async', function (done) {
        var sources = [originalCanvas, originalSVG];
        composeAsync(sources, finalDestinationCanvas, function() {
            expect();
            done();
        });
    });

    function composeAsync(sources, finalDestinationCanvas, onDone) {
        var originalCanvas = sources[0],
            originalSvg = sources[1];
        copyCanvasToImg(originalCanvas, tempImg1);
        copySVGToImg(originalSvg, tempImg2, function() {
            destinationImg.width = 100; //the width and height have to be set prior to calling copyImgsToCanvas. Otherwise, no image will be painted.
            destinationImg.height = 100;
            var copyResult = copyImgsToCanvas([tempImg1, tempImg2], destinationImg);
            onDone();
        });
    }
});
