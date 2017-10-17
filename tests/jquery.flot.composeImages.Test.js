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

/*
    function matchPixelColor(pixelData, r, g, b, a) {
        return (pixelData[0] === r) && (pixelData[1] === g) && (pixelData[2] === b) && (pixelData[3] === a);
    }
*/

    //it looks like in some browsers (e.g. Firefox), the colors are affected at drawing, so the matchPixelColor function should expect a small difference
    function matchPixelColor(pixelData, r, g, b, a) {
        const err = 11;
        return (Math.abs(pixelData[0] - r) <= err) && (Math.abs(pixelData[1] - g) <= err) && (Math.abs(pixelData[2] - b) <= err) && (Math.abs(pixelData[3] - a) <= err);
    }

    function matchPixelDataArrays(pixelData1, pixelData2) {
        var sameValue = true;
        if (pixelData1.length !== pixelData2.length) {
            sameValue = false;
        } else {
            for (var i = 0; i < pixelData1.length; i++) {
                if (pixelData1[i] !== pixelData2[i]) {
                    sameValue = false;
                    break;
                }
            }
        }
        return sameValue;
    }

    beforeEach(function() {
        placeholder = setFixtures('<div id="test-container" style="width: 600px;height: 400px">')
            .find('#test-container');
    });

    it('should call composeImages on an empty array of sources, so the destination canvas should stay unmodified', function (done) {
        var sources = placeholder.html(`<div id="test-container" style="width: 600px;height: 400px">
        </div>
        <canvas id="myCanvas" width="300" height="150" style="border:1px solid #d3d3d3;"></canvas>
        `).find('svg').toArray();

        var destinationCanvas = document.getElementById("myCanvas");
        var pixelData; //used later

        function writeSomethingToCanvas(canvas) {
            var ctx = canvas.getContext('2d');
            //ctx.beginPath();
            ctx.arc(80, 10, 5, 0, 2 * Math.PI);
            ctx.fill();
            //ctx.stroke();
        }

        writeSomethingToCanvas(destinationCanvas); //make sure composeImages won't modify this content

        composeImages(sources, destinationCanvas).then(function() {
            pixelData = destinationCanvas.getContext('2d').getImageData(80, 10, 1, 1).data;
            expect(matchPixelColor(pixelData, 0, 0, 0, 255)).toBe(true);

            expect(destinationCanvas.width).toBe(300);
            expect(destinationCanvas.height).toBe(150);

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

        composeImages(sources, destinationCanvas).then(function() {
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
          <circle id="c1" cx="10" cy="10" r="5" style="fill:#FF0000"/>
          <circle id="c2" cx="30" cy="40" r="7" style="fill:#00FF00"/>
          <circle id="c3" cx="50" cy="70" r="9" style="fill:#0000FF"/>
        </svg>
        <br>
        <svg id="svgSource2" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" width="100" height="100" title="svg2">
          <circle id="c1" cx="10" cy="10" r="5" style="fill:#FF0000"/>
          <circle id="c2" cx="30" cy="40" r="7" style="fill:#00FF00"/>
          <circle id="c3" cx="50" cy="70" r="9" style="fill:#0000FF"/>
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
        <canvas id="canvasSource" width="20" height="20" title="canvasSource"></canvas>
        </div>
        <canvas id="myCanvas" width="30" height="15" style="border:1px solid #d3d3d3;"></canvas>
        `).find('#canvasSource').toArray();

        var originalCanvas = document.getElementById("canvasSource");
        var destinationCanvas = document.getElementById("myCanvas");
        var canvas1_Data; //used later
        var canvas2_Data; //used later

        function writeSomethingToCanvas(canvas) {
            var ctx = canvas.getContext('2d');
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(19, 19);
            ctx.moveTo(3, 18);
            ctx.lineTo(17, 5);
            ctx.stroke();
        }

        writeSomethingToCanvas(originalCanvas);

        composeImages(sources, destinationCanvas).then(function() {
            expect(destinationCanvas.width).toBe(20);
            expect(destinationCanvas.height).toBe(20);

            canvas1_Data = originalCanvas.getContext('2d').getImageData(0, 0, 20, 20).data;
            canvas2_Data = destinationCanvas.getContext('2d').getImageData(0, 0, 20, 20).data;

            expect(matchPixelDataArrays(canvas1_Data, canvas2_Data)).toBe(true);
            done();
        }, null);
    });

    it('should call composeImages on one canvas and one SVG', function (done) {
        var sources = placeholder.html(`<div id="test-container" style="width: 600px;height: 400px">
        <canvas class="imgsrc" id="canvasSource" width="20" height="20" title="canvasSource"></canvas>
        <svg class="imgsrc" id="svgSource1" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" width="100" height="100" title="svg1">
          <circle id="c1" cx="10" cy="10" r="5" style="fill:red"/>
          <circle id="c2" cx="30" cy="40" r="7" style="fill:#00FF00"/>
          <circle id="c3" cx="50" cy="70" r="9" style="fill:blue"/>
        </svg>
        </div>
        <canvas id="myCanvas" width="30" height="15" style="border:1px solid #d3d3d3;"></canvas>
        `).find('.imgsrc').toArray();

        var originalCanvas = document.getElementById("canvasSource");
        var destinationCanvas = document.getElementById("myCanvas");
        var canvas1_Data; //used later
        var canvas2_Data; //used later

        function writeSomethingToCanvas(canvas) {
            var ctx = canvas.getContext('2d');
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(19, 19);
            ctx.moveTo(3, 18);
            ctx.lineTo(17, 5);
            ctx.stroke();
        }

        writeSomethingToCanvas(originalCanvas);

        expect(sources.length).toBe(2);

        composeImages(sources, destinationCanvas).then(function() {
            expect(destinationCanvas.width).toBe(124); //120 + 2 * 2px_spacing
            expect(destinationCanvas.height).toBe(100);

            canvas1_Data = originalCanvas.getContext('2d').getImageData(0, 0, 20, 20).data;
            canvas2_Data = destinationCanvas.getContext('2d').getImageData(0, 80, 20, 20).data;

            expect(matchPixelDataArrays(canvas1_Data, canvas2_Data)).toBe(true);

            pixelData = destinationCanvas.getContext('2d').getImageData(24 + 10, 10, 1, 1).data;
            expect(matchPixelColor(pixelData, 255, 0, 0, 255)).toBe(true);

            pixelData = destinationCanvas.getContext('2d').getImageData(24 + 30, 40, 1, 1).data;
            expect(matchPixelColor(pixelData, 0, 255, 0, 255)).toBe(true);

            pixelData = destinationCanvas.getContext('2d').getImageData(24 + 50, 70, 1, 1).data;
            expect(matchPixelColor(pixelData, 0, 0, 255, 255)).toBe(true);

            done();
        }, null);
    });

    it('should call composeImages on two canvases', function (done) {
        var sources = placeholder.html(`<div id="test-container" style="width: 600px;height: 400px">
        <canvas class="imgsrc" id="canvasSource1" width="20" height="20" title="canvasSource1"></canvas>
        <canvas class="imgsrc" id="canvasSource2" width="20" height="20" title="canvasSource2"></canvas>
        </div>
        <canvas id="myCanvas" width="30" height="15" style="border:1px solid #d3d3d3;"></canvas>
        `).find('.imgsrc').toArray();

        var originalCanvas1 = document.getElementById("canvasSource1");
        var originalCanvas2 = document.getElementById("canvasSource2");
        var destinationCanvas = document.getElementById("myCanvas");
        var canvas1_Data; //used later
        var canvas2_Data; //used later
        var canvas3_Data; //used later

        function writeSomethingToCanvas(canvas, color) {
            var ctx = canvas.getContext('2d');
            ctx.rect(0, 0, 20, 20);
            ctx.fillStyle = color;
            ctx.fill();
        }

        writeSomethingToCanvas(originalCanvas1, "#FF0000");
        writeSomethingToCanvas(originalCanvas2, "#00FF00");

        expect(sources.length).toBe(2);

        composeImages(sources, destinationCanvas).then(function() {
            expect(destinationCanvas.width).toBe(44); //2 * 20 + 2 * spacing
            expect(destinationCanvas.height).toBe(20);

            canvas1_Data = originalCanvas1.getContext('2d').getImageData(0, 0, 20, 20).data;
            canvas3_Data = destinationCanvas.getContext('2d').getImageData(0, 0, 20, 20).data;
            expect(matchPixelDataArrays(canvas1_Data, canvas3_Data)).toBe(true);

            canvas2_Data = originalCanvas2.getContext('2d').getImageData(0, 0, 20, 20).data;
            canvas3_Data = destinationCanvas.getContext('2d').getImageData(20 + 4, 0, 20, 20).data;

            expect(matchPixelDataArrays(canvas2_Data, canvas3_Data)).toBe(true);

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
