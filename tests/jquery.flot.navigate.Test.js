/* global $, describe, it, xit, xdescribe, after, afterEach, expect*/

describe("flot navigate plugin", function () {
    var placeholder, plot;
    var options = {
        xaxes: [{
            autoscale: 'exact'
        }],
        yaxes: [{
            autoscale: 'exact'
        }],
        zoom: {
            interactive: true,
            amount: 10
        },
        pan: {
            interactive: true
        }

    };

    beforeEach(function () {
        placeholder = setFixtures('<div id="test-container" style="width: 600px;height: 400px">')
            .find('#test-container');
    });

    it('provides a zoom, zoomOut, pan, smartPan functions', function () {
        plot = $.plot(placeholder, [
            []
        ], options);

        expect(typeof plot.zoom).toBe('function');
        expect(typeof plot.zoomOut).toBe('function');
        expect(typeof plot.pan).toBe('function');
        expect(typeof plot.smartPan).toBe('function');
    });

    describe('zoom', function () {
        it('uses the provided amount', function () {
            var xaxis, yaxis;

            plot = $.plot(placeholder, [
                [
                    [0, 0],
                    [10, 10]
                ]
            ], options);

            xaxis = plot.getXAxes()[0];
            yaxis = plot.getYAxes()[0];

            plot.zoom({
                amount: 2
            });

            expect(xaxis.min).toBe(2.5);
            expect(xaxis.max).toBe(7.5);
            expect(yaxis.min).toBeCloseTo(2.5, 7);
            expect(yaxis.max).toBeCloseTo(7.5, 7);
        });

        it('uses the amount configured in the plot if none is provided', function () {
            var xaxis, yaxis;

            plot = $.plot(placeholder, [
                [
                    [0, 0],
                    [10, 10]
                ]
            ], options);

            xaxis = plot.getXAxes()[0];
            yaxis = plot.getYAxes()[0];

            plot.zoom();

            expect(xaxis.min).toBe(4.5);
            expect(xaxis.max).toBe(5.5);
            expect(yaxis.min).toBeCloseTo(4.5, 7);
            expect(yaxis.max).toBeCloseTo(5.5, 7);
        });

        it('uses the provided center', function () {
            var xaxis, yaxis;

            plot = $.plot(placeholder, [
                [
                    [0, 0],
                    [10, 10]
                ]
            ], options);


            plot.zoom({
                amount: 2,
                center: {
                    left: 0,
                    top: plot.height()
                }
            });

            xaxis = plot.getXAxes()[0];
            yaxis = plot.getYAxes()[0];

            expect(xaxis.min).toBe(0);
            expect(xaxis.max).toBe(5);
            expect(yaxis.min).toBe(0);
            expect(yaxis.max).toBe(5);
        });

        it ('doesn\'t got to Infinity and beyond', function () {
            var xaxis, yaxis;

            plot = $.plot(placeholder, [
                [
                    [-1, -10e200 ],
                    [1, 10e200]
                ]
            ], options);

            plot.zoom({
                amount: 10e-200
            });

            yaxis = plot.getYAxes()[0];

            expect(yaxis.min).not.toBe(-Infinity);
            expect(yaxis.max).not.toBe(Infinity);
        });
    });

    describe('zoomOut', function () {
        it('uses the provided amount', function () {
            var xaxis, yaxis;

            plot = $.plot(placeholder, [
                [
                    [0, 0],
                    [10, 10]
                ]
            ], options);

            xaxis = plot.getXAxes()[0];
            yaxis = plot.getYAxes()[0];

            plot.zoomOut({
                amount: 0.5
            });

            expect(xaxis.min).toBe(2.5);
            expect(xaxis.max).toBe(7.5);
            expect(yaxis.min).toBeCloseTo(2.5, 7);
            expect(yaxis.max).toBeCloseTo(7.5, 7);
        });

        it('uses the amount configured in the plot if none is provided', function () {
            var xaxis, yaxis;

            plot = $.plot(placeholder, [
                [
                    [0, 0],
                    [10, 10]
                ]
            ], options);

            xaxis = plot.getXAxes()[0];
            yaxis = plot.getYAxes()[0];

            plot.zoom();

            expect(xaxis.min).toBe(4.5);
            expect(xaxis.max).toBe(5.5);
            expect(yaxis.min).toBeCloseTo(4.5, 7);
            expect(yaxis.max).toBeCloseTo(5.5, 7);
        });

        it('uses the provided center', function () {
            var xaxis, yaxis;

            plot = $.plot(placeholder, [
                [
                    [0, 0],
                    [10, 10]
                ]
            ], options);


            plot.zoomOut({
                amount: 0.5,
                center: {
                    left: 0,
                    top: plot.height()
                }
            });

            xaxis = plot.getXAxes()[0];
            yaxis = plot.getYAxes()[0];

            expect(xaxis.min).toBe(0);
            expect(xaxis.max).toBe(5);
            expect(yaxis.min).toBe(0);
            expect(yaxis.max).toBe(5);
        });

        it ('doesn\'t got to Infinity and beyond', function () {
            var xaxis, yaxis;

            plot = $.plot(placeholder, [
                [
                    [-1, -10e200 ],
                    [1, 10e200]
                ]
            ], options);

            plot.zoomOut({
                amount: 10e200
            });

            yaxis = plot.getYAxes()[0];

            expect(yaxis.min).not.toBe(-Infinity);
            expect(yaxis.max).not.toBe(Infinity);
        });

        it ('can be disabled per axis', function () {
            var xaxis, yaxis;

            plot = $.plot(placeholder, [
                [
                    [0, 0],
                    [10, 10]
                ]
            ], options);

            xaxis = plot.getXAxes()[0];
            yaxis = plot.getYAxes()[0];

            xaxis.options.disableZoom = true;

            plot.zoomOut({
                amount: 0.5
            });

            expect(xaxis.min).toBe(0);
            expect(xaxis.max).toBe(10);
            expect(yaxis.min).toBeCloseTo(2.5, 7);
            expect(yaxis.max).toBeCloseTo(7.5, 7);
        });
    });

    describe('smartPan', function () {
        it('uses the provided x delta', function () {
            var xaxis, yaxis;

            plot = $.plot(placeholder, [
                [
                    [0, 0],
                    [10, 10]
                ]
            ], options);

            xaxis = plot.getXAxes()[0];
            yaxis = plot.getYAxes()[0];

            plot.smartPan({
                x: -plot.width(),
                y: 0
            }, plot.navigationState());

            expect(xaxis.min).toBe(-10);
            expect(xaxis.max).toBe(0);
            expect(yaxis.min).toBe(0);
            expect(yaxis.max).toBe(10);
        });

        it('uses the provided y delta', function () {
            var xaxis, yaxis;

            plot = $.plot(placeholder, [
                [
                    [0, 0],
                    [10, 10]
                ]
            ], options);

            xaxis = plot.getXAxes()[0];
            yaxis = plot.getYAxes()[0];

            plot.smartPan({
                x: 0,
                y: plot.height(),
            }, plot.navigationState());

            expect(xaxis.min).toBe(0);
            expect(xaxis.max).toBe(10);
            expect(yaxis.min).toBe(-10);
            expect(yaxis.max).toBe(0);
        });

        it('snaps to the x direction when delta y is small', function () {
            var xaxis, yaxis;

            plot = $.plot(placeholder, [
                [
                    [0, 0],
                    [10, 10]
                ]
            ], options);

            xaxis = plot.getXAxes()[0];
            yaxis = plot.getYAxes()[0];

            plot.smartPan({
                x: -plot.width(),
                y: 1
            }, plot.navigationState());

            expect(xaxis.min).toBe(-10);
            expect(xaxis.max).toBe(0);
            expect(yaxis.min).toBe(0);
            expect(yaxis.max).toBe(10);
        });

        it('snaps to the y direction when delta x is small', function () {
            var xaxis, yaxis;

            plot = $.plot(placeholder, [
                [
                    [0, 0],
                    [10, 10]
                ]
            ], options);

            xaxis = plot.getXAxes()[0];
            yaxis = plot.getYAxes()[0];

            plot.smartPan({
                x: 1,
                y: plot.height(),
            }, plot.navigationState());

            expect(xaxis.min).toBe(0);
            expect(xaxis.max).toBe(10);
            expect(yaxis.min).toBe(-10);
            expect(yaxis.max).toBe(0);
        });

        it ('can be disabled per axis', function () {
            var xaxis, yaxis;

            plot = $.plot(placeholder, [
                [
                    [0, 0],
                    [10, 10]
                ]
            ], options);

            xaxis = plot.getXAxes()[0];
            yaxis = plot.getYAxes()[0];

            xaxis.options.disablePan = true;

            plot.smartPan({
                x: plot.width(),
                y: plot.height(),
            }, plot.navigationState());

            expect(xaxis.min).toBe(0);
            expect(xaxis.max).toBe(10);
            expect(yaxis.min).toBe(-10);
            expect(yaxis.max).toBe(0);
        });

    });

});
