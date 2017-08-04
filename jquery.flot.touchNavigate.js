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

        function bindEvents(plot, eventHolder) {
            var o = plot.getOptions();

            if (o.pan.interactive) {
                eventHolder[0].addEventListener('panstart', pan.start, false);
                eventHolder[0].addEventListener('pandrag', pan.drag, false);
                eventHolder[0].addEventListener('panend', pan.end, false);
                eventHolder[0].addEventListener('pinchstart', pinch.start, false);
                eventHolder[0].addEventListener('pinchdrag', pinch.drag, false);
                eventHolder[0].addEventListener('pinchend', pinch.end, false);
                eventHolder[0].addEventListener('doubletap', doubleTap.recenterPlot, false);
            }
        }

        function shutdown(plot, eventHolder) {
            eventHolder[0].removeEventListener('panstart', pan.start);
            eventHolder[0].removeEventListener('pandrag', pan.drag);
            eventHolder[0].removeEventListener('panend', pan.end);
            eventHolder[0].removeEventListener('pinchstart', pinch.start);
            eventHolder[0].removeEventListener('pinchdrag', pinch.drag);
            eventHolder[0].removeEventListener('pinchend', pinch.end);
            eventHolder[0].removeEventListener('doubletap', doubleTap.recenterPlot);
        }

        pan = {
            start: function(e) {
                presetNavigationState(e, 'pan', gestureState);
                updateData(e, 'pan', gestureState, navigationState);
            },

            drag: function(e) {
                presetNavigationState(e, 'pan', gestureState);
                plot.pan({
                    left: delta(e, 'pan', gestureState).x,
                    top: delta(e, 'pan', gestureState).y,
                    axes: navigationState.touchedAxis
                });
                updatePrevPan(e, 'pan', gestureState, navigationState);
            },

            end: function(e) {
                presetNavigationState(e, 'pan', gestureState);
                if (wasPinchEvent(e, gestureState)) {
                    updatePrevPan(e, 'pan', gestureState, navigationState);
                }
            }
        };

        pinch = {
            start: function(e) {
                presetNavigationState(e, 'pinch', gestureState);
                setPrevDistance(e, gestureState);
                updateData(e, 'pinch', gestureState, navigationState);
            },

            drag: function(e) {
                presetNavigationState(e, 'pinch', gestureState);
                gestureState.twoTouches = isPinchEvent(e);
                plot.pan({
                    left: delta(e, 'pinch', gestureState).x,
                    top: delta(e, 'pinch', gestureState).y,
                    axes: navigationState.touchedAxis
                });
                updatePrevPan(e, 'pinch', gestureState, navigationState);

                zoomPlot(plot, e, gestureState, navigationState);
            },

            end: function(e) {
                presetNavigationState(e, 'pinch', gestureState);
                gestureState.prevDistance = null;
            }
        };

        doubleTap = {
            recenterPlot: function(e) {
                recenterPlotOnDoubleTap(plot, e, gestureState, navigationState);
            }
        };

        if (options.pan.enableTouch === true) {
            plot.hooks.bindEvents.push(bindEvents);
            plot.hooks.shutdown.push(shutdown);
        }

        function presetNavigationState(e, gesture, gestureState) {
            navigationState.touchedAxis = getAxis(plot, e, gesture, navigationState);
            if (noAxisTouched(navigationState)) {
                navigationState.navigationConstraint = 'unconstrained';
            } else {
                navigationState.navigationConstraint = 'axisConstrained';
            }
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
        return (gestureState.twoTouches && e.detail.touches.length === 1);
    }

    function getAxis(plot, e, gesture, navigationState) {
        if (e.detail.type === 'touchstart') {
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
        var t1 = e.detail.touches[0],
            t2 = e.detail.touches[1];
        return distance(t1.pageX, t1.pageY, t2.pageX, t2.pageY);
    }

    function isPinchEvent(e) {
        return e.detail.touches && e.detail.touches.length === 2;
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
                x: (e.detail.touches[0].pageX + e.detail.touches[1].pageX) / 2,
                y: (e.detail.touches[0].pageY + e.detail.touches[1].pageY) / 2
            }
        } else {
            return {
                x: e.detail.touches[0].pageX,
                y: e.detail.touches[0].pageY
            }
        }
    }
})(jQuery);
