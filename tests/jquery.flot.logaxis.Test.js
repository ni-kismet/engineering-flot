/* eslint-disable */
/* global $, describe, it, xit, xdescribe, after, afterEach, expect*/

describe("unit tests for the log scale functions", function() {
    var placeholder;
    beforeEach(function() {
        placeholder = setFixtures('<div id="test-container" style="width: 600px;height: 400px">')
            .find('#test-container');
    });

    it('should use linear scale for low dynamic range intervals', function() {
        var plot = $.plot(placeholder, [], {
                xaxes: [{
                    min: 10,
                    max: 11,
                }]
            }),
            axis, ticks;

        axis = plot.getAxes().xaxis;
        ticks = $.plot.logTicksGenerator(plot, axis, 10);

        expect(ticks).toEqual([10, 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7, 10.8, 10.9, 11]);
    });

    xit('should use mixed scale for medium dynamic range intervals', function() {
        var plot = $.plot(placeholder, [], {
                xaxes: [{
                    min: 0.2,
                    max: 8,
                }]
            }),
            axis, ticks,
            outputArray  = [0.2, 0.4, 0.6, 1, 2, 3, 5, 8 ];

        axis = plot.getAxes().xaxis;
        ticks = $.plot.logTicksGenerator(plot,axis, 10);

        for(i = 0; i < ticks.length; i++) {
            expect(ticks[i]).toBeCloseTo(outputArray[i]);
        }
    });

    it('should use log scales for high dynamic range intervals', function() {
        var plot = $.plot(placeholder, [], {
                xaxes: [{
                    min: 0.0001,
                    max: 10000,
                }]
            }),
            axis, ticks,

        axis = plot.getAxes().xaxis;
        ticks = $.plot.logTicksGenerator(plot,axis, 10);

        expect(ticks).toEqual([0.0001, 0.001, 0.01, 0.1, 1, 10, 100, 1000, 10000]);
    });

    it('should format numbers according to their natural precision', function() {
        var logFormatter = $.plot.logTickFormatter;
        var testVector = [
            [1.7000000000000002, '1.7'],
            [17.000000000000002, '17'],
            [172, '172'],
            [1.000, '1'],
            [0.0004, '0.0004'],
            [0.00004, '4e-5'],
            [3.1623E-21, '3e-21']
            ];

        testVector.forEach(function (t) {
            var inputValue = t[0],
                expectedValue = t[1];

            expect(logFormatter(inputValue)).toBe(expectedValue);
        });
    });

    it('should custom the specified precision of endpoints', function(){
        var logFormatter = $.plot.logTickFormatter,
        axis = [],
        testVector = [
            [1.7000000000000002, '1.700', 3],
            [1.7000000000000002, '1.70', 2],
            [17.000000000000002, '17.000', 3],
            [172, '172.0', 1],
            [1.000, '1.000', 3],
            [1, '1.00', 2],
            [0.00004, '4.0e-5', 3],
            [4.13567003E-8, '4.1e-8', 9],
            [413.567003E-8, '4.136e-6', 9],
            [3.1623E-21, '3e-21', 21],
            [4.13567003E+8, '4e8', -9],
            [413.567003E+8, '4.1e10', -9],
            [3.1623E+21, '3.2e21', -20],
            [0, '0', -1]
        ];

        testVector.forEach(function (t) {
            var inputValue = t[0],
                expectedValue = t[1],
                precision = t[2];

            expect(logFormatter(inputValue, axis, precision)).toBe(expectedValue);
        });
    });

    it('should handle intervals which starts close to 0', function() {
        var testVector = [
            [0, 50, [0.1, 1, 10, 50]],
            [1E-40, 1.01, [1e-35, 1e-29, 1e-23, 1e-17, 1e-11, 0.00001, 5]],
            [1E-40, 1E+40, [1e-39, 1e-28, 1e-15, 0.0001, 10000000, 1000000000000000000 , 1e+29, 1e40]]
            ];

        testVector.forEach(function (t) {
            var min = t[0],
                max = t[1],
                expectedTicks = t[2],
                plot = $.plot(placeholder, [], {
                        xaxes: [{
                            min: min,
                            max: max,
                        }]
                    }),
                    axis, ticks;

                    axis = plot.getAxes().xaxis;
                    ticks = $.plot.logTicksGenerator(plot, axis);

                    for(i = 0; i < ticks.length; i++) {
                        expect(ticks[i]).toBeCloseTo(expectedTicks[i]);
                    }
            });
    });
});

