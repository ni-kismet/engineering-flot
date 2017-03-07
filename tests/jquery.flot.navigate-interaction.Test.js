/* global $, describe, it, xit, xdescribe, after, afterEach, expect*/

describe("flot navigate plugin interactions", function () {
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

        xaxis = plot.getXAxes()[0];
        yaxis = plot.getYAxes()[0];

        expect(xaxis.min).toBe(-10);
        expect(xaxis.max).toBe(0);
        expect(yaxis.min).toBe(0);
        expect(yaxis.max).toBe(10);
    });


    it('zooms on mouse scroll', function () {
        plot = $.plot(placeholder, [
            []
        ], options);

        eventHolder = placeholder.find('.flot-overlay');
        eventHolder.trigger("mousewheel", {intDelta:0, deltaX:1, deltaY:0});

        expect(true).toBe(false);
    });
});
