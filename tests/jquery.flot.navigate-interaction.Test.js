/* global $, describe, it, xit, xdescribe, after, afterEach, expect*/

describe("flot navigate plugin interactions", function () {
    'use strict';

    var placeholder, plot, eventHolder;
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

    it('pans on mouse drag', function () {
        plot = $.plot(placeholder, [
            [[0, 0],
            [10, 10]]
        ], options);

        eventHolder = placeholder.find('.flot-overlay');

        simulate.mouseDown(eventHolder[0], 10, 20);
        simulate.mouseMove(eventHolder[0], 10, 20);
        simulate.mouseMove(eventHolder[0], 10 + plot.width(), 20);
        simulate.mouseUp(eventHolder[0], 10 + plot.width(), 20);

        var xaxis = plot.getXAxes()[0];
        var yaxis = plot.getYAxes()[0];

        expect(xaxis.min).toBe(-10);
        expect(xaxis.max).toBe(0);
        expect(yaxis.min).toBe(0);
        expect(yaxis.max).toBe(10);
    });

    it('zooms out on mouse scroll down', function () {
        plot = $.plot(placeholder, [
            [[0, 0],
            [10, 10]]
        ], options);

        var bbox = placeholder[0].getBoundingClientRect();
        var xaxis = plot.getXAxes()[0];
        var yaxis = plot.getYAxes()[0];

        var clientX = plot.getPlotOffset().left + xaxis.p2c(0);
        var clientY = plot.getPlotOffset().top + yaxis.p2c(0);

        eventHolder = placeholder.find('.flot-overlay');
        simulate.mouseWheel(eventHolder[0], clientX, clientY, 3);

        expect(xaxis.min).toBe(0);
        expect(xaxis.max).toBe(100);
        expect(yaxis.min).toBe(0);
        expect(yaxis.max).toBeCloseTo(100, 7);
    });

    it('zooms in on mouse scroll up', function () {
        plot = $.plot(placeholder, [
            [[0, 0],
            [10, 10]]
        ], options);

        var bbox = placeholder[0].getBoundingClientRect();
        var xaxis = plot.getXAxes()[0];
        var yaxis = plot.getYAxes()[0];

        var clientX = plot.getPlotOffset().left + xaxis.p2c(0);
        var clientY = plot.getPlotOffset().top + yaxis.p2c(0);

        eventHolder = placeholder.find('.flot-overlay');
        simulate.mouseWheel(eventHolder[0], clientX, clientY, -3);

        expect(xaxis.min).toBe(0);
        expect(xaxis.max).toBe(1);
        expect(yaxis.min).toBe(0);
        expect(yaxis.max).toBe(1);
    });

});
