/* eslint-disable */
/* global $, describe, it, xit, xdescribe, after, afterEach, expect*/

describe("flot touch plugin", function () {
    var placeholder, plot, options;

    beforeEach(function () {
        placeholder = setFixtures('<div id="test-container" style="width: 600px;height: 400px">')
            .find('#test-container');
        options = {
            xaxes: [{ autoscale: 'exact' }],
            yaxes: [{ autoscale: 'exact' }],
            zoom: { interactive: true, amount: 10, highlighted: true },
            pan: { interactive: true, frameRate: -1, enableTouch: true, highlighted: true }
        };
    });

    it('shows that the eventHolder is cleared through shutdown when the plot is replaced', function() {
        plot = $.plot(placeholder, [[]], options);

        var eventPlaceholder = plot.getEventHolder();
            spy = spyOn(eventPlaceholder, 'removeEventListener').and.callThrough();

        plot = $.plot(placeholder, [[]], options);

        expect(spy).toHaveBeenCalledWith('touchstart', jasmine.any(Function))
        expect(spy).toHaveBeenCalledWith('touchmove', jasmine.any(Function));
        expect(spy).toHaveBeenCalledWith('touchend', jasmine.any(Function));
    });

    describe('long tap', function() {

        beforeEach(function() {
            jasmine.clock().install().mockDate();
        });

        afterEach(function() {
            jasmine.clock().uninstall();
        });

        it('should trigger the long tap event',function() {
            plot = $.plot(placeholder, [[]], options);

            var eventHolder = plot.getEventHolder(),
                spy = jasmine.createSpy('long tap handler'),
                coords = [{x: 10, y: 20}];

            eventHolder.addEventListener('longtap', spy);

            simulate.sendTouchEvents(coords, eventHolder, 'touchstart');
            jasmine.clock().tick(1600);
            jasmine.clock().tick(1600);
            jasmine.clock().tick(1600);

            expect(spy).toHaveBeenCalled();
            expect(spy.calls.count()).toBe(1);
        });

        it('should trigger the long tap event even when there is a small move of the touch point',function() {
            plot = $.plot(placeholder, [[]], options);

            var eventHolder = plot.getEventHolder(),
                spy = jasmine.createSpy('long tap handler'),
                initialCoords = [{x: 10, y: 20}],
                finalCoords = [{x: 11, y: 21}];

            eventHolder.addEventListener('longtap', spy);

            simulate.sendTouchEvents(initialCoords, eventHolder, 'touchstart');
            simulate.sendTouchEvents(finalCoords, eventHolder, 'touchmove');
            jasmine.clock().tick(1600);

            expect(spy).toHaveBeenCalled();
            expect(spy.calls.count()).toBe(1);
        });

        it('should not trigger the long tap event when there is a large move of the touch point',function() {
            plot = $.plot(placeholder, [[]], options);

            var eventHolder = plot.getEventHolder(),
                spy = jasmine.createSpy('long tap handler'),
                initialCoords = [{x: 10, y: 20}],
                finalCoords = [{x: 100, y: 200}];

            eventHolder.addEventListener('longtap', spy);

            simulate.sendTouchEvents(initialCoords, eventHolder, 'touchstart');
            simulate.sendTouchEvents(finalCoords, eventHolder, 'touchmove');
            jasmine.clock().tick(1600);

            expect(spy).not.toHaveBeenCalled();
        });

        it('should not trigger the long tap event when the touch ends too soon',function() {
            plot = $.plot(placeholder, [[]], options);

            var eventHolder = plot.getEventHolder(),
                spy = jasmine.createSpy('long tap handler'),
                coords = [{x: 10, y: 20}];

            eventHolder.addEventListener('longtap', spy);

            simulate.sendTouchEvents(coords, eventHolder, 'touchstart');
            jasmine.clock().tick(1400);
            simulate.sendTouchEvents(coords, eventHolder, 'touchend');
            jasmine.clock().tick(200);

            expect(spy).not.toHaveBeenCalled();
        });

        it('should not trigger the long tap event when the plot is replaced', function() {
            plot = $.plot(placeholder, [[]], options);

            var eventHolder = plot.getEventHolder(),
                spy = jasmine.createSpy('long tap handler'),
                coords = [{x: 10, y: 20}];

            eventHolder.addEventListener('longtap', spy);

            simulate.sendTouchEvents(coords, eventHolder, 'touchstart');
            plot = $.plot(placeholder, [[]], options);
            jasmine.clock().tick(1600);

            expect(spy).not.toHaveBeenCalled();
        });

        it('should trigger multiple long tap events',function() {
            plot = $.plot(placeholder, [[]], options);

            var eventHolder = plot.getEventHolder(),
                spy = jasmine.createSpy('long tap handler'),
                coords = [{x: 10, y: 20}];

            eventHolder.addEventListener('longtap', spy);

            simulate.sendTouchEvents(coords, eventHolder, 'touchstart');
            jasmine.clock().tick(1600);
            simulate.sendTouchEvents(coords, eventHolder, 'touchend');
            simulate.sendTouchEvents(coords, eventHolder, 'touchstart');
            jasmine.clock().tick(1600);
            simulate.sendTouchEvents(coords, eventHolder, 'touchend');

            expect(spy).toHaveBeenCalled();
            expect(spy.calls.count()).toBe(2);
        });
    });

    describe('pinch', function() {

        beforeEach(function() {
            jasmine.clock().install().mockDate();
        });

        afterEach(function() {
            jasmine.clock().uninstall();
        });

        it('should be able to trigger pinchstart event',function() {
            plot = $.plot(placeholder, [[]], options);

            var eventHolder = plot.getEventHolder(),
                spy = jasmine.createSpy('pinch handler'),
                coords = [{x: 10, y: 20}, {x: 15, y: 20}];

            eventHolder.addEventListener('pinchstart', spy);

            simulate.sendTouchEvents(coords, eventHolder, 'touchstart');

            expect(spy).toHaveBeenCalled();
            expect(spy.calls.count()).toBe(1);
        });

        it('should not trigger pinch event for highlighted false',function() {
            plot = $.plot(placeholder, [
                [
                    [0, 0],
                    [10, 10]
                ]
                ], {
                xaxes: [{ autoscale: 'exact' }],
                yaxes: [{ autoscale: 'exact' }],
                zoom: { interactive: true, highlighted: false, amount: 10 },
                pan: { interactive: true, highlighted: false, frameRate: -1 }
            });

            var eventHolder = plot.getEventHolder(),
                spy = jasmine.createSpy('pinch handler'),
                coords = [{x: 10, y: 20}, {x: 15, y: 20}];

            eventHolder.addEventListener('pinchstart', spy);

            simulate.sendTouchEvents(coords, eventHolder, 'touchstart');

            expect(spy).not.toHaveBeenCalled();
            expect(spy.calls.count()).toBe(0);
        });

        it('should not trigger pinch event for only one touch',function() {
            plot = $.plot(placeholder, [[]], options);

            var eventHolder = plot.getEventHolder(),
                spy = jasmine.createSpy('pinch handler'),
                coords = [{x: 10, y: 20}];

            eventHolder.addEventListener('pinchstart', spy);

            simulate.sendTouchEvents(coords, eventHolder, 'touchstart');

            expect(spy).not.toHaveBeenCalled();
            expect(spy.calls.count()).toBe(0);
        });

        it('should not trigger pinch event for touch outside plot',function() {
            plot = $.plot(placeholder, [[]], options);

            var eventHolder = plot.getEventHolder(),
                mockEventHolder = {},
                spy = jasmine.createSpy('pinch handler'),
                coords = [{x: 10, y: 20}, {x: 15, y: 20}];

            eventHolder.addEventListener('pinchstart', spy);

            mockEventHolder.dispatchEvent = function() {};

            simulate.sendTouchEvents(coords, mockEventHolder, 'touchstart');

            expect(spy).not.toHaveBeenCalled();
            expect(spy.calls.count()).toBe(0);
        });
    });

    describe('pan', function() {

        beforeEach(function() {
            jasmine.clock().install().mockDate();
        });

        afterEach(function() {
            jasmine.clock().uninstall();
        });

        it('should be able to trigger pan event',function() {
            plot = $.plot(placeholder, [[]], options);

            var eventHolder = plot.getEventHolder(),
                spy = jasmine.createSpy('pan handler'),
                coords = [{x: 10, y: 20}];

            eventHolder.addEventListener('pan', spy);

            simulate.sendTouchEvents(coords, eventHolder, 'pan');

            expect(spy).toHaveBeenCalled();
            expect(spy.calls.count()).toBe(1);
        });

        it('should not trigger pan event for highlighted false',function() {
            plot = $.plot(placeholder, [
                [
                    [0, 0],
                    [10, 10]
                ]
                ], {
                xaxes: [{ autoscale: 'exact' }],
                yaxes: [{ autoscale: 'exact' }],
                zoom: { interactive: true, highlighted: false, amount: 10 },
                pan: { interactive: true, highlighted: false, frameRate: -1 }
            });

            var eventHolder = plot.getEventHolder(),
                spy = jasmine.createSpy('pan handler'),
                coords = [{x: 10, y: 20}];

            eventHolder.addEventListener('pan', spy);

            simulate.sendTouchEvents(coords, eventHolder, 'touchstart');

            expect(spy).not.toHaveBeenCalled();
            expect(spy.calls.count()).toBe(0);
        });

        it('should not trigger pan event for touch outside plot',function() {
            plot = $.plot(placeholder, [[]], options);

            var eventHolder = plot.getEventHolder(),
                mockEventHolder = {},
                spy = jasmine.createSpy('pan handler'),
                coords = [{x: 10, y: 20}];

            eventHolder.addEventListener('panstart', spy);

            mockEventHolder.dispatchEvent = function() {};

            simulate.sendTouchEvents(coords, mockEventHolder, 'touchstart');

            expect(spy).not.toHaveBeenCalled();
            expect(spy.calls.count()).toBe(0);
        });
    });
});