describe("integration tests for log scale functions", function() {
    var placeholder;

    var compareNumbers = function(a, b) {
        return a - b;
    }

    var queryPlotForYTicks = function() {
        var actualTicks = [];

        var yAxisDivs = $('.yAxis');
        expect(yAxisDivs.length).toBe(1);
        var childDivs = yAxisDivs.find('.tickLabel');
        childDivs.each(function(i, e) {
            actualTicks.push(e.innerText);
        });

        return actualTicks.sort(compareNumbers);
    };

    beforeEach(function() {
        placeholder = setFixtures('<div id="test-container" style="width: 600px;height: 400px">')
            .find('#test-container');
    });

    it('should use linear scale for low dynamic range intervals', function() {
        var lineardata1 = [
            [0, 1],
            [1, 1.1],
            [2, 1.2],
            [3, 1.3],
            [4, 1.4],
            [5, 1.5],
            [6, 1.6],
            [7, 1.7],
            [8, 1.8],
            [9, 1.9],
            [10, 2]
        ];

        $.plot(placeholder, [lineardata1], {
            yaxis: {
                mode: 'log',
                autoscale: 'exact'
            }
        });

        expect(queryPlotForYTicks()).toEqual(['1', '1.1', '1.2', '1.3', '1.4', '1.5', '1.6', '1.7', '1.8', '1.9', '2']);
    });

    it('should use log scales for high dynamic range intervals', function() {
        var logdata1 = [
            [0, 0.0001],
            [1, 0.001],
            [2, 0.01],
            [3, 0.1],
            [4, 1],
            [5, 10],
            [6, 100],
            [7, 1000],
            [8, 10000]
        ];

        $.plot(placeholder, [logdata1], {
            yaxis: {
                mode: 'log',
                autoscale: 'exact'
            }
        });

        expect(queryPlotForYTicks()).toEqual(['0.0001', '0.001', '0.01', '0.1', '1', '10', '100', '1000', '10000']);
    });

    it('should allow a user specified tick formatter', function() {
        var logdata1 = [
            [0, 0.0001],
            [1, 0.001],
            [2, 0.01],
            [3, 0.1],
            [4, 1],
            [5, 10],
            [6, 100],
            [7, 1000],
            [8, 10000]
        ];

        $.plot(placeholder, [logdata1], {
            yaxis: {
                mode: 'log',
                tickFormatter: function () {
                    return 'log tick';
                },
                autoscale: 'exact'
            }
        });

        expect(queryPlotForYTicks()).toEqual(['log tick', 'log tick', 'log tick', 'log tick', 'log tick', 'log tick', 'log tick', 'log tick', 'log tick']);
    });

    it('should set the minimum of the logaxis to minimum datapoint between 0 and 0.1', function() {
        var logdata1 = [
            [0, 0],
            [1, 0.0001],
            [2, 0.001],
            [3, 0.01],
            [4, 0.1],
            [5, 1],
            [6, 10],
            [7, 100]
        ];

        var plot = $.plot(placeholder, [logdata1], {
                xaxis: {
                    mode: 'log',
                    autoscale: 'exact'
                },
                yaxis: {
                    mode: 'log',
                    autoscale: 'exact'
                }
            }),
            axes = plot.getAxes();

        expect(axes.xaxis.min).toBe(0.1);
        expect(axes.yaxis.min).toBe(0.0001);
    });

    it('should extend PREFERRED_LOG_TICK_VALUES if too little interval', function() {
        var logdata = [
            [[0, 1E40], [1, 4E40], [2, 8E40], [3, 2E41], [4, 6E41], [5, 9E41], [6, 3E42]],
            [[0, 1E38], [1, 4E39], [2, 8E40], [3, 2E41]],
            [[0, 1], [1, 3], [2, 10], [3, 30], [4, 40], [5, 50]]
        ],
            expectedTicks = [
            ['1e40', '5e40', '1e41', '5e41', '10e41'],
            [ '1e38', '5e38', '10e38', '5e39', '1e40', '5e40', '1e41'],
            ['1', '5', '10', '50']
        ],
            plot, i;

        for (i = 0; i < logdata.length; i++) {
            plot = $.plot(placeholder, [logdata[i]], {
                  yaxis: {
                      mode: 'log',
                      autoscale: 'exact'
                  }
                }),
            ticks = queryPlotForYTicks();
            expect(queryPlotForYTicks()).toEqual(expectedTicks[i]);
        }
    });

});
