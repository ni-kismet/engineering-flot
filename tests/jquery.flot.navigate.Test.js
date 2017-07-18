/* eslint-disable */
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
            interactive: true,
            frameRate: -1,
            enableTouch: true
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

        it('uses the provided axes', function () {
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
                },
                axes: plot.getXAxes()
            });

            xaxis = plot.getXAxes()[0];
            yaxis = plot.getYAxes()[0];

            expect(xaxis.min).toBe(0);
            expect(xaxis.max).toBe(5);
            expect(yaxis.min).toBe(0);
            expect(yaxis.max).toBe(10);
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

    describe('touchDrag', function() {
      it('should drag the plot (start + move + end)',function() {

        plot = $.plot(placeholder, [
            [
                [-1, 2],
                [11, 12]
            ]
        ], options);

        function getPairOfCoords(x, y) {
            return {
                x : xaxis.p2c(x) + plot.offset().left,
                y : yaxis.p2c(y) + plot.offset().top
            }
        }

        var canvasElement = placeholder[0].childNodes[2],
            xaxis = plot.getXAxes()[0],
            yaxis = plot.getYAxes()[0],
            initialXmin = xaxis.min,
            initialXmax = xaxis.max,
            initialYmin = yaxis.min,
            initialYmax = yaxis.max,
            canvasCoords = [
                    {
                        x : 5,
                        y : 5
                    },
                    {
                        x : 6,
                        y : 6
                    }
            ],
            pointCoords = [
                    getPairOfCoords(canvasCoords[0].x, canvasCoords[0].y),
                    getPairOfCoords(canvasCoords[1].x, canvasCoords[1].y)
            ];

        simulate.touchstart(canvasElement, pointCoords[0].x, pointCoords[0].y);
        simulate.touchmove(canvasElement, pointCoords[1].x, pointCoords[1].y);
        simulate.touchend(canvasElement, pointCoords[1].x, pointCoords[1].y);

        expect(xaxis.min).toBeCloseTo(initialXmin + (canvasCoords[0].x - canvasCoords[1].x), 6);
        expect(xaxis.max).toBeCloseTo(initialXmax + (canvasCoords[0].x - canvasCoords[1].x), 6);
        expect(yaxis.min).toBeCloseTo(initialYmin + (canvasCoords[0].y - canvasCoords[1].y), 6);
        expect(yaxis.max).toBeCloseTo(initialYmax + (canvasCoords[0].y - canvasCoords[1].y), 6);
      });
    });

    describe('touchZoom', function() {
      it('should zoom the plot',function() {

        plot = $.plot(placeholder, [
            [
                [-1, 2],
                [11, 12]
            ]
        ], options);

        function getPairOfCoords(x, y) {
            return {
                x : xaxis.p2c(x) + plot.offset().left,
                y : yaxis.p2c(y) + plot.offset().top
            }
        }

        function getDistance(coords) {
            return Math.sqrt((coords[0].x - coords[1].x) * (coords[0].x - coords[1].x) +
            ((coords[0].y - coords[1].y) * (coords[0].y - coords[1].y)));
        }

        var canvasElement = placeholder[0].childNodes[2],
            xaxis = plot.getXAxes()[0],
            yaxis = plot.getYAxes()[0],
            initialXmin = xaxis.min,
            initialXmax = xaxis.max,
            initialYmin = yaxis.min,
            initialYmax = yaxis.max,
            initialCoords = [
                getPairOfCoords(3, 5),
                getPairOfCoords(7, 9)
            ],
            finalCoords = [
                getPairOfCoords(2, 4),
                getPairOfCoords(8, 10)
            ],
            midPointCoords = {
                    x: (xaxis.c2p(finalCoords[0].x - plot.offset().left) + xaxis.c2p(finalCoords[1].x - plot.offset().left)) / 2,
                    y: (yaxis.c2p(finalCoords[0].y - plot.offset().top) + yaxis.c2p(finalCoords[1].y - plot.offset().top)) / 2
            },
            amount = getDistance(finalCoords) / getDistance(initialCoords);

        simulate.sendTouchEvents(initialCoords, placeholder[0].childNodes[2], "touchstart");
        simulate.sendTouchEvents(finalCoords, placeholder[0].childNodes[2], "touchmove");
        simulate.sendTouchEvents(finalCoords, placeholder[0].childNodes[2], "touchend");

        expect(xaxis.min).toBeCloseTo((midPointCoords.x - initialXmin) * (1 - 1/amount) + initialXmin, 6);
        expect(xaxis.max).toBeCloseTo(initialXmax - (initialXmax - midPointCoords.x) * (1 - 1/amount), 6);
        expect(yaxis.min).toBeCloseTo((midPointCoords.y - initialYmin) * (1 - 1/amount) + initialYmin, 6);
        expect(yaxis.max).toBeCloseTo(initialYmax - (initialYmax - midPointCoords.y) * (1 - 1/amount), 6);
      });
    });

    describe('touchLogarithmicPan', function() {
        it('should pan the logarithmic plot', function() {
            var d1 = [];
            for (var i = 0; i < 14; i += 0.2) {
                d1.push([i, 1.01 + Math.sin(i)]);
            }
            function piTickGenerator(axis) {
                var res = [],
                i = Math.floor(axis.min / Math.PI);
                do {
                    var v = i * Math.PI;
                    res.push([v, i + "\u03c0"]);
                    ++i;
                } while (v < axis.max);
                return res;
            }

            var plot = $.plot(placeholder, [d1], {
                series: {
                    lines: {
                        show: true
                    },
                    points: {
                        show: true
                    }
                },
                xaxis: {
                    ticks: piTickGenerator,
                    autoscale: 'exact'
                },
                yaxis: {
                    mode: 'log',
                    showTickLabels: "all",
                    autoscale: 'exact'
                },
                zoom: {
                    interactive: true
                },
                pan: {
                    interactive: true,
                    enableTouch: true
                }
            });

            function getPairOfCoords(x, y) {
                return {
                    x : xaxis.p2c(x) + plot.offset().left,
                    y : yaxis.p2c(y) + plot.offset().top
                }
            }

            var canvasElement = placeholder[0].childNodes[2],
                xaxis = plot.getXAxes()[0],
                yaxis = plot.getYAxes()[0],
                initialXmin = xaxis.min,
                initialXmax = xaxis.max,
                initialYmin = yaxis.min,
                initialYmax = yaxis.max,
                canvasCoords = [
                        {
                            x : Math.PI * 4,
                            y : 0.7
                        },
                        {
                            x : Math.PI * 2,
                            y : 10
                        }
                ],
                pointCoords = [
                        getPairOfCoords(canvasCoords[0].x, canvasCoords[0].y),
                        getPairOfCoords(canvasCoords[1].x, canvasCoords[1].y)
                ];

            simulate.touchstart(canvasElement, pointCoords[0].x, pointCoords[0].y);
            simulate.touchmove(canvasElement, pointCoords[1].x, pointCoords[1].y);
            simulate.touchend(canvasElement, pointCoords[1].x, pointCoords[1].y);

            expect(xaxis.min).toBeCloseTo(initialXmin + (canvasCoords[0].x - canvasCoords[1].x), 6);
            expect(xaxis.max).toBeCloseTo(initialXmax + (canvasCoords[0].x - canvasCoords[1].x), 6);
            expect(yaxis.min).toBeCloseTo((yaxis.c2p(yaxis.p2c(initialYmin) + (pointCoords[0].y - pointCoords[1].y))), 6);
            expect(yaxis.max).toBeCloseTo((yaxis.c2p(yaxis.p2c(initialYmax) + (pointCoords[0].y - pointCoords[1].y))), 6);

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
