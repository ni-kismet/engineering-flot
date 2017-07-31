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
        var gestureState = {
                twoTouches: false,
                prevDistance: null,
                prevTapTime: 0,
                prevPan: { x: 0, y: 0 },
                prevTap: { x: 0, y: 0 }
            },
            navigationState = {
                prevTouchedAxis: 'none',
                currentTouchedAxis: 'none',
                touchedAxis: null,
                navigationConstraint: 'unconstrained'
            },
            pan, pinch, doubleTap;

        function interpretGestures(e) {
            if (isPinchEvent(e)) {
                executeAction(e, 'pinch', gestureState)
            } else {
                if (!wasPinchEvent(e, gestureState)) {
                    executeAction(e, 'doubleTap', gestureState)
                }
                executeAction(e, 'pan', gestureState);
            }
        }

        function executeAction(e, gesture, gestureState) {
            navigationState.touchedAxis = getAxis(plot, e, gesture, navigationState);
            if (noAxisTouched(navigationState)) {
                navigationState.navigationConstraint = 'unconstrained';
            } else {
                navigationState.navigationConstraint = 'axisConstrained';
            }

            switch (gesture) {
                case 'pan':
                    pan[e.type](e, gestureState);
                    break;
                case 'pinch':
                    pinch[e.type](e, gestureState)
                    break;
                case 'doubleTap':
                    doubleTap.recenterPlot(plot, e, gestureState);
                    break;
                default:
                    break;
            }
        }

        function bindEvents(plot, eventHolder) {
            var o = plot.getOptions();

            if (o.pan.interactive) {
                eventHolder[0].addEventListener("touchstart", interpretGestures, false);
                eventHolder[0].addEventListener("touchmove", interpretGestures, false);
                eventHolder[0].addEventListener("touchend", interpretGestures, false);
            }
        }

        function shutdown(plot, eventHolder) {
            eventHolder[0].removeEventListener("touchstart", interpretGestures);
            eventHolder[0].removeEventListener('touchmove', interpretGestures);
            eventHolder[0].removeEventListener('touchend', interpretGestures);
        }

        pan = {
            touchstart: function(e, gestureState) {
                preventEventPropagation(e);
                updateData(e, 'pan', gestureState, navigationState);
            },

            touchmove: function(e, gestureState) {
                plot.pan({
                    left: delta(e, 'pan', gestureState).x,
                    top: delta(e, 'pan', gestureState).y,
                    axes: navigationState.touchedAxis
                });
                updatePrevPan(e, 'pan', gestureState, navigationState);
            },

            touchend: function(e, gestureState) {
                if (wasPinchEvent(e, gestureState)) {
                    updatePrevPan(e, 'pan', gestureState, navigationState);
                }
            }
        };

        pinch = {
            touchstart: function(e, gestureState) {
                preventEventPropagation(e);
                setPrevDistance(e, gestureState);
                updateData(e, 'pinch', gestureState, navigationState);
            },

            touchmove: function(e, gestureState) {
                gestureState.twoTouches = isPinchEvent(e);
                plot.pan({
                    left: delta(e, 'pinch', gestureState).x,
                    top: delta(e, 'pinch', gestureState).y,
                    axes: navigationState.touchedAxis
                });
                updatePrevPan(e, 'pinch', gestureState, navigationState);

                zoomPlot(plot, e, gestureState, navigationState);
            },

            touchend: function(e, gestureState) {
                gestureState.prevDistance = null;
            }
        };

        doubleTap = {
            recenterPlot: function(plot, e, gestureState) {
                recenterPlotOnDoubleTap(plot, e, gestureState, navigationState);
            }
        };

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

    function recenterPlotOnDoubleTap(plot, e, gestureState, navigationState) {
        var currentTime = new Date().getTime(),
            intervalBetweenTaps = currentTime - gestureState.prevTapTime,
            maxDistanceBetweenTaps = 20,
            maxIntervalBetweenTaps = 500;

        if (intervalBetweenTaps >= 0 && intervalBetweenTaps < maxIntervalBetweenTaps) {
            if ((navigationState.currentTouchedAxis === 'x' && navigationState.prevTouchedAxis === 'x' && (Math.abs(gestureState.prevTap.x - gestureState.prevPan.x) < maxDistanceBetweenTaps)) ||
                (navigationState.currentTouchedAxis === 'y' && navigationState.prevTouchedAxis === 'y' && (Math.abs(gestureState.prevTap.y - gestureState.prevPan.y) < maxDistanceBetweenTaps)) ||
                (navigationState.currentTouchedAxis === 'none' && navigationState.prevTouchedAxis === 'none' && distance(gestureState.prevTap.x, gestureState.prevTap.y, gestureState.prevPan.x, gestureState.prevPan.y) < maxDistanceBetweenTaps)) {
                plot.recenter({ axes: navigationState.touchedAxis });
            }
        }
        navigationState.prevTouchedAxis = navigationState.currentTouchedAxis;
        gestureState.prevTapTime = currentTime;
    }

    function zoomPlot(plot, e, gestureState, navigationState) {
        var offset = plot.offset(),
            center = {
                left: 0,
                top: 0
            },
            zoomAmount = pinchDistance(e) / gestureState.prevDistance,
            dist = pinchDistance(e);

        center.left = getPoint(e, 'pinch').x - offset.left;
        center.top = getPoint(e, 'pinch').y - offset.top;

        // send the computed touched axis to the zoom function so that it only zooms on that one
        plot.zoom({
            center: center,
            amount: zoomAmount,
            axes: navigationState.touchedAxis
        });
        gestureState.prevDistance = dist;
    }

    function wasPinchEvent(e, gestureState) {
        return (gestureState.twoTouches && e.touches.length === 1);
    }

    function getAxis(plot, e, gesture, navigationState) {
        if (e.type === 'touchstart') {
            var point = getPoint(e, gesture);
            return getTouchedAxis(plot, point.x, point.y);
        } else return navigationState.touchedAxis;
    }

    function noAxisTouched(navigationState) {
        return (!navigationState.touchedAxis || navigationState.touchedAxis.length === 0);
    }

    function setPrevDistance(e, gestureState) {
        gestureState.prevDistance = pinchDistance(e);
    }

    function updateData(e, gesture, gestureState, navigationState) {
        var axisDir,
            point = getPoint(e, gesture);

        switch (navigationState.navigationConstraint) {
            case 'unconstrained':
                navigationState.touchedAxis = null;
                gestureState.prevTap = {
                    x: gestureState.prevPan.x,
                    y: gestureState.prevPan.y
                };
                gestureState.prevPan = {
                    x: point.x,
                    y: point.y
                };
                break;
            case 'axisConstrained':
                axisDir = navigationState.touchedAxis[0].direction;
                navigationState.currentTouchedAxis = axisDir;
                gestureState.prevTap[axisDir] = gestureState.prevPan[axisDir];
                gestureState.prevPan[axisDir] = point[axisDir];
                break;
            default:
                break;
        }
    }

    function distance(x1, y1, x2, y2) {
        return Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));
    }

    function pinchDistance(e) {
        var t1 = e.touches[0],
            t2 = e.touches[1];
        return distance(t1.pageX, t1.pageY, t2.pageX, t2.pageY);
    }

    function isPinchEvent(e) {
        return e.touches && e.touches.length === 2;
    }

    function preventEventPropagation(e) {
        e.stopPropagation();
        e.preventDefault();
    }

    function getTouchedAxis(plot, touchPointX, touchPointY) {
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

    function updatePrevPan(e, gesture, gestureState, navigationState) {
        var point = getPoint(e, gesture);

        switch (navigationState.navigationConstraint) {
            case 'unconstrained':
                gestureState.prevPan.x = point.x;
                gestureState.prevPan.y = point.y;
                break;
            case 'axisConstrained':
                gestureState.prevPan[navigationState.currentTouchedAxis] =
                point[navigationState.currentTouchedAxis];
                break;
            default:
                break;
        }
    }

    function delta(e, gesture, gestureState) {
        var point = getPoint(e, gesture);

        return {
            x: point.x - gestureState.prevPan.x,
            y: point.y - gestureState.prevPan.y
        }
    }

    function getPoint(e, gesture) {
        if (gesture === 'pinch') {
            return {
                x: (e.touches[0].pageX + e.touches[1].pageX) / 2,
                y: (e.touches[0].pageY + e.touches[1].pageY) / 2
            }
        } else {
            return {
                x: e.touches[0].pageX,
                y: e.touches[0].pageY
            }
        }
    }
})(jQuery);
