/* eslint-disable */
/* global $, describe, it, xit, xdescribe, after, afterEach, expect*/

describe("composeImages", function() {
    var placeholder, plot;
    var composeImages = $.plot.composeImages;

    beforeEach(function() {
        placeholder = setFixtures('<div id="test-container" style="width: 600px;height: 400px; padding: 0px margin: 0px; border: 0px; font-size:0pt; font-family:sans-serif; line-height:0px;">')
            .find('#test-container');
    });

    it('should call composeImages on an empty array of sources, so the destination canvas should stay unmodified', function (done) {
        var sources = placeholder.html('<div id="test-container" style="width: 600px;height: 400px">' +
        '</div>' +
        '<canvas id="myCanvas" width="300" height="150" style="border:1px solid #d3d3d3;"></canvas>'
        ).find('svg').toArray();

        var destinationCanvas = document.getElementById("myCanvas");
        var pixelData; //used later

        function drawCircleOnToCanvas(canvas) {
            var ctx = canvas.getContext('2d');
            ctx.arc(80, 10, 5, 0, 2 * Math.PI);
            ctx.fill();
        }

        drawCircleOnToCanvas(destinationCanvas); //make sure composeImages won't modify this content

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
        var sources = placeholder.html('<div id="test-container" style="width: 600px;height: 400px">' +
        '<svg id="svgSource" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" width="100" height="100" title="svg">' +
            '<circle id="c1" cx="10" cy="10" r="5" style="fill:red"/>' +
            '<circle id="c2" cx="30" cy="40" r="7" style="fill:#00FF00"/>' +
            '<circle id="c3" cx="50" cy="70" r="9" style="fill:blue"/>' +
        '</svg>' +
        '</div>' +
        '<canvas id="myCanvas" width="300" height="150" style="border:1px solid #d3d3d3;"></canvas>'
    ).find('svg').toArray();

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
        var sources = placeholder.html('<div id="test-container" style="width: 600px;height: 400px">' +
        '<svg id="svgSource" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" width="100" height="100" title="svg">' +
            '<circle id="c1" cx="10" cy="10" r="5" style="fill:red"/>' +
            '<circle id="c2" cx="30" cy="40" r="7" style="fill:#00FF00"/>' +
            '<circle id="c3" cx="50" cy="70" r="9" style="fill:blue"/>' +
        '</svg>' +
        '<svg id="svgSource2" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" width="100" height="100" title="svg2">' +
            '<circle id="c1" cx="10" cy="10" r="5" style="fill:red"/>' +
            '<circle id="c2" cx="30" cy="40" r="7" style="fill:#00FF00"/>' +
            '<circle id="c3" cx="50" cy="70" r="9" style="fill:blue"/>' +
        '</svg>' +
        '</div>' +
        '<canvas id="myCanvas" width="300" height="150" style="border:1px solid #d3d3d3;"></canvas>'
        ).find('svg').toArray();

        var destinationCanvas = document.getElementById("myCanvas");
        var pixelData; //used later

        composeImages(sources, destinationCanvas).then(function() {
            expect(destinationCanvas.width).toBe(200); //204 - //200 + 2 * 2px_spacing
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
        var sources = placeholder.html('<div id="test-container" style="width: 600px;height: 400px">' +
        '<svg id="svgSource" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" width="100" height="100" title="svg">' +
            '<circle id="c1" cx="10" cy="10" r="5" style="fill:#FF0000"/>' +
            '<circle id="c2" cx="30" cy="40" r="7" style="fill:#00FF00"/>' +
            '<circle id="c3" cx="50" cy="70" r="9" style="fill:#0000FF"/>' +
        '</svg>' +
        '<br>' +
        '<svg id="svgSource2" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" width="100" height="100" title="svg2">' +
            '<circle id="c1" cx="10" cy="10" r="5" style="fill:#FF0000"/>' +
            '<circle id="c2" cx="30" cy="40" r="7" style="fill:#00FF00"/>' +
            '<circle id="c3" cx="50" cy="70" r="9" style="fill:#0000FF"/>' +
        '</svg>' +
        '</div>' +
        '<canvas id="myCanvas" width="300" height="150" style="border:1px solid #d3d3d3;"></canvas>'
        ).find('svg').toArray();

        var destinationCanvas = document.getElementById("myCanvas");
        var pixelData; //used later

        composeImages(sources, destinationCanvas).then(function() {
            expect(destinationCanvas.width).toBe(100);
            expect(destinationCanvas.height).toBe(200);  //204 - //200 + 2 * 2px_spacing

            pixelData = destinationCanvas.getContext('2d').getImageData(10, 10, 1, 1).data;
            expect(matchPixelColor(pixelData, 255, 0, 0, 255)).toBe(true);

            pixelData = destinationCanvas.getContext('2d').getImageData(30, 40, 1, 1).data;
            expect(matchPixelColor(pixelData, 0, 255, 0, 255)).toBe(true);

            pixelData = destinationCanvas.getContext('2d').getImageData(50, 70, 1, 1).data;
            expect(matchPixelColor(pixelData, 0, 0, 255, 255)).toBe(true);

            pixelData = destinationCanvas.getContext('2d').getImageData(10, 110 + 0, 1, 1).data; //110 + 4
            expect(matchPixelColor(pixelData, 255, 0, 0, 255)).toBe(true);

            pixelData = destinationCanvas.getContext('2d').getImageData(30, 140 + 0, 1, 1).data; //140 + 4
            expect(matchPixelColor(pixelData, 0, 255, 0, 255)).toBe(true);

            pixelData = destinationCanvas.getContext('2d').getImageData(50, 170 + 0, 1, 1).data; //170 + 4
            expect(matchPixelColor(pixelData, 0, 0, 255, 255)).toBe(true);

            done();
        }, null);
    });

    it('should call composeImages on three identical SVGs, placed in an L-shape', function (done) {
        var sources = placeholder.html('<div id="test-container" style="width: 600px;height: 400px">' +
        '<svg id="svgSource1" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" width="100" height="100" title="svg1">' +
            '<circle id="c1" cx="10" cy="10" r="5" style="fill:red"/>' +
            '<circle id="c2" cx="30" cy="40" r="7" style="fill:#00FF00"/>' +
            '<circle id="c3" cx="50" cy="70" r="9" style="fill:blue"/>' +
        '</svg>' +
        '<svg id="svgSource2" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" width="100" height="100" title="svg2">' +
            '<circle id="c1" cx="10" cy="10" r="5" style="fill:red"/>' +
            '<circle id="c2" cx="30" cy="40" r="7" style="fill:#00FF00"/>' +
            '<circle id="c3" cx="50" cy="70" r="9" style="fill:blue"/>' +
        '</svg>' +
        '<br>' +
        '<svg id="svgSource3" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" width="100" height="100" title="svg3">' +
            '<circle id="c1" cx="10" cy="10" r="5" style="fill:red"/>' +
            '<circle id="c2" cx="30" cy="40" r="7" style="fill:#00FF00"/>' +
            '<circle id="c3" cx="50" cy="70" r="9" style="fill:blue"/>' +
        '</svg>' +
        '</div>' +
        '<canvas id="myCanvas" width="300" height="150" style="border:1px solid #d3d3d3;"></canvas>'
        ).find('svg').toArray();

        var destinationCanvas = document.getElementById("myCanvas");
        var pixelData; //used later

        composeImages(sources, destinationCanvas).then(function() {
            expect(destinationCanvas.width).toBe(200);  //204 - //200 + 2 * 2px_spacing
            expect(destinationCanvas.height).toBe(200);  //204 - //200 + 2 * 2px_spacing

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

            pixelData = destinationCanvas.getContext('2d').getImageData(10, 110 + 0, 1, 1).data; //110 + 4
            expect(matchPixelColor(pixelData, 255, 0, 0, 255)).toBe(true);

            pixelData = destinationCanvas.getContext('2d').getImageData(30, 140 + 0, 1, 1).data; //140 + 4
            expect(matchPixelColor(pixelData, 0, 255, 0, 255)).toBe(true);

            pixelData = destinationCanvas.getContext('2d').getImageData(50, 170 + 0, 1, 1).data; //170 + 4
            expect(matchPixelColor(pixelData, 0, 0, 255, 255)).toBe(true);

            done();
        }, null);
    });

    it('should call composeImages on one canvas as a source', function (done) {
        var sources = placeholder.html('<div id="test-container" style="width: 600px;height: 400px">' +
        '<canvas id="canvasSource" width="20" height="20" title="canvasSource"></canvas>' +
        '</div>' +
        '<canvas id="myCanvas" width="30" height="15" style="border:1px solid #d3d3d3;"></canvas>'
        ).find('#canvasSource').toArray();

        var originalCanvas = document.getElementById("canvasSource");
        var destinationCanvas = document.getElementById("myCanvas");
        var canvas1_Data; //used later
        var canvas2_Data; //used later

        drawSomeLinesOnCanvas(originalCanvas);

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
        var sources = placeholder.html('<div id="test-container" style="width: 600px;height: 400px">' +
        '<canvas class="imgsrc" id="canvasSource" width="20" height="20" title="canvasSource"></canvas>' +
        '<svg class="imgsrc" id="svgSource1" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" width="100" height="100" title="svg1">' +
            '<circle id="c1" cx="10" cy="10" r="5" style="fill:red"/>' +
            '<circle id="c2" cx="30" cy="40" r="7" style="fill:#00FF00"/>' +
            '<circle id="c3" cx="50" cy="70" r="9" style="fill:blue"/>' +
        '</svg>' +
        '</div>' +
        '<canvas id="myCanvas" width="30" height="15" style="border:1px solid #d3d3d3;"></canvas>'
        ).find('.imgsrc').toArray();

        var originalCanvas = document.getElementById("canvasSource");
        var destinationCanvas = document.getElementById("myCanvas");
        var canvas1_Data; //used later
        var canvas2_Data; //used later

        drawSomeLinesOnCanvas(originalCanvas);

        expect(sources.length).toBe(2);

        composeImages(sources, destinationCanvas).then(function() {
            expect(destinationCanvas.width).toBe(120); //124 - //120 + 2 * 2px_spacing
            expect(destinationCanvas.height).toBe(100);

            canvas1_Data = originalCanvas.getContext('2d').getImageData(0, 0, 20, 20).data;
            canvas2_Data = destinationCanvas.getContext('2d').getImageData(0, 80, 20, 20).data;

            expect(matchPixelDataArrays(canvas1_Data, canvas2_Data)).toBe(true);

            pixelData = destinationCanvas.getContext('2d').getImageData(20 + 10, 10, 1, 1).data; //24 + 10
            expect(matchPixelColor(pixelData, 255, 0, 0, 255)).toBe(true);

            pixelData = destinationCanvas.getContext('2d').getImageData(20 + 30, 40, 1, 1).data; //24 + 30
            expect(matchPixelColor(pixelData, 0, 255, 0, 255)).toBe(true);

            pixelData = destinationCanvas.getContext('2d').getImageData(20 + 50, 70, 1, 1).data; //24 + 50
            expect(matchPixelColor(pixelData, 0, 0, 255, 255)).toBe(true);

            done();
        }, null);
    });

    it('should call composeImages on two canvases', function (done) {
        var sources = placeholder.html('<div id="test-container" style="width: 600px;height: 400px">' +
        '<canvas class="imgsrc" id="canvasSource1" width="20" height="20" title="canvasSource1"></canvas>' +
        '<canvas class="imgsrc" id="canvasSource2" width="20" height="20" title="canvasSource2"></canvas>' +
        '</div>' +
        '<canvas id="myCanvas" width="30" height="15" style="border:1px solid #d3d3d3;"></canvas>'
        ).find('.imgsrc').toArray();

        var originalCanvas1 = document.getElementById("canvasSource1");
        var originalCanvas2 = document.getElementById("canvasSource2");
        var destinationCanvas = document.getElementById("myCanvas");
        var canvas1_Data; //used later
        var canvas2_Data; //used later
        var canvas3_Data; //used later

        drawARectangleOnCanvas(originalCanvas1, "#FF0000");
        drawARectangleOnCanvas(originalCanvas2, "#00FF00");

        expect(sources.length).toBe(2);

        composeImages(sources, destinationCanvas).then(function() {
            expect(destinationCanvas.width).toBe(40); //44 - //2 * 20 + 2 * spacing
            expect(destinationCanvas.height).toBe(20);

            canvas1_Data = originalCanvas1.getContext('2d').getImageData(0, 0, 20, 20).data;
            canvas3_Data = destinationCanvas.getContext('2d').getImageData(0, 0, 20, 20).data;
            expect(matchPixelDataArrays(canvas1_Data, canvas3_Data)).toBe(true);

            canvas2_Data = originalCanvas2.getContext('2d').getImageData(0, 0, 20, 20).data;
            canvas3_Data = destinationCanvas.getContext('2d').getImageData(20 + 0, 0, 20, 20).data; //20 + 4

            expect(matchPixelDataArrays(canvas2_Data, canvas3_Data)).toBe(true);

            done();
        }, null);
    });

    it('should call composeImages on two partially overlapped canvases', function (done) {
        var sources = placeholder.html('<style type="text/css">' +
        '#canvasSource2 {position:relative; left:-10px;}' +
        '</style>' +
        '<div id="test-container" style="width: 600px;height: 400px">' +
        '<canvas class="imgsrc" id="canvasSource1" width="20" height="20" title="canvasSource1"></canvas>' +
        '<canvas class="imgsrc" id="canvasSource2" width="20" height="20" title="canvasSource2"></canvas>' +
        '</div>' +
        '<canvas id="myCanvas" width="30" height="15" style="border:1px solid #d3d3d3;"></canvas>'
        ).find('.imgsrc').toArray();

        var originalCanvas1 = document.getElementById("canvasSource1");
        var originalCanvas2 = document.getElementById("canvasSource2");
        var destinationCanvas = document.getElementById("myCanvas");
        var canvas1_Data; //used later
        var canvas2_Data; //used later
        var canvas3_Data; //used later

        drawARectangleOnCanvas(originalCanvas1, "#FF0000");
        drawARectangleOnCanvas(originalCanvas2, "#00FF00");

        expect(sources.length).toBe(2);

        composeImages(sources, destinationCanvas).then(function() {
            expect(destinationCanvas.width).toBe(30); //34 - //2 * 20 + 2 * spacing - 10    //10px is the offset of the second canvas, defined in style
            expect(destinationCanvas.height).toBe(20);

            canvas1_Data = originalCanvas1.getContext('2d').getImageData(0, 0, 10, 20).data; //14
            canvas3_Data = destinationCanvas.getContext('2d').getImageData(0, 0, 10, 20).data; //14
            expect(matchPixelDataArrays(canvas1_Data, canvas3_Data)).toBe(true);

            canvas2_Data = originalCanvas2.getContext('2d').getImageData(0, 0, 20, 20).data;
            canvas3_Data = destinationCanvas.getContext('2d').getImageData(20 + 0 - 10, 0, 20, 20).data; //20 + 4 - 10
            expect(matchPixelDataArrays(canvas2_Data, canvas3_Data)).toBe(true);

            done();
        }, null);
    });

    it('should call composeImages on two partially overlapped canvases. Same as above test, but the two canvases have the opposite Z order.', function (done) {
        var sources = placeholder.html('<style type="text/css">' +
        '#canvasSource2 {position:relative; left:-10px;}' +
        '</style>' +
        '<div id="test-container" style="width: 600px;height: 400px">' +
        '<canvas class="imgsrc" id="canvasSource1" width="20" height="20" title="canvasSource1"></canvas>' +
        '<canvas class="imgsrc" id="canvasSource2" width="20" height="20" title="canvasSource2"></canvas>' +
        '</div>' +
        '<canvas id="myCanvas" width="30" height="15" style="border:1px solid #d3d3d3;"></canvas>'
        ).find('.imgsrc').toArray();

        var originalCanvas1 = document.getElementById("canvasSource1");
        var originalCanvas2 = document.getElementById("canvasSource2");
        var destinationCanvas = document.getElementById("myCanvas");
        var canvas1_Data; //used later
        var canvas2_Data; //used later
        var canvas3_Data; //used later

        drawARectangleOnCanvas(originalCanvas1, "#FF0000");
        drawARectangleOnCanvas(originalCanvas2, "#00FF00");

        sources.reverse(); //make sure the images are composed in the inverse order
        expect(sources.length).toBe(2);

        composeImages(sources, destinationCanvas).then(function() {
            expect(destinationCanvas.width).toBe(30); //34 - //2 * 20 + 2 * spacing - 10    //10px is the offset of the second canvas, defined in style
            expect(destinationCanvas.height).toBe(20);

            canvas1_Data = originalCanvas1.getContext('2d').getImageData(0, 0, 20, 20).data;
            canvas3_Data = destinationCanvas.getContext('2d').getImageData(0, 0, 20, 20).data;
            expect(matchPixelDataArrays(canvas1_Data, canvas3_Data)).toBe(true);

            canvas2_Data = originalCanvas2.getContext('2d').getImageData(0, 0, 20 - 10 + 0, 20).data; //20 - 10 + 4
            canvas3_Data = destinationCanvas.getContext('2d').getImageData(20, 0, 20 - 10 + 0, 20).data; //20 - 10 + 4
            expect(matchPixelDataArrays(canvas2_Data, canvas3_Data)).toBe(true);

            done();
        }, null);
    });

    it('should call composeImages on two separate canvases, where one canvas is outside of view area', function (done) {
        var sources = placeholder.html('<style type="text/css">' +
        '#canvasSource2 {position:relative; left:-100px;}' +
        '</style>' +
        '<div id="test-container" style="width: 600px;height: 400px">' +
        '<canvas class="imgsrc" id="canvasSource1" width="20" height="20" title="canvasSource1"></canvas>' +
        '<canvas class="imgsrc" id="canvasSource2" width="20" height="20" title="canvasSource2"></canvas>' +
        '</div>' +
        '<canvas id="myCanvas" width="30" height="15" style="border:1px solid #d3d3d3;"></canvas>'
        ).find('.imgsrc').toArray();

        var originalCanvas1 = document.getElementById("canvasSource1");
        var originalCanvas2 = document.getElementById("canvasSource2");
        var destinationCanvas = document.getElementById("myCanvas");
        var canvas1_Data; //used later
        var canvas2_Data; //used later
        var canvas3_Data; //used later

        drawARectangleOnCanvas(originalCanvas1, "#FF0000");
        drawARectangleOnCanvas(originalCanvas2, "#00FF00");

        expect(sources.length).toBe(2);

        composeImages(sources, destinationCanvas).then(function() {
            expect(destinationCanvas.width).toBe(100 - 0); //100 - 4
            expect(destinationCanvas.height).toBe(20);

            canvas1_Data = originalCanvas1.getContext('2d').getImageData(0, 0, 20, 20).data;
            canvas3_Data = destinationCanvas.getContext('2d').getImageData(100 - 20 - 0, 0, 20, 20).data; //100 - 20 - 10 + 6
            expect(matchPixelDataArrays(canvas1_Data, canvas3_Data)).toBe(true);

            canvas2_Data = originalCanvas2.getContext('2d').getImageData(0, 0, 20, 20).data;
            canvas3_Data = destinationCanvas.getContext('2d').getImageData(0, 0, 20, 20).data;
            expect(matchPixelDataArrays(canvas2_Data, canvas3_Data)).toBe(true);

            done();
        }, null);
    });

    it('should call composeImages on one canvas and an SVG, which are totally overlapped with transparency', function (done) {
        var sources = placeholder.html('<style type="text/css">' +
        '#canvasSource1 {position:relative; left:-40px; top:-80px;}' +
        'circle { stroke: black; stroke-width: 2px;}' +
        '</style>' +
        '<div id="test-container" style="width: 600px;height: 400px">' +
        '<svg class="imgsrc" id="svgSource1" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" width="100" height="100" title="svg1">' +
            '<circle id="c1" cx="10" cy="10" r="5" style="fill:red"/>' +
            '<circle id="c2" cx="30" cy="40" r="7" style="fill:#00FF00"/>' +
            '<circle id="c3" cx="50" cy="70" r="9" style="fill:blue"/>' +
        '</svg>' +
        '<canvas class="imgsrc" id="canvasSource1" width="20" height="20" title="canvasSource1"></canvas>' +
        '</div>' +
        '<canvas id="myCanvas" width="150" height="150" style="border:1px solid #d3d3d3;"></canvas>'
        ).find('.imgsrc').toArray();

        var originalCanvas1 = document.getElementById("canvasSource1");
        var destinationCanvas = document.getElementById("myCanvas");
        var canvas1_Data; //used later
        var canvas3_Data; //used later
        var pixelData;//used later

        drawARectangleOnCanvas(originalCanvas1, "#FF0000");

        expect(sources.length).toBe(2);

        composeImages(sources, destinationCanvas).then(function() {
            expect(destinationCanvas.width).toBe(100);
            expect(destinationCanvas.height).toBe(100);

            canvas1_Data = originalCanvas1.getContext('2d').getImageData(0, 0, 20, 20).data;
            canvas3_Data = destinationCanvas.getContext('2d').getImageData(100 - 40 + 0, 0, 20, 20).data; //100 - 40 + 4
            expect(matchPixelDataArrays(canvas1_Data, canvas3_Data)).toBe(true);


            pixelData = destinationCanvas.getContext('2d').getImageData(10, 10, 1, 1).data;
            expect(matchPixelColor(pixelData, 255, 0, 0, 255)).toBe(true);

            pixelData = destinationCanvas.getContext('2d').getImageData(30, 40, 1, 1).data;
            expect(matchPixelColor(pixelData, 0, 255, 0, 255)).toBe(true);

            pixelData = destinationCanvas.getContext('2d').getImageData(50, 70, 1, 1).data;
            expect(matchPixelColor(pixelData, 0, 0, 255, 255)).toBe(true);

            done();
        }, null);
    });

    it('should call composeImages on one canvas and an SVG, which are totally overlapped with transparency. The SVG has a different size than the ones from other tests. One component of the SVG is partially outside of the view area.', function (done) {
        var sources = placeholder.html('<style type="text/css">' +
        '#canvasSource1 {position:relative; left:-180px; top:-10px;}' +
        'circle { stroke: black; stroke-width: 4px;}' +
        '</style>' +
        '<div id="test-container" style="width: 600px;height: 400px">' +
        '<svg class="imgsrc" id="svgSource1" viewBox="0 0 250 150" xmlns="http://www.w3.org/2000/svg" width="250" height="150" title="svg1">' +
            '<circle id="c1" cx="230" cy="20" r="15" style="fill:red"/>' +
            '<circle id="c2" cx="175" cy="100" r="25" style="fill:#00FF00"/>' +
            '<circle id="c3" cx="50" cy="130" r="40" style="fill:blue"/>' +
        '</svg>' +
        '<canvas class="imgsrc" id="canvasSource1" width="20" height="20" title="canvasSource1"></canvas>' +
        '</div>' +
        '<canvas id="myCanvas" width="150" height="150" style="border:1px solid #d3d3d3;"></canvas>'
        ).find('.imgsrc').toArray();

        var originalCanvas1 = document.getElementById("canvasSource1");
        var destinationCanvas = document.getElementById("myCanvas");
        var canvas1_Data; //used later
        var canvas3_Data; //used later
        var pixelData;//used later

        drawARectangleOnCanvas(originalCanvas1, "#FF0000");

        expect(sources.length).toBe(2);

        composeImages(sources, destinationCanvas).then(function() {
            expect(destinationCanvas.width).toBe(250);
            expect(destinationCanvas.height).toBe(150);

            canvas1_Data = originalCanvas1.getContext('2d').getImageData(0, 0, 20, 20).data;
            canvas3_Data = destinationCanvas.getContext('2d').getImageData(250 - 180 + 0, 150 - 10 - 20, 20, 20).data; //250 - 180 + 4
            expect(matchPixelDataArrays(canvas1_Data, canvas3_Data)).toBe(true);


            //circle centers
            pixelData = destinationCanvas.getContext('2d').getImageData(230, 20, 1, 1).data;
            expect(matchPixelColor(pixelData, 255, 0, 0, 255)).toBe(true);

            pixelData = destinationCanvas.getContext('2d').getImageData(175, 100, 1, 1).data;
            expect(matchPixelColor(pixelData, 0, 255, 0, 255)).toBe(true);

            pixelData = destinationCanvas.getContext('2d').getImageData(50, 130, 1, 1).data;
            expect(matchPixelColor(pixelData, 0, 0, 255, 255)).toBe(true);

            //other points on circles should match the required colors, because of configured diameters
            pixelData = destinationCanvas.getContext('2d').getImageData(220, 17, 1, 1).data;
            expect(matchPixelColor(pixelData, 255, 0, 0, 255)).toBe(true);

            pixelData = destinationCanvas.getContext('2d').getImageData(190, 114, 1, 1).data;
            expect(matchPixelColor(pixelData, 0, 255, 0, 255)).toBe(true);

            pixelData = destinationCanvas.getContext('2d').getImageData(80, 149, 1, 1).data;
            expect(matchPixelColor(pixelData, 0, 0, 255, 255)).toBe(true);

            //verify a pixel from the circle border, if it comes from a black line (almost black, because of antialiasing), as described in svg style
            pixelData = destinationCanvas.getContext('2d').getImageData(79, 102, 1, 1).data;
            expect(matchPixelColorWithError(pixelData, 0, 0, 0, 255, 15)).toBe(true);

            done();
        }, null);
    });

    it('should call composeImages on one canvas and an SVG, which are totally overlapped with transparency, using external CSS. The SVG has a different size than the ones from other tests. One component of the SVG is partially outside of the view area.', function (done) {
        var sources = placeholder.html('<style type="text/css">' +
        '#canvasSource1 {position:relative; left:-180px; top:-10px;}' +
        '</style>' +
        '<div id="test-container" style="width: 600px;height: 400px">' +
        '<svg class="imgsrc" id="svgSource1" viewBox="0 0 250 150" xmlns="http://www.w3.org/2000/svg" width="250" height="150" title="svg1">' +
            '<circle class="externalCSS" id="c1" cx="230" cy="20" r="15" style="fill:red"/>' +
            '<circle class="externalCSS" id="c2" cx="175" cy="100" r="25" style="fill:#00FF00"/>' +
            '<circle class="externalCSS" id="c3" cx="50" cy="130" r="40" style="fill:blue"/>' +
        '</svg>' +
        '<canvas class="imgsrc" id="canvasSource1" width="20" height="20" title="canvasSource1"></canvas>' +
        '</div>' +
        '<canvas id="myCanvas" width="150" height="150" style="border:1px solid #d3d3d3;"></canvas>'
        ).find('.imgsrc').toArray();

        var originalCanvas1 = document.getElementById("canvasSource1");
        var destinationCanvas = document.getElementById("myCanvas");
        var canvas1_Data; //used later
        var canvas3_Data; //used later
        var pixelData;//used later

        drawARectangleOnCanvas(originalCanvas1, "#FF0000");

        expect(sources.length).toBe(2);

        composeImages(sources, destinationCanvas).then(function() {
            expect(destinationCanvas.width).toBe(250);
            expect(destinationCanvas.height).toBe(150);

            canvas1_Data = originalCanvas1.getContext('2d').getImageData(0, 0, 20, 20).data;
            canvas3_Data = destinationCanvas.getContext('2d').getImageData(250 - 180 + 0, 150 - 10 - 20, 20, 20).data; //250 - 180 + 4
            expect(matchPixelDataArrays(canvas1_Data, canvas3_Data)).toBe(true);


            //circle centers
            pixelData = destinationCanvas.getContext('2d').getImageData(230, 20, 1, 1).data;
            expect(matchPixelColor(pixelData, 255, 0, 0, 255)).toBe(true);

            pixelData = destinationCanvas.getContext('2d').getImageData(175, 100, 1, 1).data;
            expect(matchPixelColor(pixelData, 0, 255, 0, 255)).toBe(true);

            pixelData = destinationCanvas.getContext('2d').getImageData(50, 130, 1, 1).data;
            expect(matchPixelColor(pixelData, 0, 0, 255, 255)).toBe(true);

            //other points on circles should match the required colors, because of configured diameters
            pixelData = destinationCanvas.getContext('2d').getImageData(220, 17, 1, 1).data;
            expect(matchPixelColor(pixelData, 255, 0, 0, 255)).toBe(true);

            pixelData = destinationCanvas.getContext('2d').getImageData(190, 114, 1, 1).data;
            expect(matchPixelColor(pixelData, 0, 255, 0, 255)).toBe(true);

            pixelData = destinationCanvas.getContext('2d').getImageData(80, 149, 1, 1).data;
            expect(matchPixelColor(pixelData, 0, 0, 255, 255)).toBe(true);

            //verify a pixel from the circle border, if it comes from a black line (almost black, because of antialiasing), as described in svg style
            pixelData = destinationCanvas.getContext('2d').getImageData(79, 102, 1, 1).data;
            expect(matchPixelColorWithError(pixelData, 0, 0, 0, 255, 15)).toBe(true);

            done();
        }, null);
    });


    function drawSomeLinesOnCanvas(canvas) {
        var ctx = canvas.getContext('2d');
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(19, 19);
        ctx.moveTo(3, 18);
        ctx.lineTo(17, 5);
        ctx.stroke();
    }

    function drawARectangleOnCanvas(canvas, color) {
        var ctx = canvas.getContext('2d');
        ctx.rect(0, 0, 20, 20);
        ctx.fillStyle = color;
        ctx.fill();
    }

    function matchPixelColor(pixelData, r, g, b, a) {
        return (pixelData[0] === r) && (pixelData[1] === g) && (pixelData[2] === b) && (pixelData[3] === a);
    }

    function matchPixelColorWithError(pixelData, r, g, b, a, err) {
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

});
