/* global jQuery */

(function($) {
    'use strict';

    var options = {
        pan: {
            enableTouch: false
        }
    };

    function init(plot) {
        plot.hooks.processOptions.push(initTouchNavigation);
    }

    function initTouchNavigation(plot, options) {
        var prevPageX = 0,
            prevPageY = 0,
            scaling = false,
            lastTapTime = 0,
            lastTapX = 0,
            lastTapY = 0,
            timeout,
            prevDist = null;

        function isPinchEvent(e) {
            return e.touches && e.touches.length === 2;
        }

        function onDragStart(e) {
            e.stopPropagation();
            e.preventDefault();

            scaling = isPinchEvent(e);
            if (!scaling) {
                lastTapX = prevPageX;
                lastTapY = prevPageY;

                prevPageX = e.touches[0].clientX;
                prevPageY = e.touches[0].clientY;
            } else if (scaling) {
                prevDist = pinchDistance(e);
                prevPageX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
                prevPageY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
            }
        }

        function onDrag(e) {
            scaling = isPinchEvent(e);
            if (scaling) {
                plot.pan({
                    left: (e.touches[0].clientX + e.touches[1].clientX) / 2 - prevPageX,
                    top: (e.touches[0].clientY + e.touches[1].clientY) / 2 - prevPageY
                });
                prevPageX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
                prevPageY = (e.touches[0].clientY + e.touches[1].clientY) / 2;

                var dist = pinchDistance(e);
                onZoomPinch(e);
                prevDist = dist;

            } else if (!scaling) {
                plot.pan({
                    left: (e.touches[0].clientX - prevPageX),
                    top: (e.touches[0].clientY - prevPageY)
                });
                prevPageX = e.touches[0].clientX;
                prevPageY = e.touches[0].clientY;
            }
        }

        function onDragEnd(e) {
            var xaxis = plot.getXAxes()[0],
                yaxis = plot.getYAxes()[0];
            if (!isPinchEvent(e)) {
                prevDist = null;
                if (scaling && e.touches[0]) {
                    prevPageX = e.touches[0].clientX;
                    prevPageY = e.touches[0].clientY;
                } else {
                    var currentTime = new Date().getTime();
                    var tapLength = currentTime - lastTapTime;
                    if (tapLength < 500 && tapLength > 0) {
                        if (distance(xaxis.c2p(lastTapX - plot.offset().left), yaxis.c2p(lastTapY - plot.offset().top),
                                    xaxis.c2p(prevPageX - plot.offset().left), yaxis.c2p(prevPageY - plot.offset().top)) < 0.2) {
                            console.log("double tap");
                            plot.recenter();
                            event.preventDefault();
                        }
                    }
                    lastTapTime = currentTime;
                }
            }
        }

        function onZoomPinch(e) {
            var offset = plot.offset(),
                center = {
                    left: 0,
                    top: 0
                },
                pageX = (e.touches[0].clientX + e.touches[1].clientX) / 2,
                pageY = (e.touches[0].clientY + e.touches[1].clientY) / 2,
                amount = pinchDistance(e) / prevDist;

            center.left = pageX - offset.left;
            center.top = pageY - offset.top;

            plot.zoom({
                center: center,
                amount: amount
            });
        }

        function pinchDistance(e) {
            var dist = Math.sqrt((e.touches[0].clientX - e.touches[1].clientX) * (e.touches[0].clientX - e.touches[1].clientX) +
            (e.touches[0].clientY - e.touches[1].clientY) * (e.touches[0].clientY - e.touches[1].clientY));
            return dist;
        }

        function distance(x1, y1, x2, y2) {
            return Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));
        }

        function bindEvents(plot, eventHolder) {
            var o = plot.getOptions();

            if (o.pan.interactive) {
                eventHolder[0].addEventListener("touchstart", onDragStart, false);
                eventHolder[0].addEventListener("touchmove", onDrag, false);
                eventHolder[0].addEventListener("touchend", onDragEnd, false);
            }
        }

        function shutdown(plot, eventHolder) {
            eventHolder[0].removeEventListener("touchstart", onDragStart);
            eventHolder[0].removeEventListener('touchmove', onDrag);
            eventHolder[0].removeEventListener('touchend', onDragEnd);
        }

        if (options.pan.enableTouch === true) {
            plot.hooks.bindEvents.push(bindEvents);
            plot.hooks.shutdown.push(shutdown);
        }
    }

    $.plot.plugins.push({
        init: init,
        options: options,
        name: 'navigateTouch',
        version: '0.2'
    });
})(jQuery);
