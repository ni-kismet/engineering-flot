/* eslint-disable */
(function() {
    'use strict';

    window.simulate = {};

    var simulate = window.simulate;

    function mouseEvent(type, sx, sy, cx, cy, button, detail) {
        var evt;
        var e = {
            bubbles: true,
            cancelable: (type !== "mousemove"),
            view: window,
            detail: detail,
            screenX: sx,
            screenY: sy,
            clientX: cx,
            clientY: cy,
            pageX: cx,
            pageY: cy,
            ctrlKey: false,
            altKey: false,
            shiftKey: false,
            metaKey: false,
            button: button || 0,
            relatedTarget: undefined
        };

        if (typeof (document.createEvent) === "function") {
            evt = document.createEvent("MouseEvents");
            evt.initMouseEvent(type,
                e.bubbles, e.cancelable, e.view, e.detail,
                e.screenX, e.screenY, e.clientX, e.clientY,
                e.ctrlKey, e.altKey, e.shiftKey, e.metaKey,
                e.button, document.body.parentNode);
        } else if (document.createEventObject) {
            evt = document.createEventObject();
            for (var prop in e) {
                evt[prop] = e[prop];
            }
            evt.button = {
                0: 1,
                1: 4,
                2: 2
            }[evt.button] || evt.button;
        }

        return evt;
    }

    function dispatchEvent(el, evt) {
        if (el.dispatchEvent) {
            el.dispatchEvent(evt);
        }
        return evt;
    }

    function simulateMouseDown(el, x, y, button) {
        var bBox = el.getBoundingClientRect()

        var clickX = bBox.left + x;
        var clickY = bBox.top + y;

        var evt = mouseEvent("mousedown", clickX, clickY, clickX, clickY, button);
        dispatchEvent(el, evt);
    }

    function simulateMouseMove(el, x, y, button) {
        var bBox = el.getBoundingClientRect()

        var clickX = bBox.left + x;
        var clickY = bBox.top + y;

        var evt = mouseEvent("mousemove", clickX, clickY, clickX, clickY, button);
        dispatchEvent(el, evt);
    }

    function simulateMouseUp(el, x, y, button) {
        var bBox = el.getBoundingClientRect()

        var clickX = bBox.left + x;
        var clickY = bBox.top + y;

        var evt = mouseEvent("mouseup", clickX, clickY, clickX, clickY, button);
        dispatchEvent(el, evt);
    }

    function simulateMouseWheel(el, x, y, deltaX) {
        var bBox = el.getBoundingClientRect()

        var clickX = bBox.left + x;
        var clickY = bBox.top + y;

        var evt = mouseEvent("DOMMouseScroll", clickX, clickY, clickX, clickY, 0, deltaX);
        dispatchEvent(el, evt);
    }

    simulate.mouseDown = simulateMouseDown;
    simulate.mouseMove = simulateMouseMove;
    simulate.mouseUp = simulateMouseUp;
    simulate.mouseWheel = simulateMouseWheel;
})();
