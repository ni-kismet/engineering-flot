/** ## jquery.flot.formatters.js

### Methods
*/

(function ($) {
    'use strict';

    var formatters = {
        linearTickGenerator: function(plot, min, max, noTicks, tickSize) {
            var ticks = [],
                start = $.plot.saturated.saturate($.plot.saturated.floorInBase(min, tickSize)),
                i = 0,
                v = Number.NaN,
                prev;

            if (start === -Number.MAX_VALUE) {
                ticks.push(start);
                start = $.plot.saturated.floorInBase(min + tickSize, tickSize);
            }

            do {
                prev = v;
                //v = start + i * axis.tickSize;
                v = $.plot.saturated.multiplyAdd(tickSize, i, start);
                ticks.push(v);
                ++i;
            } while (v < max && v !== prev);

            return ticks;
        }
    };

    $.plot.formatters = formatters;
})(jQuery);
