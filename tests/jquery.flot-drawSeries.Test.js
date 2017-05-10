/* eslint-disable */
/* global $, describe, it, xit, xdescribe, after, afterEach, expect*/

describe('drawSeries', function() {

    describe('drawSeriesLines', function() {
        var minx = 0, maxx = 200, miny = 0, maxy = 100,
            series, ctx, plotWidth, plotHeight, plotOffset,
            drawSeriesLines = jQuery.plot.drawSeries.drawSeriesLines;

        beforeEach(function() {
            series = {
                lines: {
                    lineWidth: 1
                },
                datapoints: {
                    format: null,
                    points: null,
                    pointsize: 2
                },
                xaxis: {
                    min: minx,
                    max: maxx,
                    p2c: function(p) { return p; }
                },
                yaxis: {
                    min: miny,
                    max: maxy,
                    p2c: function(p) { return p; }
                }
            };
            ctx = setFixtures('<div id="test-container" style="width: 200px;height: 100px;border-style: solid;border-width: 1px"><canvas id="theCanvas" style="width: 100%; height: 100%" /></div>')
                .find('#theCanvas')[0]
                .getContext('2d');
            plotWidth = 200;
            plotHeight = 100;
            plotOffset = { top: 0, left: 0 };
        });

        it('should draw nothing when the values are null', function () {
            series.datapoints.points = [null, null, null, null];

            spyOn(ctx, 'moveTo').and.callThrough();
            spyOn(ctx, 'lineTo').and.callThrough();

            drawSeriesLines(series, ctx, plotOffset, plotWidth, plotHeight, null, getColorOrGradientMock);

            expect(ctx.moveTo).not.toHaveBeenCalled();
            expect(ctx.lineTo).not.toHaveBeenCalled();
        });

        it('should draw lines for values', function () {
            series.datapoints.points = [0, 0, 150, 25, 50, 75, 200, 100];

            spyOn(ctx, 'lineTo').and.callThrough();

            drawSeriesLines(series, ctx, plotOffset, plotWidth, plotHeight, null, getColorOrGradientMock);

            expect(ctx.lineTo).toHaveBeenCalled();
        });

        it('should decimate when a decimate function is provided', function () {
            series.datapoints.points = [-1, -1, 0, 0, 1, 1, 2, 2, 3, 3];
            series.decimate = function() {
                return [0, 0, 1, 1];
            };

            spyOn(ctx, 'moveTo').and.callThrough();
            spyOn(ctx, 'lineTo').and.callThrough();

            drawSeriesLines(series, ctx, plotOffset, plotWidth, plotHeight, null, getColorOrGradientMock);

            expect(ctx.moveTo).toHaveBeenCalledWith(0, 0);
            expect(ctx.lineTo).toHaveBeenCalledWith(1, 1);
        });

        it('should clip the lines when the points are outside the range of the axes', function () {
            series.datapoints.points = [
                minx - 8, 50,
                maxx + 8, 50,
                100, miny - 8,
                100, maxy + 8,
                minx - 8, 50];

            spyOn(ctx, 'moveTo').and.callThrough();
            spyOn(ctx, 'lineTo').and.callThrough();

            drawSeriesLines(series, ctx, plotOffset, plotWidth, plotHeight, null, getColorOrGradientMock);

            validatePointsAreInsideTheAxisRanges(
                ctx.moveTo.calls.allArgs().concat(
                    ctx.lineTo.calls.allArgs()));
        });

        it('should clip the lines and the fill area when the points are outside the range of the axes', function () {
            series.datapoints.points = [
                minx - 8, 50,
                maxx + 8, 50,
                100, miny - 8,
                100, maxy + 8,
                minx - 8, 50];
            series.lines.fill = true;
            series.lines.fillColor = 'rgb(200, 200, 200)';

            spyOn(ctx, 'moveTo').and.callThrough();
            spyOn(ctx, 'lineTo').and.callThrough();

            drawSeriesLines(series, ctx, plotOffset, plotWidth, plotHeight, null, getColorOrGradientMock);

            validatePointsAreInsideTheAxisRanges(
                ctx.moveTo.calls.allArgs().concat(
                    ctx.lineTo.calls.allArgs()));
        });


        function validatePointsAreInsideTheAxisRanges(points) {
            points.forEach(function(point) {
                var x = point[0], y = point[1];
                expect(minx <= x && x <= maxx).toBe(true);
                expect(miny <= y && y <= maxy).toBe(true);
            });
        }

    });

    describe('drawSeriesPoints', function() {
        var minx = 0, maxx = 200, miny = 0, maxy = 100,
            series, ctx, plotWidth, plotHeight, plotOffset,
            drawSeriesPoints = jQuery.plot.drawSeries.drawSeriesPoints;

        beforeEach(function() {
            series = {
                points: {
                    show: true,
                    symbol: 'circle',
                    radius: 5
                },
                datapoints: {
                    format: null,
                    points: null,
                    pointsize: 2
                },
                xaxis: {
                    min: minx,
                    max: maxx,
                    p2c: function(p) { return p; }
                },
                yaxis: {
                    min: miny,
                    max: maxy,
                    p2c: function(p) { return p; }
                }
            };
            ctx = setFixtures('<div id="test-container" style="width: 200px;height: 100px;border-style: solid;border-width: 1px"><canvas id="theCanvas" style="width: 100%; height: 100%" /></div>')
                .find('#theCanvas')[0]
                .getContext('2d');
            plotWidth = 200;
            plotHeight = 100;
            plotOffset = { top: 0, left: 0 };
        });

        it('should draw nothing when the values are null', function () {
            series.datapoints.points = [null, null, null, null];

            spyOn(ctx, 'moveTo').and.callThrough();
            spyOn(ctx, 'lineTo').and.callThrough();
            spyOn(ctx, 'fill').and.callThrough();
            spyOn(ctx, 'stroke').and.callThrough();

            drawSeriesPoints(series, ctx, plotOffset, plotWidth, plotHeight, drawSymbolMock, getColorOrGradientMock);

            expect(ctx.moveTo).not.toHaveBeenCalled();
            expect(ctx.lineTo).not.toHaveBeenCalled();
            expect(ctx.fill).not.toHaveBeenCalled();
            expect(ctx.stroke).not.toHaveBeenCalled();
        });

        it('should draw circles for values', function () {
            series.datapoints.points = [0, 0, 150, 25, 50, 75, 200, 100];

            spyOn(ctx, 'arc').and.callThrough();

            drawSeriesPoints(series, ctx, plotOffset, plotWidth, plotHeight, drawSymbolMock, getColorOrGradientMock);

            expect(ctx.arc).toHaveBeenCalled();
        });

        it('should draw custom symbols given by name for values', function () {
            series.points.symbol = 'dollar';
            series.datapoints.points = [0, 0, 150, 25, 50, 75, 200, 100];

            spyOn(drawSymbolMock, 'dollar').and.callThrough();

            drawSeriesPoints(series, ctx, plotOffset, plotWidth, plotHeight, drawSymbolMock, getColorOrGradientMock);

            expect(drawSymbolMock.dollar).toHaveBeenCalled();
        });

        it('should draw custom symbols given by function for values', function () {
            series.points.symbol = 'dollar';
            series.datapoints.points = [0, 0, 150, 25, 50, 75, 200, 100];

            spyOn(drawSymbolMock, 'dollar').and.callThrough();

            drawSeriesPoints(series, ctx, plotOffset, plotWidth, plotHeight, drawSymbolMock['dollar'], getColorOrGradientMock);

            expect(drawSymbolMock.dollar).toHaveBeenCalled();
        });

        var drawSymbolMock = {
            'dollar': function (ctx, x, y, radius, shadow) {
                ctx.strokeText('$', x, y);
            }
        }

    });

    function getColorOrGradientMock(spec, bottom, top, defaultColor) {
        if (typeof spec === 'string') {
            return spec;
        } else {
            throw 'test case not supported by the getColorOrGradientMock';
        }
    }

});
