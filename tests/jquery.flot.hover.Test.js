describe("flot hover plugin", function () {
    var placeholder, plot, options;

    beforeEach(function () {
        placeholder = setFixtures('<div id="test-container" style="width: 600px;height: 400px">')
            .find('#test-container');
        options = {
            grid: { hoverable: true, clickable: true },
            pan: { enableTouch: true, active: true },
            series: {
                lines: {
                    show: true
                },
                points: {
                    show: false
                }
            }
        };

        jasmine.clock().install().mockDate();
    });

    afterEach(function() {
        jasmine.clock().uninstall();
    });

    it('tap on plot triggers plothover event', function() {
        plot = $.plot(placeholder, [
            [
                [0, 0],
                [10, 10]
            ]
        ], options);

        var eventHolder = plot.getEventHolder(),
            axisx = plot.getXAxes()[0],
            axisy = plot.getYAxes()[0],
            coords = [{x: axisx.p2c(0.5), y: axisy.p2c(-3.5)}],
            spy = jasmine.createSpy('spy');

        $(plot.getPlaceholder()).on('plothover', spy);

        simulate.sendTouchEvents(coords, eventHolder, 'touchstart');
        jasmine.clock().tick(50);
        simulate.sendTouchEvents(coords, eventHolder, 'touchend');

        expect(spy).toHaveBeenCalled();
        expect(spy.calls.count()).toBe(1);
    });
});
