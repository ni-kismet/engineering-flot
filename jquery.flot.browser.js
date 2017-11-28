(function ($) {
    'use strict';

    var browser = {
        getPageXY: function (e) {
            // This function calculates the pageX and pageY which are not valid
            //while running the tests with Edge and creating events using the
            //recommended WheelEvent or MouseEvent constructors.
            // This code is inspired from https://stackoverflow.com/a/3464890
            var doc = document.documentElement,
                pageX = e.clientX + (window.pageXOffset || doc.scrollLeft) - (doc.clientLeft || 0),
                pageY = e.clientY + (window.pageYOffset || doc.scrollTop) - (doc.clientTop || 0);
            return { X: pageX, Y: pageY };
        },

        isSafari: function() {
            // *** https://stackoverflow.com/questions/9847580/how-to-detect-safari-chrome-ie-firefox-and-opera-browser
            // Safari 3.0+ "[object HTMLElementConstructor]"
            return /constructor/i.test(window.HTMLElement) || (function (p) { return p.toString() === "[object SafariRemoteNotification]"; })(!window['safari'] || (typeof safari !== 'undefined' && safari.pushNotification));
        },

        isMobileSafari: function() {
            //isMobileSafari adapted from https://stackoverflow.com/questions/3007480/determine-if-user-navigated-from-mobile-safari
            return navigator.userAgent.match(/(iPod|iPhone|iPad)/) && navigator.userAgent.match(/AppleWebKit/);
        }
    };

    $.plot.browser = browser;
})(jQuery);
