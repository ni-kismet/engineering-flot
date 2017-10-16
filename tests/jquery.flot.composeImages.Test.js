/* eslint-disable */
/* global $, describe, it, xit, xdescribe, after, afterEach, expect*/

describe("composeImages", function() {
    var sources, plot;
    var options = {
        series: {
            shadowSize: 0, // don't draw shadows
            lines: { show: false},
            points: { show: true, fill: false, symbol: 'circle' }
        }
    };
    var composeImages = $.plot.composeImages;

    beforeEach(function() {
        sources = setFixtures(`<div id="test-container" style="width: 600px;height: 400px">
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
        <img id="dest">
        `).find('svg').toArray();
    });


    it('should call async', function (done) {
        //var sources = [originalCanvas, originalSVG];
        //var sources = [];
        //var destinationImage = new Image;
        var destinationImage = document.getElementById("myCanvas");

        var ctx = destinationImage.getContext('2d');
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
        composeImages(sources, destinationImage).then(function() {
            /*
            var canvas = document.createElement('canvas');
            canvas.width = destinationImage.width;
            canvas.height = destinationImage.height;
            canvas.getContext('2d').drawImage(destinationImage, 0, 0, destinationImage.width, destinationImage.height);

            //myCanvas
*/
            //var pixelData = canvas.getContext('2d').getImageData(51, 67, 1, 1).data;
            var pixelData = destinationImage.getContext('2d').getImageData(51, 67, 1, 1).data;
/*
            copy();
            var pixelData = c.getContext('2d').getImageData(30, 30, 1, 1).data;
*/
            //expect(pixelData[0]).toBe(0);
            //expect(pixelData[1]).toBe(0);
            //expect(pixelData[2]).toBe(255);
            //expect(pixelData[3]).toBe(255);
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
