/* eslint-disable */
/* global $, describe, it, xit, xdescribe, after, afterEach, expect*/

describe("flot navigate plugin", function () {
    var placeholder, plot, options;

    beforeEach(function () {
        placeholder = setFixtures('<div id="test-container" style="width: 600px;height: 400px">')
            .find('#test-container');
        options = {
            xaxes: [{ autoscale: 'exact' }],
            yaxes: [{ autoscale: 'exact' }],
            zoom: { interactive: true, amount: 10 },
            pan: { interactive: true, frameRate: -1, enableTouch: true }
        };
    });

    function getPairOfCoords(xaxis, yaxis, x, y) {
        return {
            x : xaxis.p2c(x) + plot.offset().left,
            y : yaxis.p2c(y) + plot.offset().top
        }
    }

    it('provides a zoom, zoomOut, pan, smartPan functions', function () {
        plot = $.plot(placeholder, [
            []
        ], options);

        expect(typeof plot.zoom).toBe('function');
        expect(typeof plot.zoomOut).toBe('function');
        expect(typeof plot.pan).toBe('function');
        expect(typeof plot.smartPan).toBe('function');

        plot.shutdown();
    });

    it('shuts down the plots after use', function() {
        plot = $.plot(placeholder, [
            []
        ], options);

        plot.shutdown();

        expect(plot.placeholder).toBe(undefined);
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

            plot.shutdown();
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

            plot.shutdown();
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

            plot.shutdown();
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

            plot.shutdown();
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

            plot.shutdown();
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

            plot.shutdown();
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

            plot.shutdown();
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

            plot.shutdown();
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

            plot.shutdown();
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

            plot.shutdown();
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

            plot.shutdown();
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

            plot.shutdown();
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

            plot.shutdown();
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

            plot.shutdown();
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

            plot.shutdown();
        });
    });

    describe('mousePan', function() {
        it ('pans on xaxis only', function () {
            plot = $.plot(placeholder, [
                [
                    [0, 0],
                    [10, 10]
                ]
            ], options);

            var xaxis = plot.getXAxes()[0],
                yaxis = plot.getYAxes()[0],
                initialXmin = xaxis.min,
                initialXmax = xaxis.max,
                eventHolder = placeholder.find('.flot-overlay'),
                pointCoords = [
                        { x: xaxis.p2c(4), y: xaxis.box.top + plot.offset().top + 10 },
                        { x: xaxis.p2c(5), y: xaxis.box.top + plot.offset().top + 15 }
                ];

            simulate.mouseDown(eventHolder[0], pointCoords[0].x, pointCoords[0].y);
            simulate.mouseMove(eventHolder[0], pointCoords[0].x, pointCoords[0].y);
            simulate.mouseMove(eventHolder[0], pointCoords[1].x, pointCoords[1].y);
            simulate.mouseUp(eventHolder[0], pointCoords[1].x, pointCoords[1].y);

            expect(xaxis.min).toBeCloseTo(xaxis.c2p(xaxis.p2c(initialXmin) + (pointCoords[0].x - pointCoords[1].x)), 0);
            expect(xaxis.max).toBeCloseTo(xaxis.c2p(xaxis.p2c(initialXmax) + (pointCoords[0].x - pointCoords[1].x)), 0);
            expect(yaxis.min).toBe(0);
            expect(yaxis.max).toBe(10);

            plot.shutdown();
        });

        it ('pans on yaxis only', function () {
            plot = $.plot(placeholder, [
                [
                    [0, 0],
                    [10, 10]
                ]
            ], options);

            var xaxis = plot.getXAxes()[0],
                yaxis = plot.getYAxes()[0],
                initialYmin = yaxis.min,
                initialYmax = yaxis.max,
                eventHolder = placeholder.find('.flot-overlay'),
                pointCoords = [
                        { x: xaxis.box.left - 10, y: yaxis.p2c(4) },
                        { x: yaxis.p2c(3), y: yaxis.p2c(8) }
                ];

            simulate.mouseDown(eventHolder[0], pointCoords[0].x, pointCoords[0].y);
            simulate.mouseMove(eventHolder[0], pointCoords[0].x, pointCoords[0].y);
            simulate.mouseMove(eventHolder[0], pointCoords[1].x, pointCoords[1].y);
            simulate.mouseUp(eventHolder[0], pointCoords[1].x, pointCoords[1].y);

            expect(xaxis.min).toBe(0);
            expect(xaxis.max).toBe(10);
            expect(yaxis.min).toBeCloseTo(yaxis.c2p(yaxis.p2c(initialYmin) + (pointCoords[0].y - pointCoords[1].y)), 0);
            expect(yaxis.max).toBeCloseTo(yaxis.c2p(yaxis.p2c(initialYmax) + (pointCoords[0].y - pointCoords[1].y)), 0);

            plot.shutdown();
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

            var canvasElement = placeholder[0].childNodes[2],
                xaxis = plot.getXAxes()[0],
                yaxis = plot.getYAxes()[0],
                initialXmin = xaxis.min,
                initialXmax = xaxis.max,
                initialYmin = yaxis.min,
                initialYmax = yaxis.max,
                initialCoords = [
                    getPairOfCoords(xaxis, yaxis, 3, 5),
                    getPairOfCoords(xaxis, yaxis, 7, 9)
                ],
                finalCoords = [
                    getPairOfCoords(xaxis, yaxis, 2, 4),
                    getPairOfCoords(xaxis, yaxis, 8, 10)
                ],
                midPointCoords = {
                        x: (xaxis.c2p(finalCoords[0].x - plot.offset().left) + xaxis.c2p(finalCoords[1].x - plot.offset().left)) / 2,
                        y: (yaxis.c2p(finalCoords[0].y - plot.offset().top) + yaxis.c2p(finalCoords[1].y - plot.offset().top)) / 2
                },
                amount = getDistance(finalCoords) / getDistance(initialCoords);

            simulate.sendTouchEvents(initialCoords, canvasElement, 'touchstart');
            simulate.sendTouchEvents(finalCoords, canvasElement, 'touchmove');
            simulate.sendTouchEvents(finalCoords, canvasElement, 'touchend');

            expect(xaxis.min).toBeCloseTo((midPointCoords.x - initialXmin) * (1 - 1/amount) + initialXmin, 6);
            expect(xaxis.max).toBeCloseTo(initialXmax - (initialXmax - midPointCoords.x) * (1 - 1/amount), 6);
            expect(yaxis.min).toBeCloseTo((midPointCoords.y - initialYmin) * (1 - 1/amount) + initialYmin, 6);
            expect(yaxis.max).toBeCloseTo(initialYmax - (initialYmax - midPointCoords.y) * (1 - 1/amount), 6);
          });

        it('should zoom the plot correctly using pageXY when the canvas is placed in the bottom scrollable area of the page', function () {
              var largeDiv = $('<div style="height: 800px"> </div>');
              $(largeDiv).insertBefore(placeholder);

              plot = $.plot(placeholder, [
                  [
                      [-1, 2],
                      [11, 12]
                  ]
              ], options);

              var canvasElement = placeholder[0].childNodes[2],
                  xaxis = plot.getXAxes()[0],
                  yaxis = plot.getYAxes()[0],
                  initialXmin = xaxis.min,
                  initialXmax = xaxis.max,
                  initialYmin = yaxis.min,
                  initialYmax = yaxis.max,
                  initialCoords = [
                      getPairOfCoords(xaxis, yaxis, 3, 5),
                      getPairOfCoords(xaxis, yaxis, 7, 9)
                  ],
                  finalCoords = [
                      getPairOfCoords(xaxis, yaxis, 2, 4),
                      getPairOfCoords(xaxis, yaxis, 8, 10)
                  ],
                  midPointCoords = {
                          x: (xaxis.c2p(finalCoords[0].x - plot.offset().left) + xaxis.c2p(finalCoords[1].x - plot.offset().left)) / 2,
                          y: (yaxis.c2p(finalCoords[0].y - plot.offset().top) + yaxis.c2p(finalCoords[1].y - plot.offset().top)) / 2
                  },
                  amount = getDistance(finalCoords) / getDistance(initialCoords);

              simulate.sendTouchEvents(initialCoords, placeholder[0].childNodes[2], 'touchstart');
              simulate.sendTouchEvents(finalCoords, placeholder[0].childNodes[2], 'touchmove');
              simulate.sendTouchEvents(finalCoords, placeholder[0].childNodes[2], 'touchend');

              expect(xaxis.min).toBeCloseTo((midPointCoords.x - initialXmin) * (1 - 1/amount) + initialXmin, 6);
              expect(xaxis.max).toBeCloseTo(initialXmax - (initialXmax - midPointCoords.x) * (1 - 1/amount), 6);
              expect(yaxis.min).toBeCloseTo((midPointCoords.y - initialYmin) * (1 - 1/amount) + initialYmin, 6);
              expect(yaxis.max).toBeCloseTo(initialYmax - (initialYmax - midPointCoords.y) * (1 - 1/amount), 6);
          });

        it('should zoom the plot on axis x',function() {
          plot = $.plot(placeholder, [
              [
                  [-1, 2],
                  [11, 12]
              ]
          ], options);

          var canvasElement = placeholder[0].childNodes[2],
              xaxis = plot.getXAxes()[0],
              yaxis = plot.getYAxes()[0],
              initialXmin = xaxis.min,
              initialXmax = xaxis.max,
              initialYmin = yaxis.min,
              initialYmax = yaxis.max,
              initialCoords = [
                  { x: xaxis.p2c(4), y: xaxis.box.top + plot.offset().top + 10 },
                  { x: xaxis.p2c(5), y: xaxis.box.top + plot.offset().top + 10 }
              ],
              finalCoords = [
                  getPairOfCoords(xaxis, yaxis, 2, 4),
                  getPairOfCoords(xaxis, yaxis, 6, 6)
              ],
              midPointCoords = {
                      x: (xaxis.c2p(finalCoords[0].x - plot.offset().left) + xaxis.c2p(finalCoords[1].x - plot.offset().left)) / 2,
                      y: (yaxis.c2p(finalCoords[0].y - plot.offset().top) + yaxis.c2p(finalCoords[1].y - plot.offset().top)) / 2
              },
              amount = getDistance(finalCoords) / getDistance(initialCoords);

          simulate.sendTouchEvents(initialCoords, canvasElement, 'touchstart');
          simulate.sendTouchEvents(finalCoords, canvasElement, 'touchmove');
          simulate.sendTouchEvents(finalCoords, canvasElement, 'touchend');

          expect(Math.abs(xaxis.min - ((midPointCoords.x - initialXmin) * (1 - 1/amount) + initialXmin))).toBeLessThan(1);
          expect(Math.abs(xaxis.max - (initialXmax - (initialXmax - midPointCoords.x) * (1 - 1/amount)))).toBeLessThan(1);
          expect(yaxis.min).toBeCloseTo(initialYmin, 6);
          expect(yaxis.max).toBeCloseTo(initialYmax, 6);

          plot.shutdown();
        });

        it('should zoom the plot on axis y',function() {
            plot = $.plot(placeholder, [
                [
                    [-1, 2],
                    [11, 12]
                ]
            ], options);

            var canvasElement = placeholder[0].childNodes[2],
                xaxis = plot.getXAxes()[0],
                yaxis = plot.getYAxes()[0],
                initialXmin = xaxis.min,
                initialXmax = xaxis.max,
                initialYmin = yaxis.min,
                initialYmax = yaxis.max,
                initialCoords = [
                    { x: xaxis.box.left - 10, y: yaxis.p2c(4) + plot.offset().top},
                    { x: xaxis.box.left - 20, y: yaxis.p2c(5) + plot.offset().top}
                ],
                finalCoords = [
                    getPairOfCoords(xaxis, yaxis, 2, 4),
                    getPairOfCoords(xaxis, yaxis, 6, 6)
                ],
                midPointCoords = {
                        x: (xaxis.c2p(finalCoords[0].x - plot.offset().left) + xaxis.c2p(finalCoords[1].x - plot.offset().left)) / 2,
                        y: (yaxis.c2p(finalCoords[0].y - plot.offset().top) + yaxis.c2p(finalCoords[1].y - plot.offset().top)) / 2
                },
                amount = getDistance(finalCoords) / getDistance(initialCoords);

            simulate.sendTouchEvents(initialCoords, canvasElement, 'touchstart');
            simulate.sendTouchEvents(finalCoords, canvasElement, 'touchmove');
            simulate.sendTouchEvents(finalCoords, canvasElement, 'touchend');

            expect(xaxis.min).toBeCloseTo(initialXmin, 6);
            expect(xaxis.max).toBeCloseTo(initialXmax, 6);
            expect(Math.abs(yaxis.min - ((midPointCoords.y - initialYmin) * (1 - 1/amount) + initialYmin))).toBeLessThan(1);
            expect(Math.abs(yaxis.max - (initialYmax - (initialYmax - midPointCoords.x) * (1 - 1/amount)))).toBeLessThan(1);

            plot.shutdown();
          });

        function getDistance(coords) {
            return Math.sqrt((coords[0].x - coords[1].x) * (coords[0].x - coords[1].x) + ((coords[0].y - coords[1].y) * (coords[0].y - coords[1].y)));
        }
    });

    describe('touchDrag', function() {
      it('should drag the plot',function() {

        plot = $.plot(placeholder, [
            [
                [-10, 120],
                [-10, 120]
            ]
        ], options);

        var canvasElement = placeholder[0].childNodes[2],
            xaxis = plot.getXAxes()[0],
            yaxis = plot.getYAxes()[0],
            initialXmin = xaxis.min,
            initialXmax = xaxis.max,
            initialYmin = yaxis.min,
            initialYmax = yaxis.max,
            canvasCoords = [ { x : 1, y : 1 }, { x : 100, y : 100 }],
            pointCoords = [
                    getPairOfCoords(xaxis, yaxis, canvasCoords[0].x, canvasCoords[0].y),
                    getPairOfCoords(xaxis, yaxis, canvasCoords[1].x, canvasCoords[1].y)
            ];

        simulate.touchstart(canvasElement, pointCoords[0].x, pointCoords[0].y);
        simulate.touchmove(canvasElement, pointCoords[1].x, pointCoords[1].y);
        simulate.touchend(canvasElement, pointCoords[1].x, pointCoords[1].y);

        expect(xaxis.min).toBeCloseTo(initialXmin + (canvasCoords[0].x - canvasCoords[1].x), 6);
        expect(xaxis.max).toBeCloseTo(initialXmax + (canvasCoords[0].x - canvasCoords[1].x), 6);
        expect(yaxis.min).toBeCloseTo(initialYmin + (canvasCoords[0].y - canvasCoords[1].y), 6);
        expect(yaxis.max).toBeCloseTo(initialYmax + (canvasCoords[0].y - canvasCoords[1].y), 6);

        plot.shutdown();
      });

      it('should drag the logarithmic plot', function() {
          var d1 = [];
          for (var i = 0; i < 14; i += 0.2) {
              d1.push([i, 1.01 + Math.sin(i)]);
          }

          var plot = $.plot(placeholder, [d1], {
              series: {
                  lines: { show: true },
                  points: { show: true }
              },
              xaxis: { autoscale: 'exact' },
              yaxis: { mode: 'log', showTickLabels: "all", autoscale: 'exact' },
              zoom: { interactive: true },
              pan: { interactive: true, enableTouch: true }
          });

          var canvasElement = placeholder[0].childNodes[2],
              xaxis = plot.getXAxes()[0],
              yaxis = plot.getYAxes()[0],
              initialXmin = xaxis.min,
              initialXmax = xaxis.max,
              initialYmin = yaxis.min,
              initialYmax = yaxis.max,
              canvasCoords = [ { x : 4, y : 0.7 }, { x : 2, y : 10 } ],
              pointCoords = [
                      getPairOfCoords(xaxis, yaxis, canvasCoords[0].x, canvasCoords[0].y),
                      getPairOfCoords(xaxis, yaxis, canvasCoords[1].x, canvasCoords[1].y)
              ];

          simulate.touchstart(canvasElement, pointCoords[0].x, pointCoords[0].y);
          simulate.touchmove(canvasElement, pointCoords[1].x, pointCoords[1].y);
          simulate.touchend(canvasElement, pointCoords[1].x, pointCoords[1].y);

          expect(xaxis.min).toBeCloseTo(initialXmin + (canvasCoords[0].x - canvasCoords[1].x), 6);
          expect(xaxis.max).toBeCloseTo(initialXmax + (canvasCoords[0].x - canvasCoords[1].x), 6);
          expect(yaxis.min).toBeCloseTo((yaxis.c2p(yaxis.p2c(initialYmin) + (pointCoords[0].y - pointCoords[1].y))), 6);
          expect(yaxis.max).toBeCloseTo((yaxis.c2p(yaxis.p2c(initialYmax) + (pointCoords[0].y - pointCoords[1].y))), 6);

          plot.shutdown();
      });

      it('should drag the point in the same way for many sequential moves as for one long move',function() {

         //deactivate ticks for precision
        options.yaxes[0].showTickLabels = 'none';
        options.xaxes[0].showTickLabels = 'all';

        plot = $.plot(placeholder, [
            [
                [-10, -10],
                [120, 120]
            ]
        ], options);

        var canvasElement = placeholder[0].childNodes[2],
            xaxis = plot.getXAxes()[0],
            yaxis = plot.getYAxes()[0],
            initialXmin = xaxis.min,
            initialXmax = xaxis.max,
            initialYmin = yaxis.min,
            initialYmax = yaxis.max,
            limit = 5,
            canvasCoords = [],
            pointCoords = [];

        for (var i = 1; i <= limit; i++) {
            canvasCoords[i] = { x: i, y: i };
            pointCoords[i] = getPairOfCoords(xaxis, yaxis, canvasCoords[i].x, canvasCoords[i].y);
        }

        //simulate drag from (1, 1) to (100, 100) sequentially
        simulate.touchstart(canvasElement, pointCoords[1].x, pointCoords[1].y);
        for (var i = 2; i <= limit; i++) {
            simulate.touchmove(canvasElement, pointCoords[i].x, pointCoords[i].y);
        }
        simulate.touchend(canvasElement, pointCoords[limit].x, pointCoords[limit].y);

        // compare axes after sequential drag with axes after direct drag
        expect(Math.abs(xaxis.min - (initialXmin + (canvasCoords[1].x - canvasCoords[limit].x)))).toBeLessThan(1);
        expect(Math.abs(xaxis.max - (initialXmax + (canvasCoords[1].x - canvasCoords[limit].x)))).toBeLessThan(1);
        expect(yaxis.min).toBeCloseTo(initialYmin + (canvasCoords[1].y - canvasCoords[limit].y), 0);
        expect(yaxis.max).toBeCloseTo(initialYmax + (canvasCoords[1].y - canvasCoords[limit].y), 0);

        plot.shutdown();
      });

      it('should drag the plot on the yaxis only', function() {
          plot = $.plot(placeholder, [
              [
                  [0, 0],
                  [10, 10]
              ]
          ], options);

          var canvasElement = placeholder[0].childNodes[2],
              xaxis = plot.getXAxes()[0],
              yaxis = plot.getYAxes()[0],
              initialXmin = xaxis.min,
              initialXmax = xaxis.max,
              initialYmin = yaxis.min,
              initialYmax = yaxis.max,
              pointCoords = [
                      { x: xaxis.box.left - 10, y: yaxis.p2c(4) },
                      { x: xaxis.box.left - 20, y: yaxis.p2c(5) }
              ];

          simulate.touchstart(canvasElement, pointCoords[0].x, pointCoords[0].y);
          simulate.touchmove(canvasElement, pointCoords[0].x, pointCoords[0].y);
          simulate.touchmove(canvasElement, pointCoords[1].x, pointCoords[1].y);
          simulate.touchend(canvasElement, pointCoords[1].x, pointCoords[1].y);

          expect(xaxis.min).toBe(0);
          expect(xaxis.max).toBe(10);
          expect(yaxis.min).toBeCloseTo(yaxis.c2p(yaxis.p2c(initialYmin) + (pointCoords[0].y - pointCoords[1].y)), 6);
          expect(yaxis.max).toBeCloseTo(yaxis.c2p(yaxis.p2c(initialYmax) + (pointCoords[0].y - pointCoords[1].y)), 6);

          plot.shutdown();
      });

      it('should drag the plot on the xaxis only', function() {
          plot = $.plot(placeholder, [
              [
                  [0, 0],
                  [10, 10]
              ]
          ], options);

          var canvasElement = placeholder[0].childNodes[2],
              xaxis = plot.getXAxes()[0],
              yaxis = plot.getYAxes()[0],
              initialXmin = xaxis.min,
              initialXmax = xaxis.max,
              pointCoords = [
                      { x: xaxis.p2c(4), y: xaxis.box.top + plot.offset().top + 10 },
                      { x: xaxis.p2c(5), y: xaxis.box.top + plot.offset().top + 15 }
              ];

          simulate.touchstart(canvasElement, pointCoords[0].x, pointCoords[0].y);
          simulate.touchmove(canvasElement, pointCoords[0].x, pointCoords[0].y);
          simulate.touchmove(canvasElement, pointCoords[1].x, pointCoords[1].y);
          simulate.touchend(canvasElement, pointCoords[1].x, pointCoords[1].y);

          expect(xaxis.min).toBeCloseTo(xaxis.c2p(xaxis.p2c(initialXmin) + (pointCoords[0].x - pointCoords[1].x)), 6);
          expect(xaxis.max).toBeCloseTo(xaxis.c2p(xaxis.p2c(initialXmax) + (pointCoords[0].x - pointCoords[1].x)), 6);
          expect(yaxis.min).toBe(0);
          expect(yaxis.max).toBe(10);

          plot.shutdown();
      });
    });

    describe('plotRecenter', function() {
        it('should recenter the plot',function() {

          plot = $.plot(placeholder, [
              [
                  [-10, 120],
                  [-10, 120]
              ]
          ], options);

          var canvasElement = placeholder[0].childNodes[2],
              xaxis = plot.getXAxes()[0],
              yaxis = plot.getYAxes()[0],
              initialXmin = xaxis.min,
              initialXmax = xaxis.max,
              initialYmin = yaxis.min,
              initialYmax = yaxis.max,
              canvasCoords = [ { x : 1, y : 2 }, { x : 3, y : 5 }],
              pointCoords = [
                      getPairOfCoords(xaxis, yaxis, canvasCoords[0].x, canvasCoords[0].y),
                      getPairOfCoords(xaxis, yaxis, canvasCoords[1].x, canvasCoords[1].y)
              ];

          simulate.touchstart(canvasElement, pointCoords[0].x, pointCoords[0].y);
          simulate.touchmove(canvasElement, pointCoords[1].x, pointCoords[1].y);
          simulate.touchend(canvasElement, pointCoords[1].x, pointCoords[1].y);

          //check if the drag modified the plot correctly
          expect(xaxis.min).toBeCloseTo(initialXmin + (canvasCoords[0].x - canvasCoords[1].x), 6);
          expect(xaxis.max).toBeCloseTo(initialXmax + (canvasCoords[0].x - canvasCoords[1].x), 6);
          expect(yaxis.min).toBeCloseTo(initialYmin + (canvasCoords[0].y - canvasCoords[1].y), 6);
          expect(yaxis.max).toBeCloseTo(initialYmax + (canvasCoords[0].y - canvasCoords[1].y), 6);

          //simulate double tap
          simulate.touchstart(canvasElement, pointCoords[1].x, pointCoords[1].y);
          simulate.touchend(canvasElement, pointCoords[1].x, pointCoords[1].y);
          simulate.touchstart(canvasElement, pointCoords[1].x, pointCoords[1].y);
          simulate.touchend(canvasElement, pointCoords[1].x, pointCoords[1].y);

          //check if axis values returned to initial coordinates
          expect(xaxis.min).toBeCloseTo(initialXmin, 6);
          expect(xaxis.max).toBeCloseTo(initialXmax, 6);
          expect(yaxis.min).toBeCloseTo(initialYmin, 6);
          expect(yaxis.max).toBeCloseTo(initialYmax, 6);

          plot.shutdown();
        });

        it('should recenter the plot on axis x',function() {

          plot = $.plot(placeholder, [
              [
                  [-10, -10],
                  [120, 120]
              ]
          ], options);

          var canvasElement = placeholder[0].childNodes[2],
              xaxis = plot.getXAxes()[0],
              yaxis = plot.getYAxes()[0],
              initialXmin = xaxis.min,
              initialXmax = xaxis.max,
              initialYmin = yaxis.min,
              initialYmax = yaxis.max,
              canvasCoords = [ { x : 1, y : 2 }, { x : 3, y : 5 }],
              pointCoords = [
                      getPairOfCoords(xaxis, yaxis, canvasCoords[0].x, canvasCoords[0].y),
                      getPairOfCoords(xaxis, yaxis, canvasCoords[1].x, canvasCoords[1].y)
              ];

          simulate.touchstart(canvasElement, pointCoords[0].x, pointCoords[0].y);
          simulate.touchmove(canvasElement, pointCoords[1].x, pointCoords[1].y);
          simulate.touchend(canvasElement, pointCoords[1].x, pointCoords[1].y);

          //check if the drag modified the plot correctly
          expect(xaxis.min).toBeCloseTo(initialXmin + (canvasCoords[0].x - canvasCoords[1].x), 6);
          expect(xaxis.max).toBeCloseTo(initialXmax + (canvasCoords[0].x - canvasCoords[1].x), 6);
          expect(yaxis.min).toBeCloseTo(initialYmin + (canvasCoords[0].y - canvasCoords[1].y), 6);
          expect(yaxis.max).toBeCloseTo(initialYmax + (canvasCoords[0].y - canvasCoords[1].y), 6);

          //simulate double tap
          simulate.touchstart(canvasElement, xaxis.p2c(5), xaxis.box.top + plot.offset().top + 15);
          simulate.touchend(canvasElement, xaxis.p2c(5), xaxis.box.top + plot.offset().top + 15);
          simulate.touchstart(canvasElement, xaxis.p2c(5), xaxis.box.top + plot.offset().top + 15);
          simulate.touchend(canvasElement, xaxis.p2c(5), xaxis.box.top + plot.offset().top + 15);

          //check if axis values returned to initial coordinates
          expect(xaxis.min).toBeCloseTo(initialXmin, 6);
          expect(xaxis.max).toBeCloseTo(initialXmax, 6);
          expect(yaxis.min).toBeCloseTo(initialYmin + (canvasCoords[0].y - canvasCoords[1].y), 6);
          expect(yaxis.max).toBeCloseTo(initialYmax + (canvasCoords[0].y - canvasCoords[1].y), 6);

          plot.shutdown();
        });

        it('should recenter the plot on axis y',function() {

          plot = $.plot(placeholder, [
              [
                  [-10, -10],
                  [120, 120]
              ]
          ], options);

          var canvasElement = placeholder[0].childNodes[2],
              xaxis = plot.getXAxes()[0],
              yaxis = plot.getYAxes()[0],
              initialXmin = xaxis.min,
              initialXmax = xaxis.max,
              initialYmin = yaxis.min,
              initialYmax = yaxis.max,
              canvasCoords = [ { x : 1, y : 2 }, { x : 3, y : 5 }],
              pointCoords = [
                      getPairOfCoords(xaxis, yaxis, canvasCoords[0].x, canvasCoords[0].y),
                      getPairOfCoords(xaxis, yaxis, canvasCoords[1].x, canvasCoords[1].y)
              ];

          simulate.touchstart(canvasElement, pointCoords[0].x, pointCoords[0].y);
          simulate.touchmove(canvasElement, pointCoords[1].x, pointCoords[1].y);
          simulate.touchend(canvasElement, pointCoords[1].x, pointCoords[1].y);

          //check if the drag modified the plot correctly
          expect(xaxis.min).toBeCloseTo(initialXmin + (canvasCoords[0].x - canvasCoords[1].x), 6);
          expect(xaxis.max).toBeCloseTo(initialXmax + (canvasCoords[0].x - canvasCoords[1].x), 6);
          expect(yaxis.min).toBeCloseTo(initialYmin + (canvasCoords[0].y - canvasCoords[1].y), 6);
          expect(yaxis.max).toBeCloseTo(initialYmax + (canvasCoords[0].y - canvasCoords[1].y), 6);

          //simulate double tap
          simulate.touchstart(canvasElement, xaxis.box.left - 20, yaxis.p2c(5));
          simulate.touchend(canvasElement,  xaxis.box.left - 20, yaxis.p2c(5));
          simulate.touchstart(canvasElement, xaxis.box.left - 20, yaxis.p2c(5));
          simulate.touchend(canvasElement, xaxis.box.left - 20, yaxis.p2c(5));

          //check if axis values returned to initial coordinates
          expect(xaxis.min).toBeCloseTo(initialXmin + (canvasCoords[0].x - canvasCoords[1].x), 6);
          expect(xaxis.max).toBeCloseTo(initialXmax + (canvasCoords[0].x - canvasCoords[1].x), 6);
          expect(yaxis.min).toBeCloseTo(initialYmin, 6);
          expect(yaxis.max).toBeCloseTo(initialYmax, 6);

          plot.shutdown();
        });
    });
});
