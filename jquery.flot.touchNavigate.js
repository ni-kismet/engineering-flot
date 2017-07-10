/* Flot plugin for adding the ability to pan the plot.

Copyright (c) 2007-2014 IOLA and Ole Laursen.
Copyright (c) 2016 Ciprian Ceteras.
Licensed under the MIT license.
The plugin supports these options:

    pan: {
        interactive: false
        cursor: "move"      // CSS mouse cursor value used when dragging, e.g. "pointer"
        frameRate: 20
        mode: "smart"       // enable smart pan mode
    }

"interactive" enables the built-in drag/click behaviour. If you enable
interactive for pan, then you'll have a basic plot that supports moving
around; the same for zoom.

"amount" specifies the default amount to zoom in (so 1.5 = 150%) relative to
the current viewport.

"cursor" is a standard CSS touch cursor string used for visual feedback to the
user when dragging.

"frameRate" specifies the maximum number of times per second the plot will
update itself while the user is panning around on it (set to null to disable
intermediate pans, the plot will then not update until the mouse button is
released).

Example API usage:

    plot = $.plot(...);

    // pan 100 pixels to the left and 20 down
    plot.pan({ left: -100, top: 20 })

Here, "center" specifies where the center of the zooming should happen. Note
that this is defined in pixel space, not the space of the data points (you can
use the p2c helpers on the axes in Flot to help you convert between these).

"amount" is the amount to zoom the viewport relative to the current range, so
1 is 100% (i.e. no change), 1.5 is 150% (zoom in), 0.7 is 70% (zoom out). You
can set the default in the options. */

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
        var startPageX = 0,
            startPageY = 0,
            plotState = false,
            scaling = false,
            prevDist = null;

        function saveNavigationData(plot, e) {
            if (e.touches && e.touches[0]) {
                var opts = plot.getOptions();
                opts.navigationData = {
                    lastClientX: e.touches[0].clientX,
                    lastClientY: e.touches[0].clientY
                }
            }
        }

        function isPinchEvent(e) {
            return e.touches && e.touches.length === 2;
        }

        function onDragStart(e) {
            e.stopPropagation();
            e.preventDefault();
            scaling = isPinchEvent(e);

            if (!isPinchEvent(e)) {
                scaling = false;

                plot.getPlaceholder().css('cursor', plot.getOptions().pan.cursor);
                startPageX = e.touches[0].pageX || e.touches[0].clientX;
                startPageY = e.touches[0].pageY || e.touches[0].clientY;
                plotState = plot.navigationState();

                saveNavigationData(plot, e);
            } else {
                scaling = true;
                prevDist = pinchDistance(e);
            }
        }

        function onDrag(e) {
            e.stopPropagation();
            e.preventDefault();

            scaling = isPinchEvent(e);

            if (!scaling) {
                return false;
                plot.smartPan({
                    x: startPageX - (e.touches[0].pageX || e.touches[0].clientX),
                    y: startPageY - (e.touches[0].pageY || e.touches[0].clientY)
                }, plotState);

                saveNavigationData(plot, e);
            } else if (isPinchEvent(e)) {
                var dist = pinchDistance(e);
                if (Math.abs(100 * (dist - prevDist) / prevDist) > 5) {
                    onZoomPinch(e, dist < prevDist);
                    prevDist = dist;
                }
            }
        }

        function onDragEnd(e) {
            // not sure if this should do anything
            if (scaling) {
                if (isPinchEvent(e)) {
                    //var dist = pinchDistance(e);
                    scaling = false;
                    prevDist = null
                }
            }
        }

        function onZoomPinch(e, zoomOut) {
            var c = plot.offset(),
                pageX = (e.touches[0].clientX + e.touches[1].clientX) / 2,
                pageY = (e.touches[0].clientY + e.touches[1].clientY) / 2;

            c.left = pageX - c.left; //pageX
            c.top = pageY - c.top; //pageY
            var amount = pinchDistance(e) / prevDist ;
            e.preventDefault();
            if (zoomOut) {
                plot.zoomOut({
                    center: c,
                    amount: 1 / amount
                });
            } else {
                plot.zoom({
                    center: c,
                    amount: amount
                });
            }
        }

        function pinchDistance(e) {
            var dist = Math.sqrt((e.touches[0].clientX - e.touches[1].clientX) * (e.touches[0].clientX - e.touches[1].clientX) +
            (e.touches[0].clientY - e.touches[1].clientY) * (e.touches[0].clientY - e.touches[1].clientY));
            return dist;
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
        version: '0.1'
    });
})(jQuery);
