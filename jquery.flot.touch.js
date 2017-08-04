
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
        var twoTouches = false, mainEventHolder;

        function interpretGestures(e) {
            if (isPinchEvent(e)) {
                executeAction(e, 'pinch')
            } else {
                if (!wasPinchEvent(e)) {
                    executeAction(e, 'doubleTap')
                }
                executeAction(e, 'pan');
            }
        }

        function executeAction(e, gesture) {
            switch (gesture) {
                case 'pan':
                    pan[e.type](e);
                    break;
                case 'pinch':
                    pinch[e.type](e)
                    break;
                case 'doubleTap':
                    doubleTap.onDoubleTap(e);
                    break;
                default:
                    break;
            }
        }

        function bindEvents(plot, eventHolder) {
            mainEventHolder = eventHolder[0];
            eventHolder[0].addEventListener('touchstart', interpretGestures, false);
            eventHolder[0].addEventListener('touchmove', interpretGestures, false);
            eventHolder[0].addEventListener('touchend', interpretGestures, false);
        }

        function shutdown(plot, eventHolder) {
            eventHolder[0].removeEventListener('touchstart', interpretGestures);
            eventHolder[0].removeEventListener('touchmove', interpretGestures);
            eventHolder[0].removeEventListener('touchend', interpretGestures);
        }

        var pan = {
            touchstart: function(e) {
                preventEventPropagation(e);
                mainEventHolder.dispatchEvent(new CustomEvent('panstart', { detail: e }));
            },

            touchmove: function(e) {
                mainEventHolder.dispatchEvent(new CustomEvent('pandrag', { detail: e }));
            },

            touchend: function(e) {
                preventEventPropagation(e);
                if (wasPinchEvent(e)) {
                    mainEventHolder.dispatchEvent(new CustomEvent('pinchend', { detail: e }));
                    mainEventHolder.dispatchEvent(new CustomEvent('panstart', { detail: e }));
                } else if (noTouchActive(e)) {
                    mainEventHolder.dispatchEvent(new CustomEvent('panend', { detail: e }));
                }
            }
        };

        var pinch = {
            touchstart: function(e) {
                preventEventPropagation(e);
                mainEventHolder.dispatchEvent(new CustomEvent('pinchstart', { detail: e }));
            },

            touchmove: function(e) {
                preventEventPropagation(e);
                twoTouches = isPinchEvent(e);
                mainEventHolder.dispatchEvent(new CustomEvent('pinchdrag', { detail: e }));
            },

            touchend: function(e) {
                preventEventPropagation(e);
            }
        };

        var doubleTap = {
            onDoubleTap: function(e) {
                preventEventPropagation(e);
                mainEventHolder.dispatchEvent(new CustomEvent('doubletap', { detail: e }));
            }

        };

        if (options.pan.enableTouch === true) {
            plot.hooks.bindEvents.push(bindEvents);
            plot.hooks.shutdown.push(shutdown);
        }

        function preventEventPropagation(e) {
            e.preventDefault();
            e.stopPropagation();
        }

        function noTouchActive(e) {
            return (e.touches && e.touches.length === 0);
        }

        function wasPinchEvent(e) {
            return (twoTouches && e.touches.length === 1);
        }

        function isPinchEvent(e) {
            return e.touches && e.touches.length === 2;
        }
    }

    $.plot.plugins.push({
        init: init,
        options: options,
        name: 'navigateTouch',
        version: '0.3'
    });
})(jQuery);
