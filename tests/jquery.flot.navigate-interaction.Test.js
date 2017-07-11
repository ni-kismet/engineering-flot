/* eslint-disable */
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

        var xaxis = plot.getXAxes()[0];
        var yaxis = plot.getYAxes()[0];

        var clientX = plot.getPlotOffset().left + xaxis.p2c(0);
        var clientY = plot.getPlotOffset().top + yaxis.p2c(0);

        eventHolder = placeholder.find('.flot-overlay');
        simulate.mouseWheel(eventHolder[0], clientX, clientY, 3);

        /*
            I would really like better precission but:
                * the browsers may place the graph to fractional pixel coordinates
                * we can only deliver mouse events at integer coordinates
                * so we can't align precisely our mouse clicks with a point specified in plot coordinates
            hence our precission sucks.

            But this test isn't about precission, so we are fine
         */
        expect(xaxis.min).toBeCloseTo(0, 0);
        expect(xaxis.max).toBeCloseTo(100, 0);
        expect(yaxis.min).toBeCloseTo(0, 0);
        expect(yaxis.max).toBeCloseTo(100, 0);
    });

    it('zooms in on mouse scroll up', function () {
        plot = $.plot(placeholder, [
            [[0, 0],
            [10, 10]]
        ], options);

        var xaxis = plot.getXAxes()[0];
        var yaxis = plot.getYAxes()[0];

        var clientX = plot.getPlotOffset().left + xaxis.p2c(0);
        var clientY = plot.getPlotOffset().top + yaxis.p2c(0);

        eventHolder = placeholder.find('.flot-overlay');
        simulate.mouseWheel(eventHolder[0], clientX, clientY, -3);

        /*
            I would really like better precission but:
                * the browsers may place the graph to fractional pixel coordinates
                * we can only deliver mouse events at integer coordinates
                * so we can't align precisely our mouse clicks with a point specified in plot coordinates
            hence our precission sucks.

            But this test isn't about precission, so we are fine
         */
        expect(xaxis.min).toBeCloseTo(0, 1);
        expect(xaxis.max).toBeCloseTo(1, 1);
        expect(yaxis.min).toBeCloseTo(0, 1);
        expect(yaxis.max).toBeCloseTo(1, 1);
    });

    it('constrains the mouse scroll zoom to the hovered axis ', function () {
        plot = $.plot(placeholder, [
            [[0, 0],
            [10, 10]]
        ], options);

        var xaxis = plot.getXAxes()[0];
        var yaxis = plot.getYAxes()[0];

        var clientX = plot.getPlotOffset().left + xaxis.p2c(0);
        var clientY = xaxis.box.top + xaxis.box.height/2;

        eventHolder = placeholder.find('.flot-overlay');
        simulate.mouseWheel(eventHolder[0], clientX, clientY, -3);

        expect(xaxis.min).toBeCloseTo(0, 1);
        expect(xaxis.max).toBeCloseTo(1, 1);
        expect(yaxis.min).toBeCloseTo(0, 1);
        expect(yaxis.max).toBeCloseTo(10, 1);
    });

    it('zooms mode handles event on mouse dblclick', function () {
        plot = $.plot(placeholder, [
            [[0, 0],
            [10, 10]]
        ], {
        xaxes: [{
            autoscale: 'exact'
        }],
        yaxes: [{
            autoscale: 'exact'
        }],
        zoom: {
            interactive: false,
        },
        pan: {
            interactive: true
        },
        selection: {
            mode: 'smart',
        }});

        var xaxis = plot.getXAxes()[0];
        var yaxis = plot.getYAxes()[0];

        var clientX = plot.getPlotOffset().left + xaxis.p2c(0);
        var clientY = plot.getPlotOffset().top + yaxis.p2c(0);

        eventHolder = placeholder.find('.flot-overlay');
        var spy = spyOn(eventHolder[0], 'ondblclick').and.callThrough();

        var spyRecenter = jasmine.createSpy('spy');
        $(plot.getPlaceholder()).on('re-center', spyRecenter);

        simulate.dblclick(eventHolder[0], 10, 20);

        expect(spy).toHaveBeenCalled();
        expect(spyRecenter).toHaveBeenCalled();
    });

});
