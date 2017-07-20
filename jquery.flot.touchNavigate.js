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
            prevTapTime = 0,
            axis = null,
            xAxisTouched = false,
            yAxisTouched = false;

        function isPinchEvent(e) {
            return e.touches && e.touches.length === 2;
        }

        function onDragStart(e) {
            e.stopPropagation();
            e.preventDefault();

            twoTouches = isPinchEvent(e);
            if (!twoTouches) {
                // get the axis which one finger touches
                var ec = plot.getPlaceholder().offset();
                ec.left = e.touches[0].pageX - ec.left;
                ec.top = e.touches[0].pageY - ec.top;

                axis = plot.getXAxes().concat(plot.getYAxes()).filter(function (axis) {
                    var box = axis.box;
                    return (ec.left > box.left) && (ec.left < box.left + box.width) &&
                        (ec.top > box.top) && (ec.top < box.top + box.height);
                });

                // if no axis is touched, behave normally
                if (axis.length === 0) {
                    axis = undefined;
                    prevTapX = prevPanX;
                    prevTapY = prevPanY;
                    prevPanX = e.touches[0].pageX;
                    prevPanY = e.touches[0].pageY;
                } else {
                    // compute values only for the touched axis direction
                    if (axis[0].direction === 'x') {
                        xAxisTouched = true;
                        yAxisTouched = false;
                        prevTapX = prevPanX;
                        prevPanX = e.touches[0].pageX;
                    } else if (axis[0].direction === 'y') {
                        yAxisTouched = true;
                        xAxisTouched = false;
                        prevTapY = prevPanY;
                        prevPanY = e.touches[0].pageY;
                    }
                }
            } else {
                // get the axis which two fingers touch
                ec = plot.getPlaceholder().offset();
                ec.left = (e.touches[0].pageX + e.touches[1].pageX) / 2 - ec.left;
                ec.top = (e.touches[0].pageY + e.touches[1].pageY) / 2 - ec.top;

                axis = plot.getXAxes().concat(plot.getYAxes()).filter(function (axis) {
                    var box = axis.box;
                    return (ec.left > box.left) && (ec.left < box.left + box.width) &&
                        (ec.top > box.top) && (ec.top < box.top + box.height);
                });

                prevDist = pinchDistance(e);
                // if no axis is touched, behave normally
                if (axis.length === 0) {
                    axis = undefined;
                    prevPanX = (e.touches[0].pageX + e.touches[1].pageX) / 2;
                    prevPanY = (e.touches[0].pageY + e.touches[1].pageY) / 2;
                } else {
                    // compute values only for the touched axis direction
                    if (axis[0].direction === 'x') {
                        xAxisTouched = true;
                        yAxisTouched = false;
                        prevPanX = (e.touches[0].pageX + e.touches[1].pageX) / 2;
                    } else if (axis[0].direction === 'y') {
                        yAxisTouched = true;
                        xAxisTouched = false;
                        prevPanY = (e.touches[0].pageY + e.touches[1].pageY) / 2;
                    }
                }
            }
        }

        function onDrag(e) {
            twoTouches = isPinchEvent(e);
            if (twoTouches) {
                // send the computed touched axis to the pan function so that it only pans on that one
                plot.pan({
                    left: (e.touches[0].pageX + e.touches[1].pageX) / 2 - prevPanX,
                    top: (e.touches[0].pageY + e.touches[1].pageY) / 2 - prevPanY,
                    axes: axis
                });
                // update previous pans based on which axis was touched (none/x/y)
                if (axis === undefined) {
                    prevPanX = (e.touches[0].pageX + e.touches[1].pageX) / 2;
                    prevPanY = (e.touches[0].pageY + e.touches[1].pageY) / 2;
                } else if (xAxisTouched) {
                    prevPanX = (e.touches[0].pageX + e.touches[1].pageX) / 2;
                } else if (yAxisTouched) {
                    prevPanY = (e.touches[0].pageY + e.touches[1].pageY) / 2;
                }

                var dist = pinchDistance(e);
                onZoomPinch(e);
                prevDist = dist;
            } else {
                // send the computed touched axis to the pan function so that it only pans on that one
                plot.pan({
                    left: (e.touches[0].pageX - prevPanX),
                    top: (e.touches[0].pageY - prevPanY),
                    axes: axis
                });
                // update previous pans based on which axis was touched (none/x/y)
                if (axis === undefined) {
                    prevPanX = e.touches[0].pageX;
                    prevPanY = e.touches[0].pageY;
                } else if (xAxisTouched) {
                    prevPanX = e.touches[0].pageX;
                } else if (yAxisTouched) {
                    prevPanY = e.touches[0].pageY;
                }
            }
        }

        function onDragEnd(e) {
            if (!isPinchEvent(e)) {
                prevDist = null;
                if (twoTouches && e.touches.length === 1) {
                    prevPanX = e.touches[0].pageX;
                    prevPanY = e.touches[0].pageY;
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
                midPointX = (e.touches[0].pageX + e.touches[1].pageX) / 2,
                midPointY = (e.touches[0].pageY + e.touches[1].pageY) / 2,
                zoomAmount = pinchDistance(e) / prevDist;

            center.left = midPointX - offset.left;
            center.top = midPointY - offset.top;

            // send the computed touched axis to the zoom function so that it only zooms on that one
            plot.zoom({
                center: center,
                amount: zoomAmount,
                axes: axis
            });
        }

        function distance(x1, y1, x2, y2) {
            return Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));
        }

        function pinchDistance(e) {
            var t1 = e.touches[0],
                t2 = e.touches[1];
            return distance(t1.pageX, t1.pageY, t2.pageX, t2.pageY);
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
