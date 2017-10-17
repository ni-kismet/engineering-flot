/* eslint-disable */
/* global $, describe, it, xit, xdescribe, after, afterEach, expect*/

describe("composeImages", function() {
    var placeholder, plot;
    var options = {
        series: {
            shadowSize: 0, // don't draw shadows
            lines: { show: false},
            points: { show: true, fill: false, symbol: 'circle' }
        }
    };
    var composeImages = $.plot.composeImages;

    function matchPixelColor(pixelData, r, g, b, a) {
        return (pixelData[0] === r) && (pixelData[1] === g) && (pixelData[2] === b) && (pixelData[3] === a);
    }

    beforeEach(function() {
        placeholder = setFixtures('<div id="test-container" style="width: 600px;height: 400px">')
            .find('#test-container');
    });

    it('should call composeImages on an empty array of sources', function (done) {
        var sources = placeholder.html(`<div id="test-container" style="width: 600px;height: 400px">
        </div>
        <canvas id="myCanvas" width="300" height="150" style="border:1px solid #d3d3d3;"></canvas>
        `).find('svg').toArray();

        var destinationCanvas = document.getElementById("myCanvas");
        var pixelData; //used later

        composeImages(sources, destinationCanvas).then(function() {
            pixelData = destinationCanvas.getContext('2d').getImageData(10, 10, 1, 1).data;
            expect(matchPixelColor(pixelData, 0, 0, 0, 0)).toBe(true);

            pixelData = destinationCanvas.getContext('2d').getImageData(30, 40, 1, 1).data;
            expect(matchPixelColor(pixelData, 0, 0, 0, 0)).toBe(true);

            pixelData = destinationCanvas.getContext('2d').getImageData(50, 70, 1, 1).data;
            expect(matchPixelColor(pixelData, 0, 0, 0, 0)).toBe(true);

            pixelData = destinationCanvas.getContext('2d').getImageData(10, 110, 1, 1).data;
            expect(matchPixelColor(pixelData, 0, 0, 0, 0)).toBe(true);

            pixelData = destinationCanvas.getContext('2d').getImageData(30, 140, 1, 1).data;
            expect(matchPixelColor(pixelData, 0, 0, 0, 0)).toBe(true);

            pixelData = destinationCanvas.getContext('2d').getImageData(50, 170, 1, 1).data;
            expect(matchPixelColor(pixelData, 0, 0, 0, 0)).toBe(true);

            done();
        }, null);
    });


    it('should call composeImages on one SVG as a source', function (done) {
        var sources = placeholder.html(`<div id="test-container" style="width: 600px;height: 400px">
        <svg id="svgSource" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" width="100" height="100" title="svg">
          <circle id="c1" cx="10" cy="10" r="5" style="fill:red"/>
          <circle id="c2" cx="30" cy="40" r="7" style="fill:#00FF00"/>
          <circle id="c3" cx="50" cy="70" r="9" style="fill:blue"/>
        </svg>
        </div>
        <canvas id="myCanvas" width="300" height="150" style="border:1px solid #d3d3d3;"></canvas>
        `).find('svg').toArray();

        var destinationCanvas = document.getElementById("myCanvas");
        var pixelData; //used later

        composeImages(sources, destinationCanvas).then(function() {
            expect(destinationCanvas.width).toBe(100);
            expect(destinationCanvas.height).toBe(100);

            pixelData = destinationCanvas.getContext('2d').getImageData(10, 10, 1, 1).data;
            expect(matchPixelColor(pixelData, 255, 0, 0, 255)).toBe(true);

            pixelData = destinationCanvas.getContext('2d').getImageData(30, 40, 1, 1).data;
            expect(matchPixelColor(pixelData, 0, 255, 0, 255)).toBe(true);

            pixelData = destinationCanvas.getContext('2d').getImageData(50, 70, 1, 1).data;
            expect(matchPixelColor(pixelData, 0, 0, 255, 255)).toBe(true);

            done();
        }, null);
    });


    it('should call composeImages on two identical SVGs, one near the other', function (done) {
        var sources = placeholder.html(`<div id="test-container" style="width: 600px;height: 400px">
        <svg id="svgSource" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" width="100" height="100" title="svg">
          <circle id="c1" cx="10" cy="10" r="5" style="fill:red"/>
          <circle id="c2" cx="30" cy="40" r="7" style="fill:#00FF00"/>
          <circle id="c3" cx="50" cy="70" r="9" style="fill:blue"/>
        </svg>
        <svg id="svgSource2" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" width="100" height="100" title="svg2">
          <circle id="c1" cx="10" cy="10" r="5" style="fill:red"/>
          <circle id="c2" cx="30" cy="40" r="7" style="fill:#00FF00"/>
          <circle id="c3" cx="50" cy="70" r="9" style="fill:blue"/>
        </svg>
        </div>
        <canvas id="myCanvas" width="300" height="150" style="border:1px solid #d3d3d3;"></canvas>
        `).find('svg').toArray();

        var destinationCanvas = document.getElementById("myCanvas");
        var pixelData; //used later

/*
        var ctx = destinationCanvas.getContext('2d');
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(99, 99);
        ctx.moveTo(30, 60);
        ctx.lineTo(70, 40);
        ctx.stroke();
/*
        var c = document.getElementById("myCanvas");
        var ctx = c.getContext("2d");
        ctx.fillStyle = "red";
        ctx.fillRect(0, 0, 50, 50);
        function copy() {
            var imgData = ctx.getImageData(0, 0, 1, 1);
            var aData = imgData.data;
            alert(aData);
            ctx.putImageData(imgData, 10, 70);
        }
*/
        composeImages(sources, destinationCanvas).then(function() {
            /*
            var canvas = document.createElement('canvas');
            canvas.width = destinationImage.width;
            canvas.height = destinationImage.height;
            canvas.getContext('2d').drawImage(destinationImage, 0, 0, destinationImage.width, destinationImage.height);

            //myCanvas
*/
            //var pixelData = canvas.getContext('2d').getImageData(51, 67, 1, 1).data;

            expect(destinationCanvas.width).toBe(204); //200 + 2 * 2px_spacing
            expect(destinationCanvas.height).toBe(100);

            pixelData = destinationCanvas.getContext('2d').getImageData(10, 10, 1, 1).data;
            expect(matchPixelColor(pixelData, 255, 0, 0, 255)).toBe(true);

            pixelData = destinationCanvas.getContext('2d').getImageData(30, 40, 1, 1).data;
            expect(matchPixelColor(pixelData, 0, 255, 0, 255)).toBe(true);

            pixelData = destinationCanvas.getContext('2d').getImageData(50, 70, 1, 1).data;
            expect(matchPixelColor(pixelData, 0, 0, 255, 255)).toBe(true);

            pixelData = destinationCanvas.getContext('2d').getImageData(110, 10, 1, 1).data;
            expect(matchPixelColor(pixelData, 255, 0, 0, 255)).toBe(true);

            pixelData = destinationCanvas.getContext('2d').getImageData(130, 40, 1, 1).data;
            expect(matchPixelColor(pixelData, 0, 255, 0, 255)).toBe(true);

            pixelData = destinationCanvas.getContext('2d').getImageData(150, 70, 1, 1).data;
            expect(matchPixelColor(pixelData, 0, 0, 255, 255)).toBe(true);

            done();
        }, null);
    });


    it('should call composeImages on two identical SVGs, one after the other', function (done) {
        var sources = placeholder.html(`<div id="test-container" style="width: 600px;height: 400px">
        <svg id="svgSource" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" width="100" height="100" title="svg">
          <circle id="c1" cx="10" cy="10" r="5" style="fill:red"/>
          <circle id="c2" cx="30" cy="40" r="7" style="fill:#00FF00"/>
          <circle id="c3" cx="50" cy="70" r="9" style="fill:blue"/>
        </svg>
        <br>
        <svg id="svgSource2" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" width="100" height="100" title="svg2">
          <circle id="c1" cx="10" cy="10" r="5" style="fill:red"/>
          <circle id="c2" cx="30" cy="40" r="7" style="fill:#00FF00"/>
          <circle id="c3" cx="50" cy="70" r="9" style="fill:blue"/>
        </svg>
        </div>
        <canvas id="myCanvas" width="300" height="150" style="border:1px solid #d3d3d3;"></canvas>
        `).find('svg').toArray();

        var destinationCanvas = document.getElementById("myCanvas");
        var pixelData; //used later

        composeImages(sources, destinationCanvas).then(function() {
            expect(destinationCanvas.width).toBe(100);
            expect(destinationCanvas.height).toBe(204);  //200 + 2 * 2px_spacing

            pixelData = destinationCanvas.getContext('2d').getImageData(10, 10, 1, 1).data;
            expect(matchPixelColor(pixelData, 255, 0, 0, 255)).toBe(true);

            pixelData = destinationCanvas.getContext('2d').getImageData(30, 40, 1, 1).data;
            expect(matchPixelColor(pixelData, 0, 255, 0, 255)).toBe(true);

            pixelData = destinationCanvas.getContext('2d').getImageData(50, 70, 1, 1).data;
            expect(matchPixelColor(pixelData, 0, 0, 255, 255)).toBe(true);

            pixelData = destinationCanvas.getContext('2d').getImageData(10, 110, 1, 1).data;
            expect(matchPixelColor(pixelData, 255, 0, 0, 255)).toBe(true);

            pixelData = destinationCanvas.getContext('2d').getImageData(30, 140, 1, 1).data;
            expect(matchPixelColor(pixelData, 0, 255, 0, 255)).toBe(true);

            pixelData = destinationCanvas.getContext('2d').getImageData(50, 170, 1, 1).data;
            expect(matchPixelColor(pixelData, 0, 0, 255, 255)).toBe(true);

            done();
        }, null);
    });

    it('should call composeImages on three identical SVGs, placed in an L-shape', function (done) {
        var sources = placeholder.html(`<div id="test-container" style="width: 600px;height: 400px">
        <svg id="svgSource1" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" width="100" height="100" title="svg1">
          <circle id="c1" cx="10" cy="10" r="5" style="fill:red"/>
          <circle id="c2" cx="30" cy="40" r="7" style="fill:#00FF00"/>
          <circle id="c3" cx="50" cy="70" r="9" style="fill:blue"/>
        </svg>
        <svg id="svgSource2" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" width="100" height="100" title="svg2">
          <circle id="c1" cx="10" cy="10" r="5" style="fill:red"/>
          <circle id="c2" cx="30" cy="40" r="7" style="fill:#00FF00"/>
          <circle id="c3" cx="50" cy="70" r="9" style="fill:blue"/>
        </svg>
        <br>
        <svg id="svgSource3" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" width="100" height="100" title="svg3">
          <circle id="c1" cx="10" cy="10" r="5" style="fill:red"/>
          <circle id="c2" cx="30" cy="40" r="7" style="fill:#00FF00"/>
          <circle id="c3" cx="50" cy="70" r="9" style="fill:blue"/>
        </svg>
        </div>
        <canvas id="myCanvas" width="300" height="150" style="border:1px solid #d3d3d3;"></canvas>
        `).find('svg').toArray();

        var destinationCanvas = document.getElementById("myCanvas");
        var pixelData; //used later

        composeImages(sources, destinationCanvas).then(function() {
            expect(destinationCanvas.width).toBe(204);  //200 + 2 * 2px_spacing
            expect(destinationCanvas.height).toBe(204);  //200 + 2 * 2px_spacing

            pixelData = destinationCanvas.getContext('2d').getImageData(10, 10, 1, 1).data;
            expect(matchPixelColor(pixelData, 255, 0, 0, 255)).toBe(true);

            pixelData = destinationCanvas.getContext('2d').getImageData(30, 40, 1, 1).data;
            expect(matchPixelColor(pixelData, 0, 255, 0, 255)).toBe(true);

            pixelData = destinationCanvas.getContext('2d').getImageData(50, 70, 1, 1).data;
            expect(matchPixelColor(pixelData, 0, 0, 255, 255)).toBe(true);

            pixelData = destinationCanvas.getContext('2d').getImageData(110, 10, 1, 1).data;
            expect(matchPixelColor(pixelData, 255, 0, 0, 255)).toBe(true);

            pixelData = destinationCanvas.getContext('2d').getImageData(130, 40, 1, 1).data;
            expect(matchPixelColor(pixelData, 0, 255, 0, 255)).toBe(true);

            pixelData = destinationCanvas.getContext('2d').getImageData(150, 70, 1, 1).data;
            expect(matchPixelColor(pixelData, 0, 0, 255, 255)).toBe(true);

            pixelData = destinationCanvas.getContext('2d').getImageData(10, 110, 1, 1).data;
            expect(matchPixelColor(pixelData, 255, 0, 0, 255)).toBe(true);

            pixelData = destinationCanvas.getContext('2d').getImageData(30, 140, 1, 1).data;
            expect(matchPixelColor(pixelData, 0, 255, 0, 255)).toBe(true);

            pixelData = destinationCanvas.getContext('2d').getImageData(50, 170, 1, 1).data;
            expect(matchPixelColor(pixelData, 0, 0, 255, 255)).toBe(true);

            done();
        }, null);
    });

    it('should call composeImages on one canvas as a source', function (done) {
        var sources = placeholder.html(`<div id="test-container" style="width: 600px;height: 400px">
        <canvas id="canvasSource" width="100" height="100" title="canvasSource"></canvas>
        </div>
        <canvas id="myCanvas" width="30" height="15" style="border:1px solid #d3d3d3;"></canvas>
        `).find('CANVAS').toArray();

        sources.pop(); //remove myCanvas from the sources array, because it is a destination

        var originalCanvas = document.getElementById("canvasSource");
        var destinationCanvas = document.getElementById("myCanvas");
        var pixelData; //used later

        function writeSomethingToCanvas(canvas) {
            var ctx = canvas.getContext('2d');
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(99, 99);
            ctx.moveTo(30, 60);
            ctx.lineTo(70, 40);
            ctx.stroke();
        }

        writeSomethingToCanvas(originalCanvas);

        composeImages(sources, destinationCanvas).then(function() {
            expect(destinationCanvas.width).toBe(100);
            expect(destinationCanvas.height).toBe(100);
/*
            pixelData = destinationCanvas.getContext('2d').getImageData(10, 10, 1, 1).data;
            expect(matchPixelColor(pixelData, 255, 0, 0, 255)).toBe(true);

            pixelData = destinationCanvas.getContext('2d').getImageData(30, 40, 1, 1).data;
            expect(matchPixelColor(pixelData, 0, 255, 0, 255)).toBe(true);

            pixelData = destinationCanvas.getContext('2d').getImageData(50, 70, 1, 1).data;
            expect(matchPixelColor(pixelData, 0, 0, 255, 255)).toBe(true);
*/
            done();
        }, null);
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
