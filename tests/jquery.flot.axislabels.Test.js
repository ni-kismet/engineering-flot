/* eslint-disable */
/* global $, describe, it, xit, xdescribe, after, afterEach, expect*/

describe("flot axis labels plugin", function() {
    var placeholder, plot;
    var options;

    beforeEach(function() {
        options = {
            xaxes: [
                { position: 'bottom', axisLabel: 'Bottom 1' },
                { position: 'bottom', axisLabel: 'Bottom 2', show: true },
            ],
            yaxes: [
                { position: 'left', axisLabel: 'Left' },
                { position: 'right', axisLabel: 'Right', show: true }
            ]
        };

        placeholder = setFixtures('<div id="test-container" style="width: 600px;height: 400px">')
            .find('#test-container');
    });

    it('creates a html text node for each axis label', function () {
        plot = $.plot(placeholder, [[]], options);

        var labels$ = $('.axisLabels'),
            labels = labels$.map(function(i, label) {
                return label.innerText;
            }).get();
        expect(labels.length).toBe(4);
        expect(labels).toContain(options.xaxes[0].axisLabel);
        expect(labels).toContain(options.xaxes[1].axisLabel);
        expect(labels).toContain(options.yaxes[0].axisLabel);
        expect(labels).toContain(options.yaxes[1].axisLabel);
    });

    it('doesn`t create a html text node for each axis label when the plugin is disabled', function () {
        options.axisLabels = {
            show: false
        };
        plot = $.plot(placeholder, [[]], options);

        var labels$ = $('.axisLabels'),
            labels = labels$.map(function(i, label) {
                return label.innerText;
            }).get();
        expect(labels.length).toBe(0);
    });

    it('shrinks the drawing area to make space for the axis labels', function () {
        plot = $.plot(placeholder, [[]], options);
        var width = plot.width(),
            height = plot.height();

        options.axisLabels = {
            show: false
        };
        plot = $.plot(placeholder, [[]], options);
        var widthNoLabels = plot.width(),
            heightNoLabels = plot.height();

        expect(widthNoLabels).toBeGreaterThan(width);
        expect(heightNoLabels).toBeGreaterThan(height);
    });

});
