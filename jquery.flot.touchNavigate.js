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
        var prevDist = null,
            twoTouches = false,
            prevTapTime = 0,
            axis = null,
            prevAxisTouched = 'none',
            xAxisTouched = false,
            yAxisTouched = false,
            prevPan = { x: 0, y: 0 },
            prevTap = { x: 0, y: 0 };

        function getTouchedAxis(touchPointX, touchPointY) {
            var ec = plot.getPlaceholder().offset();
            ec.left = touchPointX - ec.left;
            ec.top = touchPointY - ec.top;

            axis = plot.getXAxes().concat(plot.getYAxes()).filter(function (axis) {
                var box = axis.box;
                return (ec.left > box.left) && (ec.left < box.left + box.width) &&
                    (ec.top > box.top) && (ec.top < box.top + box.height);
            });

            return axis;
        }

        function getMidpoint(e) {
            return {
                x: (e.touches[0].pageX + e.touches[1].pageX) / 2,
                y: (e.touches[0].pageY + e.touches[1].pageY) / 2
            }
        }

        function getPoint(e) {
            return {
                x: e.touches[0].pageX,
                y: e.touches[0].pageY
            }
        }

        function noAxisTouched() {
            return (axis.length === 0);
        }

        function isPinchEvent(e) {
            return e.touches && e.touches.length === 2;
        }

        function setAxisTouch(e) {
            axis = getTouchedAxis(getRequiredPoint(e).x, getRequiredPoint(e).y);
        }

        function setPrevDist(e) {
            if (isPinchEvent(e)) prevDist = pinchDistance(e);
        }

        function getRequiredPoint(e) {
            if (isPinchEvent(e)) return getMidpoint(e);
            else return getPoint(e);
        }

        function updateData(e) {
            axis = undefined;
            prevTap = { x: prevPan.x, y: prevPan.y };
            prevPan = { x: getRequiredPoint(e).x, y: getRequiredPoint(e).y };
        }

        function updateAxisData(e) {
            xAxisTouched = (axis[0].direction === 'x');
            yAxisTouched = (axis[0].direction === 'y');
            prevTap[axis[0].direction] = prevPan[axis[0].direction];
            prevPan[axis[0].direction] = getRequiredPoint(e)[axis[0].direction];
        }

        function onDragStart(e) {
            e.stopPropagation();
            e.preventDefault();

            setAxisTouch(e);
            setPrevDist(e);

            if (noAxisTouched()) updateData(e);
            else updateAxisData(e);
        }

        function onDrag(e) {
            twoTouches = isPinchEvent(e);
            if (twoTouches) {
                // send the computed touched axis to the pan function so that it only pans on that one
                plot.pan({
                    left: getMidpoint(e).x - prevPan.x,
                    top: getMidpoint(e).y - prevPan.y,
                    axes: axis
                });
                // update previous pans based on which axis was touched (none/x/y)
                if (axis === undefined) {
                    prevPan.x = getMidpoint(e).x;
                    prevPan.y = getMidpoint(e).y;
                } else if (xAxisTouched) {
                    prevPan.x = getMidpoint(e).x;
                } else if (yAxisTouched) {
                    prevPan.y = getMidpoint(e).y;
                }

                var dist = pinchDistance(e);
                onZoomPinch(e);
                prevDist = dist;
            } else {
                // send the computed touched axis to the pan function so that it only pans on that one
                plot.pan({
                    left: (getPoint(e).x - prevPan.x),
                    top: (getPoint(e).y - prevPan.y),
                    axes: axis
                });
                // update previous pans based on which axis was touched (none/x/y)
                if (axis === undefined) {
                    prevPan.x = getPoint(e).x;
                    prevPan.y = getPoint(e).y;
                } else if (xAxisTouched) {
                    prevPan.x = getPoint(e).x;
                } else if (yAxisTouched) {
                    prevPan.y = getPoint(e).y;
                }
            }
        }

        function onDragEnd(e) {
            if (!isPinchEvent(e)) {
                prevDist = null;
                if (twoTouches && e.touches.length === 1) {
                    prevPan.x = getPoint(e).x;
                    prevPan.y = getPoint(e).y;
                } else if (!twoTouches) {
                    var currentTime = new Date().getTime(),
                        intervalBetweenTaps = currentTime - prevTapTime,
                        maxDistanceBetweenTaps = 20,
                        maxIntervalBetweenTaps = 500;

                    if (intervalBetweenTaps >= 0 && intervalBetweenTaps < maxIntervalBetweenTaps) {
                        if ((xAxisTouched && prevAxisTouched === 'xaxis' && (Math.abs(prevTap.x - prevPan.x) < maxDistanceBetweenTaps)) ||
                            (yAxisTouched && prevAxisTouched === 'yaxis' && (Math.abs(prevTap.y - prevPan.y) < maxDistanceBetweenTaps)) ||
                            (!xAxisTouched && prevAxisTouched === 'none' && !yAxisTouched && distance(prevTap.x, prevTap.y, prevPan.x, prevPan.y) < maxDistanceBetweenTaps)) {
                            plot.recenter({ axes: axis });
                        }
                    }
                    if (xAxisTouched) {
                        prevAxisTouched = 'xaxis';
                    } else if (yAxisTouched) {
                        prevAxisTouched = 'yaxis';
                    } else prevAxisTouched = 'none';
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
                zoomAmount = pinchDistance(e) / prevDist;

            center.left = getMidpoint(e).x - offset.left;
            center.top = getMidpoint(e).y - offset.top;

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
