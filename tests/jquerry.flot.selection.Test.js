/* eslint-disable */
/* global $, describe, it, xit, xdescribe, after, afterEach, expect*/

describe("flot selection plugin", function () {
    var placeholder, plot;
	var options;

    // this function converts the selection ranges to axes offsets
    var applySelection = function (axis, selection) {
        var opts = axis.options,
            offsetBelow = selection.from - axis.min,
            offsetAbove = selection.to - axis.max;

        if(opts.offset) {
            opts.offset.below += offsetBelow;
            opts.offset.above += offsetAbove;
        } else {
            opts.offset = {above: offsetAbove, below: offsetBelow};
        }
    };

    beforeEach(function () {
        placeholder = setFixtures('<div id="test-container" style="width: 600px;height: 400px">')
            .find('#test-container');

        options = {
            selection: {
                mode: "xy"
            }
        };

        // this is done in graph-tools
        $(placeholder).bind("plotselected", function (event, ranges) {
            $.each(plot.getXAxes(), function(_, axis) {
                applySelection(axis, ranges.xaxis);
            });

            $.each(plot.getYAxes(), function(_, axis) {
                applySelection(axis, ranges.yaxis);
            });

            plot.setupGrid();
            plot.draw();
            plot.clearSelection();
		});

        $(placeholder).bind("plotunselected", function (event) {
			$("#selection").text("");
		});
    });

    it('provides a setSelection, clearSelection, getSelection functions', function () {
        plot = $.plot(placeholder, [
            []
        ], options);

        expect(typeof plot.setSelection).toBe('function');
        expect(typeof plot.getSelection).toBe('function');
        expect(typeof plot.clearSelection).toBe('function');
    });

    describe('setSelection', function () {
        it('uses the provided amount for all autoscale options', function () {
            var xaxis, yaxis;
            var range = {xaxis: {from: 25, to: 75}, yaxis: {from: 25, to: 75}};

            ['none', 'loose', 'exact'].forEach(function(autoscale) {
                options.xaxis = {autoscale: autoscale, min: 0, max: 100};
                options.yaxis = {autoscale: autoscale, min: 0, max: 100};

                plot = $.plot(placeholder, [[[25, 25], [75, 75]]], options);
                
                plot.setSelection(range);

                xaxis = plot.getXAxes()[0];
                yaxis = plot.getYAxes()[0];

                expect(xaxis.min).toBe(25);
                expect(xaxis.max).toBe(75);
                expect(yaxis.min).toBe(25);
                expect(yaxis.max).toBe(75);

            });
        });

        it('can be disabled per axis', function () {
            var xaxis, yaxis;
            var range = {xaxis: {from: 25, to: 75}, yaxis: {from: 25, to: 75}};

            ['x', 'y', 'xy', ''].forEach(function(direction) {
                options.xaxis = {autoscale: 'none', min: 0, max: 100};
                options.yaxis = {autoscale: 'none', min: 0, max: 100};
                options.selection.mode = direction;

                plot = $.plot(placeholder, [[[25, 25], [75, 75]]], options);

                plot.setSelection(range);

                xaxis = plot.getXAxes()[0];
                yaxis = plot.getYAxes()[0];

                switch(direction) {
                    case 'x':
                        expect(xaxis.min).toBe(25);
                        expect(xaxis.max).toBe(75);
                        expect(yaxis.min).toBe(0);
                        expect(yaxis.max).toBe(100);
                        break;
                    case 'y':
                        expect(yaxis.min).toBe(25);
                        expect(yaxis.max).toBe(75);
                        expect(xaxis.min).toBe(0);
                        expect(xaxis.max).toBe(100);
                        break;
                    default:
                        expect(yaxis.min).toBe(25);
                        expect(yaxis.max).toBe(75);
                        expect(xaxis.min).toBe(25);
                        expect(xaxis.max).toBe(75);
                        break;
                }
            });           
        });

        it ('works as expected after a zoom action', function () {
            var xaxis, yaxis;
            var range = {xaxis: {from: -25, to: 125}, yaxis: {from: -25, to: 125}};
            options.xaxis = {autoscale: 'none', min: 0, max: 100};
            options.yaxis = {autoscale: 'none', min: 0, max: 100};
            options.zoom = {interactive: true, amount: 10};

            plot = $.plot(placeholder, [[[25, 25], [75, 75]]], options);

            // zoom out to (-50, 150) before applying selection
            plot.zoomOut({ amount: 10 });
            
            plot.setSelection(range);

            xaxis = plot.getXAxes()[0];
            yaxis = plot.getYAxes()[0];

            expect(yaxis.min).toBeCloseTo(-25, 7);
            expect(yaxis.max).toBeCloseTo(125, 7);
            expect(xaxis.min).toBeCloseTo(-25, 7);
            expect(xaxis.max).toBeCloseTo(125, 7);
        });

        it ('works as expected before a zoom action', function () {
            var xaxis, yaxis;
            var range = {xaxis: {from: 25, to: 75}, yaxis: {from: 25, to: 75}};
            options.xaxis = {autoscale: 'none', min: 0, max: 100};
            options.yaxis = {autoscale: 'none', min: 0, max: 100};
            options.zoom = {interactive: true, amount: 10};

            plot = $.plot(placeholder, [[[25, 25], [75, 75]]], options);

            plot.setSelection(range);
            plot.zoom({ amount: -5 });


            xaxis = plot.getXAxes()[0];
            yaxis = plot.getYAxes()[0];

            expect(yaxis.min).toBeCloseTo(45, 7);
            expect(yaxis.max).toBeCloseTo(55, 7);
            expect(xaxis.min).toBeCloseTo(45, 7);
            expect(xaxis.max).toBeCloseTo(55, 7);
        });
    });
});