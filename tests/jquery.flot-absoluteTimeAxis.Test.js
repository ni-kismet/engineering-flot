/* global describe, it, beforeEach, afterEach, expect, setFixtures */
/* jshint browser: true*/

describe('A Flot chart with absolute time axes', function () {
    'use strict';

    var plot;
    var placeholder;
    var tzDiff = (new Date(2010, 1, 1)).getTimezoneOffset() * 60;

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

    var createPlotWithAbsoluteTimeAxis = function (placeholder, data, formatString, timeEpoch) {
        return $.plot(placeholder, data, {
            xaxis: {
                format: 'time',
                formatString: formatString,
                timeformat: '%A',
                timeEpoch: timeEpoch,
                showTickLabels: 'all'
            },
            yaxis: {}
        });
    };

    var createPlotWithVerticalAbsoluteTimeAxis = function (placeholder, data) {
        return $.plot(placeholder, data, {
            xaxis: {},
            yaxis: {
                format: 'time',
                timeformat: '%A',
                autoScale: 'exact',
                showTickLabels: 'all'
            }
        });
    };

    it('shows time ticks', function () {
        plot = createPlotWithAbsoluteTimeAxis(placeholder, [[[0 + tzDiff, 1], [1 + tzDiff, 2]]]);

        expect(firstAndLast(plot.getAxes().xaxis.ticks)).toEqual([
            {v: 0 + tzDiff, label: '12:00:00.000 AM<br>1/1/0001'},
            {v: 1 + tzDiff, label: '12:00:01.000 AM<br>1/1/0001'}
        ]);
    });

    it('shows time bigger than 1 second correctly', function () {
        plot = createPlotWithAbsoluteTimeAxis(placeholder, [[[1 + tzDiff, 1], [2 + tzDiff, 2]]]);

        expect(firstAndLast(plot.getAxes().xaxis.ticks)).toEqual([
            {v: 1 + tzDiff, label: '12:00:01.000 AM<br>1/1/0001'},
            {v: 2 + tzDiff, label: '12:00:02.000 AM<br>1/1/0001'}
        ]);
    });

    it('shows time bigger than 1 minute correctly', function () {
        plot = createPlotWithAbsoluteTimeAxis(placeholder, [[[60 + tzDiff, 1], [70 + tzDiff, 2]]]);

        expect(firstAndLast(plot.getAxes().xaxis.ticks)).toEqual([
            {v: 60 + tzDiff, label: '12:01:00 AM<br>1/1/0001'},
            {v: 70 + tzDiff, label: '12:01:10 AM<br>1/1/0001'}
        ]);
    });

    it('shows time bigger than 1 hour correctly', function () {
        plot = createPlotWithAbsoluteTimeAxis(placeholder, [[[3600 + tzDiff, 1], [3610 + tzDiff, 2]]]);

        expect(firstAndLast(plot.getAxes().xaxis.ticks)).toEqual([
            {v: 3600 + tzDiff, label: '1:00:00 AM<br>1/1/0001'},
            {v: 3610 + tzDiff, label: '1:00:10 AM<br>1/1/0001'}
        ]);
    });

    it('shows time bigger than 1 day correctly', function () {
        plot = createPlotWithAbsoluteTimeAxis(placeholder, [[[86400 + tzDiff, 1], [86410 + tzDiff, 2]]]);

        expect(firstAndLast(plot.getAxes().xaxis.ticks)).toEqual([
            {v: 86400 + tzDiff, label: '12:00:00 AM<br>1/2/0001'},
            {v: 86410 + tzDiff, label: '12:00:10 AM<br>1/2/0001'}
        ]);
    });

    it('shows time bigger than 1 month correctly', function () {
        plot = createPlotWithAbsoluteTimeAxis(placeholder, [[[2764800 + tzDiff, 1], [2764810 + tzDiff, 2]]]);

        expect(firstAndLast(plot.getAxes().xaxis.ticks)).toEqual([
            {v: 2764800 + tzDiff, label: '12:00:00 AM<br>2/2/0001'},
            {v: 2764810 + tzDiff, label: '12:00:10 AM<br>2/2/0001'}
        ]);
    });

    it('shows time bigger than 1 year correctly', function () {
        plot = createPlotWithAbsoluteTimeAxis(placeholder, [[[31536000 + tzDiff, 1], [31536010 + tzDiff, 2]]]);

        expect(firstAndLast(plot.getAxes().xaxis.ticks)).toEqual([
            {v: 31536000 + tzDiff, label: '12:00:00 AM<br>1/1/0002'},
            {v: 31536010 + tzDiff, label: '12:00:10 AM<br>1/1/0002'}
        ]);
    });

    it('shows time with milliseconds resolution correctly', function () {
        plot = createPlotWithAbsoluteTimeAxis(placeholder, [[[0.001 + tzDiff, 0.1], [0.002 + tzDiff, 0.2]]]);

        expect(firstAndLast(plot.getAxes().xaxis.ticks)).toEqual([
            {v: 0.001 + tzDiff, label: '12:00:00.001 AM<br>1/1/0001'},
            {v: 0.002 + tzDiff, label: '12:00:00.002 AM<br>1/1/0001'}
        ]);
    });

    it('shows small negative time correctly', function () {
        plot = createPlotWithAbsoluteTimeAxis(placeholder, [[[-0.001 + tzDiff, 0.1], [-0.002 + tzDiff, 0.2]]]);

        expect(firstAndLast(plot.getAxes().xaxis.ticks)).toEqual([
            {v: -0.002 + tzDiff, label: '11:59:59.998 PM<br>12/31/0000'},
            {v: -0.001 + tzDiff, label: '11:59:59.999 PM<br>12/31/0000'}
        ]);
    });

    it('shows big negative time correctly', function () {
        plot = createPlotWithAbsoluteTimeAxis(placeholder, [[[-31536000 * 2 + tzDiff, 1], [-31536010 * 2 + tzDiff, 2]]]);

        expect(firstAndLast(plot.getAxes().xaxis.ticks)).toEqual([
            {v: -31536010 * 2 + tzDiff, label: '11:59:40 PM<br>1/1/-0001'},
            {v: -31536000 * 2 + tzDiff, label: '12:00:00 AM<br>1/2/-0001'}
        ]);
    });

    it('works with vertical axes', function () {
        plot = createPlotWithVerticalAbsoluteTimeAxis(placeholder, [[[0, 1 + tzDiff], [1, 2 + tzDiff]]]);

        expect(firstAndLast(plot.getAxes().yaxis.ticks)).toEqual([
            {v: 1 + tzDiff, label: '12:00:01.000 AM<br>1/1/0001'},
            {v: 2 + tzDiff, label: '12:00:02.000 AM<br>1/1/0001'}
        ]);
    });

    it('shows only hours and minutes with formatString: "hh:mm"', function () {
        plot = createPlotWithAbsoluteTimeAxis(placeholder, [[[0 + tzDiff, 1], [60 + tzDiff, 2]]], "hh:mm", new Date(Date.UTC(2000, 11, 31, 0, 0, 0)).valueOf());

        expect(firstAndLast(plot.getAxes().xaxis.ticks)).toEqual([
            {v: 0 + tzDiff, label: '12:00 AM'},
            {v: 60 + tzDiff, label: '12:01 AM'}
        ]);
    });

    it('shows 24-hour time when using "HH" in formatString', function () {
        plot = createPlotWithAbsoluteTimeAxis(placeholder, [[[0 + tzDiff, 1], [60 + tzDiff, 2]]], "HH:mm", new Date(Date.UTC(2000, 11, 31, 0, 0, 0)).valueOf());

        expect(firstAndLast(plot.getAxes().xaxis.ticks)).toEqual([
            {v: 0 + tzDiff, label: '00:00'},
            {v: 60 + tzDiff, label: '00:01'}
        ]);
    });

    it('shows only hours, minutes and seconds with formatString: "hh:mm:ss"', function () {
        plot = createPlotWithAbsoluteTimeAxis(placeholder, [[[0 + tzDiff, 1], [61 + tzDiff, 2]]], "hh:mm:ss", new Date(Date.UTC(2000, 11, 31, 0, 0, 0)).valueOf());

        expect(firstAndLast(plot.getAxes().xaxis.ticks)).toEqual([
            {v: 0 + tzDiff, label: '12:00:00 AM'},
            {v: 61 + tzDiff, label: '12:01:01 AM'}
        ]);
    });

    it('shows proper number of millisecond digits with formatString: "hh:mm:ss.SSS"', function () {
        plot = createPlotWithAbsoluteTimeAxis(placeholder, [[[0 + tzDiff + 0.5, 1], [61 + tzDiff + 0.001, 2]]], "hh:mm:ss.SSS", new Date(Date.UTC(2000, 11, 31, 0, 0, 0)).valueOf());

        expect(firstAndLast(plot.getAxes().xaxis.ticks)).toEqual([
            {v: 0 + tzDiff + 0.5, label: '12:00:00.500 AM'},
            {v: 61 + tzDiff + 0.001, label: '12:01:01.001 AM'}
        ]);
    });

    it('shows time properly with "#T" formatString"', function () {
        plot = createPlotWithAbsoluteTimeAxis(placeholder, [[[0 + tzDiff, 1], [60 + tzDiff, 2]]], "#T", new Date(Date.UTC(2000, 11, 31, 0, 0, 0)).valueOf());

        expect(firstAndLast(plot.getAxes().xaxis.ticks)).toEqual([
            {v: 0 + tzDiff, label: '12:00:00 AM'},
            {v: 60 + tzDiff, label: '12:01:00 AM'}
        ]);
    });

    it('shows time with milliseconds with "#T.SS" formatString"', function () {
        plot = createPlotWithAbsoluteTimeAxis(placeholder, [[[0 + tzDiff, 1], [60 + tzDiff, 2]]], "#T.SS", new Date(Date.UTC(2000, 11, 31, 0, 0, 0)).valueOf());

        expect(firstAndLast(plot.getAxes().xaxis.ticks)).toEqual([
            {v: 0 + tzDiff, label: '12:00:00.00 AM'},
            {v: 60 + tzDiff, label: '12:01:00.00 AM'}
        ]);
    });

    // TODO: Figure out the proper way to test localized strings of languages other than "en-us".
    // You can't set navigator.language to subvert the desired browser language. This is what the
    // implementation is using to localize.
    xit('shows localized date time properly with "#T#d" formatString"', function () {
        navigator.language = "de";
        plot = createPlotWithAbsoluteTimeAxis(placeholder, [[[0 + tzDiff, 1], [60 + tzDiff, 2]]], "#T#d", new Date(Date.UTC(2000, 11, 31, 0, 0, 0)).valueOf());

        expect(firstAndLast(plot.getAxes().xaxis.ticks)).toEqual([
            {v: 0 + tzDiff, label: '12:00:00<br>31.12.2000'},
            {v: 60 + tzDiff, label: '12:01:00<br>31.12.2000'}
        ]);
    });

    it('shows date properly with "#d" formatString"', function () {
        plot = createPlotWithAbsoluteTimeAxis(placeholder, [[[0 + tzDiff, 1], [60 + tzDiff, 2]]], "#d", new Date(Date.UTC(2000, 11, 31, 0, 0, 0)).valueOf());

        expect(firstAndLast(plot.getAxes().xaxis.ticks)).toEqual([
            {v: 0 + tzDiff, label: '12/31/2000'},
            {v: 60 + tzDiff, label: '12/31/2000'}
        ]);
    });

    it('shows days before month with format: "dd/MM"', function () {
        plot = createPlotWithAbsoluteTimeAxis(placeholder, [[[0 + tzDiff, 1], [86400 + tzDiff, 2]]], "dd/MM", new Date(Date.UTC(2000, 11, 31, 0, 0, 0)).valueOf());

        expect(firstAndLast(plot.getAxes().xaxis.ticks)).toEqual([
            {v: 0 + tzDiff, label: '31/12'},
            {v: 86400 + tzDiff, label: '01/01'}
        ]);
    });

    it('shows month before days with format: "MM/dd"', function () {
        plot = createPlotWithAbsoluteTimeAxis(placeholder, [[[0 + tzDiff, 1], [86400 + tzDiff, 2]]], "MM/dd", new Date(Date.UTC(2000, 11, 31, 0, 0, 0)).valueOf());

        expect(firstAndLast(plot.getAxes().xaxis.ticks)).toEqual([
            {v: 0 + tzDiff, label: '12/31'},
            {v: 86400 + tzDiff, label: '01/01'}
        ]);
    });

    it('shows 2-digit year with format: "MM/dd/yy"', function () {
        plot = createPlotWithAbsoluteTimeAxis(placeholder, [[[0 + tzDiff, 1], [86400 + tzDiff, 2]]], "MM/dd/yy", new Date(Date.UTC(2000, 11, 31, 0, 0, 0)).valueOf());

        expect(firstAndLast(plot.getAxes().xaxis.ticks)).toEqual([
            {v: 0 + tzDiff, label: '12/31/00'},
            {v: 86400 + tzDiff, label: '01/01/01'}
        ]);
    });

    it('shows 4-digit year with format: "MM/dd/yyyy"', function () {
        plot = createPlotWithAbsoluteTimeAxis(placeholder, [[[0 + tzDiff, 1], [86400 + tzDiff, 2]]], "MM/dd/yyyy", new Date(Date.UTC(2000, 11, 31, 0, 0, 0)).valueOf());

        expect(firstAndLast(plot.getAxes().xaxis.ticks)).toEqual([
            {v: 0 + tzDiff, label: '12/31/2000'},
            {v: 86400 + tzDiff, label: '01/01/2001'}
        ]);
    });

    it('shows both date and time with a newline with format: MM/dd/yy hh:mm', function () {
        plot = createPlotWithAbsoluteTimeAxis(placeholder, [[[0 + tzDiff, 1], [86400 + tzDiff, 2]]], "MM/dd/yy hh:mm", new Date(Date.UTC(2000, 11, 31, 0, 0, 0)).valueOf());

        expect(firstAndLast(plot.getAxes().xaxis.ticks)).toEqual([
            {v: 0 + tzDiff, label: '12:00 AM<br>12/31/00'},
            {v: 86400 + tzDiff, label: '12:00 AM<br>01/01/01'}
        ]);
    });

    describe('date generator', function () {
        it('clamps values greater than Date() range to the limit of Date()', function () {
            var dateGenerator = $.plot.dateGenerator;

            expect(dateGenerator(8640000000000001, {}).date).toEqual(new Date(8640000000000000));
            expect(dateGenerator(8640000000000002, {}).date).toEqual(new Date(8640000000000000));
            expect(dateGenerator(-8640000000000001, {}).date).toEqual(new Date(-8640000000000000));
            expect(dateGenerator(-9640000000000000, {}).date).toEqual(new Date(-8640000000000000));
        });
    });
});
