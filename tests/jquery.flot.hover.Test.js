describe("flot navigate plugin", function () {
    var placeholder, plot, options;

    beforeEach(function () {
        placeholder = setFixtures('<div id="test-container" style="width: 600px;height: 400px">')
            .find('#test-container');
        options = {
            xaxes: [{ autoScale: 'exact' }],
            yaxes: [{ autoScale: 'exact' }],
            zoom: { interactive: true, active: true, amount: 10 },
            pan: { interactive: true, active: true, frameRate: -1 }
        };
    });

    xit('on plot triggers plothover event', function() {
        plot = $.plot(placeholder, [
            [
                [0, 0],
                [10, 10]
            ]
        ], options);

        var eventHolder = plot.getEventHolder(),
            axisx = plot.getXAxes()[0],
            axisy = plot.getYAxes()[0],
            pointCoords = { x: axisx.p2c(0.5), y: axisy.p2c(0) },
            spy = jasmine.createSpy('spy');

        $(plot.getPlaceholder()).on('plothover', spy);

        simulate.click(eventHolder, pointCoords.x, pointCoords.y);

        expect(spy).toHaveBeenCalled();
        expect(spy.calls.count()).toBe(1);
    });
});
