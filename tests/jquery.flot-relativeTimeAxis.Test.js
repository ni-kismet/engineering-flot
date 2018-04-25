/* global describe, it, beforeEach, afterEach, expect, setFixtures */
/* jshint browser: true*/

describe('A Flot chart with relative time axes', function () {
    'use strict';

    var plot;
    var placeholder;

    beforeEach(function () {
        var fixture = setFixtures('<div id="demo-container" style="width: 800px;height: 600px">').find('#demo-container').get(0);

        placeholder = $('<div id="placeholder" style="width: 100%;height: 100%">');
        placeholder.appendTo(fixture);
    });

    afterEach(function () {
        if (plot) {
            plot.shutdown();
        }
    });

    var firstAndLast = function (arr) {
        return [arr[0], arr[arr.length - 1]];
    };

    var createPlotWithRelativeTimeAxisNoPlotData = function (placeholder) {
        return $.plot(placeholder, [], {
            xaxis: {
                show: true,
                format: 'time',
                timeformat: '%r'
            },
            yaxis: {
                show: true
            }
        });
    };

    var createPlotWithRelativeTimeAxis = function (placeholder, data, formatString) {
        var plot = $.plot(placeholder, [[[0, 0]]], {
            xaxis: {
                format: 'time',
                timeformat: '%r' + (formatString !== undefined ? '<' + formatString + '>' : ""),
                showTickLabels: 'all'
            },
            yaxis: {}
        });
        plot.setData(data);
        plot.setupGrid();
        plot.draw();
        return plot;
    };

    var createPlotWithVerticalRelativeTimeAxis = function (placeholder, data) {
        return $.plot(placeholder, data, {
            xaxis: {
            },
            yaxis: {
                format: 'time',
                timeformat: '%r',
                autoScaleMargin: 0,
                autoScale: 'exact'
            }
        });
    };

    it('shows time ticks when there is no plot data', function () {
        plot = createPlotWithRelativeTimeAxisNoPlotData(placeholder);

        var ticks = firstAndLast(plot.getAxes().xaxis.ticks);
        expect(ticks[0]).not.toEqual(ticks[1]);
    });

    it('shows time ticks', function () {
        plot = createPlotWithRelativeTimeAxis(placeholder, [[[0, 1], [1, 2]]]);

        expect(firstAndLast(plot.getAxes().xaxis.ticks)).toEqual([{v: 0, label: '00:00:00.000'}, {v: 1, label: '00:00:01.000'}]);
    });

    it('shows time bigger than 1 second correctly', function () {
        plot = createPlotWithRelativeTimeAxis(placeholder, [[[1, 1], [2, 2]]]);

        expect(firstAndLast(plot.getAxes().xaxis.ticks)).toEqual([{v: 1, label: '00:00:01.000'}, {v: 2, label: '00:00:02.000'}]);
    });

    it('shows time bigger than 1 minute correctly', function () {
        plot = createPlotWithRelativeTimeAxis(placeholder, [[[60, 1], [70, 2]]]);

        expect(firstAndLast(plot.getAxes().xaxis.ticks)).toEqual([{v: 60, label: '00:01:00'}, {v: 70, label: '00:01:10'}]);
    });

    it('shows time bigger than 1 hour correctly', function () {
        plot = createPlotWithRelativeTimeAxis(placeholder, [[[3600, 1], [3610, 2]]]);

        expect(firstAndLast(plot.getAxes().xaxis.ticks)).toEqual([{v: 3600, label: '01:00:00'}, {v: 3610, label: '01:00:10'}]);
    });

    it('shows time bigger than 1 day correctly', function () {
        plot = createPlotWithRelativeTimeAxis(placeholder, [[[86400, 1], [86410, 2]]]);

        expect(firstAndLast(plot.getAxes().xaxis.ticks)).toEqual([{v: 86400, label: '1.00:00:00'}, {v: 86410, label: '1.00:00:10'}]);
    });

    it('shows time bigger than 1 month correctly', function () {
        plot = createPlotWithRelativeTimeAxis(placeholder, [[[2764800, 1], [2764810, 2]]]);

        expect(firstAndLast(plot.getAxes().xaxis.ticks)).toEqual([{v: 2764800, label: '32.00:00:00'}, {v: 2764810, label: '32.00:00:10'}]);
    });

    it('shows time with milliseconds resolution correctly', function () {
        plot = createPlotWithRelativeTimeAxis(placeholder, [[[0.001, 0.1], [0.002, 0.2]]]);

        expect(firstAndLast(plot.getAxes().xaxis.ticks)).toEqual([{v: 0.001, label: '00:00:00.001'}, {v: 0.002, label: '00:00:00.002'}]);
    });

    it('shows negative time correctly', function () {
        plot = createPlotWithRelativeTimeAxis(placeholder, [[[-0.001, 0.1], [-0.002, 0.2]]]);

        expect(firstAndLast(plot.getAxes().xaxis.ticks)).toEqual([{v: -0.002, label: '-00:00:00.002'}, {v: -0.001, label: '-00:00:00.001'}]);
    });
    it('works with vertical axes', function () {
        plot = createPlotWithVerticalRelativeTimeAxis(placeholder, [[[0, 0], [1, 1]]]);

        expect(firstAndLast(plot.getAxes().yaxis.ticks)).toEqual([{v: 0, label: '00:00:00.000'}, {v: 1, label: '00:00:01.000'}]);
    });

    it('shows time relative to first data sample', function () {
        plot = $.plot(placeholder, [[[3600, 1], [4200, 2]]], {
            xaxis: {
                format: 'time',
                timeformat: '%r'
            },
            yaxis: {}
        });

        expect(firstAndLast(plot.getAxes().xaxis.ticks)).toEqual([{v: 3600, label: '00:00:00'}, {v: 4200, label: '00:10:00'}]);
    });

    it('shows time starting from 00:00:00.000 for empty graph', function () {
        var plot = $.plot(placeholder, [[]], {
            xaxis: {
                format: 'time',
                timeformat: '%r',
                min: 0
            },
            yaxis: {}
        });

        var xaxis = plot.getAxes().xaxis;

        expect(xaxis.valueOfFirstData).not.toBeDefined();
        expect(xaxis.ticks[0].label).toEqual('00:00:00.000');
    });

    it('works with multiple dataseries', function () {
        plot = $.plot(placeholder, [[[4200, 1], [4800, 2]], [[3600, 1], [4200, 2]]], {
            xaxis: {
                format: 'time',
                timeformat: '%r'
            },
            yaxis: {}
        });

        expect(firstAndLast(plot.getAxes().xaxis.ticks)).toEqual([{v: 3600, label: '00:00:00'}, {v: 4800, label: '00:20:00'}]);
    });

    it('works with multiple axis', function () {
        plot = $.plot(placeholder, [{
            data: [[4200, 1.1], [4800, 2.1]],
            xaxis: 2},
        {data: [[3600, 1], [4200, 2]],
            xaxis: 1}],
        {xaxes: [{
            format: 'time',
            timeformat: '%r'
        }, {
            position: 'top',
            format: 'time',
            timeformat: '%r'
        }],
        yaxis: {}
        });

        var xaxis1 = plot.getAxes().xaxis,
            xaxis2 = plot.getAxes().x2axis;
        expect(firstAndLast(xaxis1.ticks)).toEqual([{v: 3600, label: '00:00:00'}, {v: 4200, label: '00:10:00'}]);
        expect(firstAndLast(xaxis2.ticks)).toEqual([{v: 4200, label: '00:00:00'}, {v: 4800, label: '00:10:00'}]);
    });

    it('shows only hours and minutes with formatString: "hh:mm"', function () {
        plot = createPlotWithRelativeTimeAxis(placeholder, [[[0, 1], [60, 2]]], "hh:mm");

        expect(firstAndLast(plot.getAxes().xaxis.ticks)).toEqual([
            {v: 0, label: '00:00'},
            {v: 60, label: '00:01'}
        ]);
    });

    it('shows only hours, minutes and seconds with formatString: "hh:mm:ss"', function () {
        plot = createPlotWithRelativeTimeAxis(placeholder, [[[0, 1], [61, 2]]], "hh:mm:ss");

        expect(firstAndLast(plot.getAxes().xaxis.ticks)).toEqual([
            {v: 0, label: '00:00:00'},
            {v: 61, label: '00:01:01'}
        ]);
    });

    it('shows proper number of millisecond digits with formatString: "hh:mm:ss.SSS"', function () {
        plot = createPlotWithRelativeTimeAxis(placeholder, [[[0 + 0.5, 1], [61 + 0.001, 2]]], "hh:mm:ss.SSS");

        expect(firstAndLast(plot.getAxes().xaxis.ticks)).toEqual([
            {v: 0 + 0.5, label: '00:00:00.500'},
            {v: 61 + 0.001, label: '00:01:01.001'}
        ]);
    });
});
