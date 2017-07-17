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
        var prevPanX = 0,
            prevPanY = 0,
            prevTapX = 0,
            prevTapY = 0,
            prevDist = null,
            twoTouches = false,
            prevTapTime = 0;

        function isPinchEvent(e) {
            return e.touches && e.touches.length === 2;
        }

        function onDragStart(e) {
            e.stopPropagation();
            e.preventDefault();

            twoTouches = isPinchEvent(e);
            if (!twoTouches) {
                prevTapX = prevPanX;
                prevTapY = prevPanY;
                prevPanX = e.touches[0].clientX;
                prevPanY = e.touches[0].clientY;
            } else {
                prevDist = pinchDistance(e);
                prevPanX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
                prevPanY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
            }
        }

        function onDrag(e) {
            twoTouches = isPinchEvent(e);
            if (twoTouches) {
                plot.pan({
                    left: (e.touches[0].clientX + e.touches[1].clientX) / 2 - prevPanX,
                    top: (e.touches[0].clientY + e.touches[1].clientY) / 2 - prevPanY
                });
                prevPanX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
                prevPanY = (e.touches[0].clientY + e.touches[1].clientY) / 2;

                var dist = pinchDistance(e);
                onZoomPinch(e);
                prevDist = dist;
            } else {
                plot.pan({
                    left: (e.touches[0].clientX - prevPanX),
                    top: (e.touches[0].clientY - prevPanY)
                });
                prevPanX = e.touches[0].clientX;
                prevPanY = e.touches[0].clientY;
            }
        }

        function onDragEnd(e) {
            if (!isPinchEvent(e)) {
                prevDist = null;
                if (twoTouches && e.touches.length === 1) {
                    prevPanX = e.touches[0].clientX;
                    prevPanY = e.touches[0].clientY;
                } else if (!twoTouches) {
                    var currentTime = new Date().getTime(),
                        intervalBetweenTaps = currentTime - prevTapTime,
                        maxDistanceBetweenTaps = 50,
                        maxIntervalBetweenTaps = 500;

                    if (intervalBetweenTaps >= 0 && intervalBetweenTaps < maxIntervalBetweenTaps) {
                        if (distance(prevTapX, prevTapY, prevPanX, prevPanY) < maxDistanceBetweenTaps) {
                            plot.recenter();
                        }
                    }
                    prevTapTime = currentTime;
                }
            }
        }

        function onZoomPinch(e) {
            var offset = plot.offset(),
                center = {
                    left: 0,
                    top: 0
                },
                midPointX = (e.touches[0].clientX + e.touches[1].clientX) / 2,
                midPointY = (e.touches[0].clientY + e.touches[1].clientY) / 2,
                zoomAmount = pinchDistance(e) / prevDist;

            center.left = midPointX - offset.left;
            center.top = midPointY - offset.top;

            var ec = plot.getPlaceholder().offset();
            ec.left = midPointX - ec.left;
            ec.top = midPointY - ec.top;

            var axes = plot.getXAxes().concat(plot.getYAxes()).filter(function (axis) {
                var box = axis.box;
                return (ec.left > box.left) && (ec.left < box.left + box.width) &&
                        (ec.top > box.top) && (ec.top < box.top + box.height);
            });

            if (axes.length === 0) {
                axes = undefined;
            }

            plot.zoom({
                center: center,
                amount: zoomAmount
            });
        }

        function distance(x1, y1, x2, y2) {
            return Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));
        }

        function pinchDistance(e) {
            var t1 = e.touches[0],
                t2 = e.touches[1];
            return distance(t1.clientX, t1.clientY, t2.clientX, t2.clientY);
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
        version: '0.3'
    });
})(jQuery);
