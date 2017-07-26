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

        function getMidPoint(e) {
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

        function getTouchedAxis(touchPointX, touchPointY) {
            var ec = plot.getPlaceholder().offset();
            ec.left = touchPointX - ec.left;
            ec.top = touchPointY - ec.top;

            var axis = plot.getXAxes().concat(plot.getYAxes()).filter(function (axis) {
                var box = axis.box;
                return (ec.left > box.left) && (ec.left < box.left + box.width) &&
                    (ec.top > box.top) && (ec.top < box.top + box.height);
            });

            return axis;
        }

        function setAxisOneTouch(e) {
            axis = getTouchedAxis(getPoint(e).x, getPoint(e).y);
            return true;
        }

        function setAxisDoubleTouch(e) {
            axis = getTouchedAxis(getMidPoint(e).x, getMidPoint(e).y);
            return true;
        }

        function noAxisTouched() {
            return (!axis || axis.length === 0);
        }

        function isPinchEvent(e) {
            return e.touches && e.touches.length === 2;
        }

        function wasPinchEvent(e) {
            return (twoTouches && e.touches.length === 1);
        }

        function setPrevDist(e) {
            prevDist = pinchDistance(e);
        }

        function updateData(e, point) {
            axis = undefined;
            prevTap = { x: prevPan.x, y: prevPan.y };
            prevPan = { x: point.x, y: point.y };
        }

        function updateAxisData(e, point) {
            xAxisTouched = (axis[0].direction === 'x');
            yAxisTouched = (axis[0].direction === 'y');
            prevTap[axis[0].direction] = prevPan[axis[0].direction];
            prevPan[axis[0].direction] = point[axis[0].direction];
        }

        function recenterOnDoubleTap(e) {
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
            prevAxisTouched = xAxisTouched ? 'xaxis' : yAxisTouched ? 'yaxis' : 'none';
            prevTapTime = currentTime;
        }

        function distance(x1, y1, x2, y2) {
            return Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));
        }

        function pinchDistance(e) {
            var t1 = e.touches[0],
                t2 = e.touches[1];
            return distance(t1.pageX, t1.pageY, t2.pageX, t2.pageY);
        }

        function preventEventPropagation(e) {
            e.stopPropagation();
            e.preventDefault();
        }

        var oneTouchPan = {
            conditionOnStart: function(e) {
                return !twoTouches && setAxisOneTouch(e) && noAxisTouched();
            },

            conditionOnDrag: function(e) {
                return !twoTouches && noAxisTouched();
            },

            conditionOnDragEnd: function(e) {
                return (!twoTouches && !isPinchEvent(e));
            },

            actionOnStart: function(e) {
                preventEventPropagation(e);
                updateData(e, getPoint(e));
            },

            actionOnDrag: function(e) {
                plot.pan({
                    left: (getPoint(e).x - prevPan.x),
                    top: (getPoint(e).y - prevPan.y),
                    axes: axis
                });
                prevPan.x = getPoint(e).x;
                prevPan.y = getPoint(e).y;
            },

            actionOnDragEnd: function(e) {
                recenterOnDoubleTap(e);
            }
        }

        var doubleTouchPan = {
            conditionOnStart: function(e) {
                return twoTouches && setAxisDoubleTouch(e) && noAxisTouched();
            },

            conditionOnDrag: function(e) {
                return twoTouches && noAxisTouched();
            },

            conditionOnDragEnd: function(e) {
                return !isPinchEvent(e);
            },

            actionOnStart: function(e) {
                preventEventPropagation(e);
                updateData(e, getMidPoint(e));
            },

            actionOnDrag: function(e) {
                plot.pan({
                    left: getMidPoint(e).x - prevPan.x,
                    top: getMidPoint(e).y - prevPan.y,
                    axes: axis
                });
                prevPan.x = getMidPoint(e).x;
                prevPan.y = getMidPoint(e).y;
            },

            actionOnDragEnd: function(e) {
                prevDist = null;
                if (wasPinchEvent(e)) {
                    prevPan.x = getPoint(e).x;
                    prevPan.y = getPoint(e).y;
                }
            }
        }

        var oneTouchPanOnAxis = {
            conditionOnStart: function(e) {
                return !twoTouches && setAxisOneTouch(e) && !noAxisTouched();
            },

            conditionOnDrag: function(e) {
                return (!twoTouches && !noAxisTouched());
            },

            conditionOnDragEnd: function(e) {
                return !isPinchEvent(e) && !twoTouches;
            },

            actionOnStart: function(e) {
                preventEventPropagation(e);
                updateAxisData(e, getPoint(e));
            },

            actionOnDrag: function(e) {
                plot.pan({
                    left: (getPoint(e).x - prevPan.x),
                    top: (getPoint(e).y - prevPan.y),
                    axes: axis
                });
                prevPan[xAxisTouched ? 'x' : 'y'] = getPoint(e)[xAxisTouched ? 'x' : 'y'];
            },

            actionOnDragEnd: function(e) {
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
                prevAxisTouched = xAxisTouched ? 'xaxis' : yAxisTouched ? 'yaxis' : 'none';
                prevTapTime = currentTime;
            }
        }

        var doubleTouchPanOnAxis = {
            conditionOnStart: function(e) {
                return twoTouches && setAxisDoubleTouch(e) && !noAxisTouched();
            },

            conditionOnDrag: function(e) {
                return (twoTouches && !noAxisTouched());
            },

            conditionOnDragEnd: function(e) {
                return !isPinchEvent(e);
            },

            actionOnStart: function(e) {
                preventEventPropagation(e);
                updateAxisData(e, getMidPoint(e));
            },

            actionOnDrag: function(e) {
                plot.pan({
                    left: getMidPoint(e).x - prevPan.x,
                    top: getMidPoint(e).y - prevPan.y,
                    axes: axis
                });
                prevPan[xAxisTouched ? 'x' : 'y'] = getMidPoint(e)[xAxisTouched ? 'x' : 'y'];
            },

            actionOnDragEnd: function(e) {
                prevDist = null;
                if (wasPinchEvent(e)) {
                    prevPan.x = getPoint(e).x;
                    prevPan.y = getPoint(e).y;
                }
            }
        }

        var zoomPinch = {
            conditionOnStart: function(e) {
                return twoTouches && setAxisDoubleTouch(e) && noAxisTouched();
            },

            conditionOnDrag: function(e) {
                return (twoTouches && noAxisTouched());
            },

            conditionOnDragEnd: function(e) {
                return !isPinchEvent(e);
            },

            actionOnStart: function(e) {
                preventEventPropagation(e);
                setPrevDist(e);
                updateData(e, getMidPoint(e));
            },

            actionOnDrag: function(e) {
                var dist = pinchDistance(e);
                onZoomPinch(e);
                prevDist = dist;
            },

            actionOnDragEnd: function(e) {
                prevDist = null;
                if (wasPinchEvent(e)) {
                    prevPan.x = getPoint(e).x;
                    prevPan.y = getPoint(e).y;
                }
            }
        }

        var zoomPinchOnAxis = {
            conditionOnStart: function(e) {
                return twoTouches && setAxisDoubleTouch(e) && !noAxisTouched();
            },

            conditionOnDrag: function(e) {
                return (twoTouches && !noAxisTouched());
            },

            conditionOnDragEnd: function(e) {
                return !isPinchEvent(e);
            },

            actionOnStart: function(e) {
                preventEventPropagation(e);
                setPrevDist(e);
                updateAxisData(e, getMidPoint(e));
            },

            actionOnDrag: function(e) {
                var dist = pinchDistance(e);
                onZoomPinch(e);
                prevDist = dist;
            },

            actionOnDragEnd: function(e) {
                prevDist = null;
                if (wasPinchEvent(e)) {
                    prevPan.x = getPoint(e).x;
                    prevPan.y = getPoint(e).y;
                }
            }
        }

        var gestures = [oneTouchPan, doubleTouchPan, oneTouchPanOnAxis, doubleTouchPanOnAxis, zoomPinch, zoomPinchOnAxis];

        function onDragStart(e) {
            twoTouches = isPinchEvent(e);
            var detectedGestures = gestures.filter(function(gesture) { return gesture.conditionOnStart(e); });
            detectedGestures.forEach(function(gesture) {
                if (gesture) gesture.actionOnStart(e);
            });
        }

        function onDrag(e) {
            twoTouches = isPinchEvent(e);
            var detectedGestures = gestures.filter(function(gesture) { return gesture.conditionOnDrag(e); });
            detectedGestures.forEach(function(gesture) {
                if (gesture) gesture.actionOnDrag(e);
            });
        }

        function onDragEnd(e) {
            var detectedGestures = gestures.filter(function(gesture) { return gesture.conditionOnDragEnd(e); });
            detectedGestures.forEach(function(gesture) {
                if (gesture) gesture.actionOnDragEnd(e);
            });
        }

        function onZoomPinch(e) {
            var offset = plot.offset(),
                center = {
                    left: 0,
                    top: 0
                },
                zoomAmount = pinchDistance(e) / prevDist;

            center.left = getMidPoint(e).x - offset.left;
            center.top = getMidPoint(e).y - offset.top;

            // send the computed touched axis to the zoom function so that it only zooms on that one
            plot.zoom({
                center: center,
                amount: zoomAmount,
                axes: axis
            });
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
