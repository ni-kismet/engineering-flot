/* Pretty handling of time axes.

Copyright (c) 2007-2014 IOLA and Ole Laursen.
Licensed under the MIT license.

Set axis.format to "time" to enable. See the section "Time series data" in
API.txt for details.
*/

/** ## jquery.flot.absRelTime.js

This plugin is used to format the time axis in absolute time representation as
well as relative time representation.

It supports the following options:
```js
xaxis: {
    timezone: null, // "browser" for local to the client or timezone for timezone-js
    timeformat: null, // format string to use
    twelveHourClock: false, // 12 or 24 time in time mode
    monthNames: null // list of names of months
    formatString: "" // A string that allows a user to format the time display (see below for details)
    timeEpoch: '0000-12-31T18:00:00' // A time in UTC string format to use as an offset for the display of dates (see below)
}
yaxis: {
    formatString: "" // A string that allows a user to format the time display (see below for details)
    timeEpoch: '0000-12-31T18:00:00' // A time in UTC string format to use as an offset for the display of dates (see below)
}
```

Depending upon the timeformat axis parameter value, the axis tick formatter will
choose between an absolute time representation if the value is '%A' or
relative time for timeformat '%r'.

If the format for an axis is 'time', inside processOptions hook the tickGenerator
and tickFormatter of the axis will be overrided with the custom ones used by time axes.

The formatted values look like in the example bellow:

|format|value(s)|formatted value(s)|
|------|----:|--------------:|
|Absolute time|0|12:00:00 AM 1/1/0001|
|Absolute time|300|12:05:00 AM 1/1/0001|
|Relative Time|0, 300, 600|00:00:00, 00:05:00, 00:10:00|
|Relative Time|300, 600, 900|00:00:00, 00:05:00, 00:10:00|

formatString usage
------------------
There are two flavors of formats you can provide for the date and time formatting options through the
'formatString' option, and can be mixed between the date and time sections. The first is a simple string
to indicate date and/or time should be formatted according to the language preference of the browser:
#d: date
#T: time

A user could specify formatString = "#d" to indicate the display of a particular date-time should
just show the date. A string of "#d#T" indicates both date and time should be displayed. Note that time
is always displayed before the date, and when both are displayed they will be separated by a newline (so order
of the time and date format substrings doesn't matter).

The second flavor is a more verbose set of options, allowing a user to specify certain characteristics of both
the date and time displays. The following shows the complete set of options:
dd/MM/yy(yy) hh:mm:ss.SSS  (NOTE: The (yy) just indicates you can optionally specify a 4 digit year. So 'yy' or 'yyyy'.)

Acceptable date configutations are:
dd/MM</yy(yy)>  <...> indicates optional part of formatString
MM/dd</yy(yy)>

Acceptable time configurations are:
hh(or HH):mm   (HH will indicate that the formatted time should be in 24-hour format)
hh:mm:ss
hh:mm:ss(.S+) (where 'S+' just means you can specify a particular number of 'S's for fractional seconds)

### Relative time axis
A relative time axis will show the time values with respect to the first data sample.
Basically, the first datapoint from the points array will be considered time 00:00:00:00.
If the difference between two datapoints is small, the milliseconds will apear.
Otherwise, the time representation will contain only the hour, minute and second.
NOTE: If a formatString is provided, any date format will be ignored.

### Absolute time axis
The absolute time representation contains, beside the hours, minutes and seconds
corresponding to the sample the date and year.
The value will be splitted on two rows, where the first row is the time and
the the second one the date in gregorian date format.
*/

(function($) {
    'use strict';

    var options = {
        xaxis: {
            timezone: null, // "browser" for local to the client or timezone for timezone-js
            timeformat: null, // format string to use
            twelveHourClock: false, // 12 or 24 time in time mode
            monthNames: null, // list of names of months
            formatString: "", // The full format string
            timeEpoch: '0000-12-31T18:00:00' // the UTC date to use as the epoch for "total seconds from" in for format of 'yyyy-mm-ddThh:mm:ss'
        },
        yaxis: {
            formatString: "", // The full format string
            timeEpoch: '0000-12-31T18:00:00' // the UTC date to use as the epoch for "total seconds from" in for format of 'yyyy-mm-ddThh:mm:ss'
        }
    };

    var floorInBase = $.plot.saturated.floorInBase;

    // Returns a string with the date d formatted according to fmt.
    // A subset of the Open Group's strftime format is supported.

    function formatDate(d, fmt, monthNames, dayNames, showMilliseconds, axis) {
        if (typeof d.strftime === "function") {
            return d.strftime(fmt);
        }

        var leftPad = function(n, pad) {
            n = "" + n;
            if (pad) pad = "" + pad;
            else pad = "0";

            return n.length === 1 ? pad + n : n;
        };

        var padNTimes = function(n, pad, nTimes, right) {
            n = "" + n;
            if (pad) pad = "" + pad;
            else pad = "0";

            while (n.length < nTimes) {
                if (right === true) {
                    n = n + pad;
                } else {
                    n = pad + n;
                }
            }
            return n;
        };

        function addMilliseconds(date, ms) {
            var parts = date.split(' ');
            if (parts.length > 1) {
                var sufix = parts[parts.length - 1];
                parts.splice(parts.length - 1, 1);

                return parts.join(' ') + ms + ' ' + sufix;
            } else {
                return date + ms;
            }
        }

        function formatLanguage() {
            // horrible hack
            if (window.NIEmbeddedBrowser && window.NIEmbeddedBrowser.formatLanguage) {
                return window.NIEmbeddedBrowser.formatLanguage;
            }

            return navigator.locale || 'en-US';
        }

        // Returns the set of options to be used by an instance of Intl.DateTimeFormat
        function getFormatterOptions(formatString) {
            var options = {};
            if (formatString === undefined || formatString === null) {
                return options;
            }

            if (formatString.includes("#d")) {
                options['year'] = "numeric";
                options['month'] = "numeric";
                options['day'] = "numeric";
            } else {
                if (formatString.includes("yyyy")) {
                    options['year'] = "numeric";
                } else if (formatString.includes("yy")) {
                    options['year'] = "2-digit";
                }

                options['month'] = "numeric";
                options['day'] = "numeric";
            }

            if (formatString.includes("#T")) {
                options['hour'] = "numeric";
                options['minute'] = "numeric";
                options['second'] = "numeric";
            } else { // format has either "hh" or "HH" (which always will show minutes)
                options['hour'] = "2-digit";
                options['minute'] = "2-digit";

                if (formatString.includes("ss")) {
                    options['second'] = "2-digit";
                }

                options['hour12'] = formatString.includes("hh");
            }

            return options;
        }

        function getFormattedDateString(date, formatString, formatOptions, locale) {
            var showYear = formatString.includes("yy") || formatString.includes("#d");
            if (!showYear && !formatString.includes("MM")) {
                return "";
            }

            // System format
            if (formatString.includes("#d")) {
                return Intl.DateTimeFormat(locale, {year: 'numeric', month: 'numeric', day: 'numeric'}).format(date);
            }

            // Custom format
            var formatParts = Intl.DateTimeFormat(locale, formatOptions).formatToParts(date);
            var formatPartsTypeList = formatParts.map(({type, value}) => { return type; });
            var dayIndex = formatPartsTypeList.indexOf('day');
            var monthIndex = formatPartsTypeList.indexOf('month');
            var dayMonthDelimiter = formatParts[(monthIndex + dayIndex) / 2].value;
            var dayValue = formatParts[dayIndex].value;
            var monthValue = formatParts[monthIndex].value;
            var yearValue = showYear ? formatParts[formatPartsTypeList.indexOf('year')].value : "";

            if (showYear) {
                var padAmount = formatString.includes("yyyy") ? 4 : 2;
                yearValue = padNTimes(yearValue, "0", padAmount);
            }

            if (formatString.indexOf("dd") < formatString.indexOf("MM")) {
                return dayValue + dayMonthDelimiter + monthValue + (showYear ? dayMonthDelimiter + yearValue : "");
            } else {
                return monthValue + dayMonthDelimiter + dayValue + (showYear ? dayMonthDelimiter + yearValue : "");
            }
        }

        function getFormattedTimeString(date, formatString, formatOptions, locale) {
            var showTime = formatString.includes("hh") || formatString.includes("HH") || formatString.includes("#T");
            if (!showTime) {
                return "";
            }

            var fractionalSecondsIndex = formatString.indexOf(".S");
            var fractionalSecondsSearch = new RegExp(".S+", "g");
            var numberOfFractionalSeconds = fractionalSecondsIndex > 0 ? fractionalSecondsSearch.exec(formatString)[0].length - 1 : 0;
            var fractionalSecondsString = padNTimes(date.getMilliseconds(), "0", 3);
            fractionalSecondsString = padNTimes(fractionalSecondsString, "0", numberOfFractionalSeconds, true);
            fractionalSecondsString = numberOfFractionalSeconds > 0 ? fractionalSecondsString.substring(0, numberOfFractionalSeconds) : "";

            // System format
            if (formatString.includes("#T")) {
                var formattedDate = Intl.DateTimeFormat(locale, {hour: 'numeric', minute: 'numeric', second: 'numeric'}).format(date);
                if (fractionalSecondsString !== "") {
                    var lastDigitSearch = new RegExp("[0-9](?!.*[0-9])", "g");
                    lastDigitSearch.test(formattedDate);
                    formattedDate = [formattedDate.slice(0, lastDigitSearch.lastIndex), "." + fractionalSecondsString, formattedDate.slice(lastDigitSearch.lastIndex)].join('');
                }

                return formattedDate;
            }

            // Custom format
            var formatParts = Intl.DateTimeFormat(locale, formatOptions).formatToParts(date);
            var formatPartsTypeList = formatParts.map(({type, value}) => { return type.toLowerCase(); });
            var hourIndex = formatPartsTypeList.indexOf('hour');
            var minuteIndex = formatPartsTypeList.indexOf('minute');
            var hourMinuteDelimiter = formatParts[(hourIndex + minuteIndex) / 2].value;
            var hourValue = leftPad(formatParts[hourIndex].value);
            var minuteValue = leftPad(formatParts[minuteIndex].value);
            var showSeconds = formatString.includes("ss");
            var secondValue = showSeconds ? leftPad(formatParts[formatPartsTypeList.indexOf('second')].value) : "";
            var dayPeriod = formatOptions['hour12'] === true ? formatParts[formatPartsTypeList.indexOf('dayperiod')].value : "";
            return hourValue +
                   hourMinuteDelimiter +
                   minuteValue +
                   (showSeconds ? hourMinuteDelimiter + secondValue : "") +
                   (showSeconds && numberOfFractionalSeconds > 0 ? "." + fractionalSecondsString : "") +
                   (dayPeriod !== "" ? " " + dayPeriod : "");
        }

        function getFormattedDateTimeString(date, formatString) {
            var locale = navigator.language || navigator.browserLanguage || navigator.languages[0];
            var formatOptions = getFormatterOptions(formatString);
            var dateString = getFormattedDateString(date, formatString, formatOptions, locale);
            var timeString = getFormattedTimeString(date, formatString, formatOptions, locale);
            return timeString + (dateString !== "" && timeString !== "" ? "<br>" : "") + dateString;
        }

        function toAbsoluteTimeStr(date, showMilliseconds, formatString, timeEpoch) {
            var unixToAbsoluteEpochDiff = 62135596800000,
                minDateValue = -8640000000000000,
                d = date.valueOf(),
                ms = Math.floor(d % 1000);

            if (ms < 0) {
                ms = 1000 + ms;
            }

            if (date < minDateValue + unixToAbsoluteEpochDiff) {
                date = minDateValue + unixToAbsoluteEpochDiff;
            }

            var timeEpochDate = new Date(timeEpoch);
            var timeEpochOffset = timeEpochDate.valueOf();
            var gregorianDate = makeUtcWrapper(new Date(date.valueOf() + timeEpochOffset)).date;

            var time;
            if (formatString !== "") {
                time = getFormattedDateTimeString(gregorianDate, formatString);
            } else {
                var msString = showMilliseconds ? '.' + padNTimes(ms, '0', 3) : '';
                time = Globalize.format(gregorianDate, "T", formatLanguage());
                time = addMilliseconds(time, msString) + '<br>' + Globalize.format(gregorianDate, "d", formatLanguage());
            }

            return time;
        }

        function toRelativeTimeStr(date, showMilliseconds, formatString) {
            var result = '';

            var dateValue = date.valueOf(),
                d = dateValue - (axis.valueOfFirstData === undefined ? 0 : axis.valueOfFirstData);

            if (d < 0) {
                d = -d;
                result += '-';
            }
            var dateInSeconds = Math.floor(d / 1000);
            var milliseconds = Math.floor(d % 1000);
            var seconds = dateInSeconds % 60;
            var dateInMinutes = Math.floor(dateInSeconds / 60);
            var minutes = dateInMinutes % 60;
            var dateInHours = Math.floor(dateInMinutes / 60);
            var hours = dateInHours % 24;
            var days = Math.floor(dateInHours / 24);
            var showSeconds = formatString === "" || formatString.includes("ss");

            if (days && formatString === "") {
                result += days + '.';
            }

            result += leftPad(hours) + ':';
            result += leftPad(minutes);
            if (showSeconds) {
                result += (":" + leftPad(seconds));
            }

            var forceMilliseconds = showSeconds && formatString.includes(".S");
            showMilliseconds = (showMilliseconds && formatString === "") || forceMilliseconds;
            var padAmount = 3;
            if (forceMilliseconds) {
                var fractionalSecondsIndex = formatString.indexOf(".S");
                var numberOfFractionalSeconds = fractionalSecondsIndex > 0 ? formatString.substring(fractionalSecondsIndex + 1) : 0;
                padAmount = numberOfFractionalSeconds;
            }
            if (showMilliseconds && padAmount > 0) {
                var padResult = padNTimes(milliseconds, "0", 3); // fill in digits left of milliseconds if needed
                if (padAmount > 3) {
                    padResult = padNTimes(padResult, "0", padAmount, true); // fill in digits right of millisecond if needed
                }

                result += '.' + padResult.substring(0, padAmount);
            }

            return result;
        }

        var r = [];
        var escape = false;

        if (!monthNames) {
            monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        }

        if (!dayNames) {
            dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        }

        var timeEpoch = new Date(axis.options.timeEpoch);
        for (var i = 0; i < fmt.length; ++i) {
            var c = fmt.charAt(i),
                localDateValue = d.date || d.getDate();
            if (escape) {
                switch (c) {
                    case 'r': c = toRelativeTimeStr(localDateValue, showMilliseconds, axis.options.formatString); break;
                    case 'A': c = toAbsoluteTimeStr(localDateValue, showMilliseconds, axis.options.formatString, timeEpoch); break;
                }
                r.push(c);
                escape = false;
            } else {
                if (c === "%") {
                    escape = true;
                } else {
                    r.push(c);
                }
            }
        }

        return r.join("");
    }

    // To have a consistent view of time-based data independent of which time
    // zone the client happens to be in we need a date-like object independent
    // of time zones.  This is done through a wrapper that only calls the UTC
    // versions of the accessor methods.

    function makeUtcWrapper(d) {
        function addProxyMethod(sourceObj, sourceMethod, targetObj, targetMethod) {
            sourceObj[sourceMethod] = function() {
                return targetObj[targetMethod].apply(targetObj, arguments);
            };
        }

        var utc = {
            date: d
        };

        // support strftime, if found
        if (d.strftime !== undefined) {
            addProxyMethod(utc, "strftime", d, "strftime");
        }

        addProxyMethod(utc, "getTime", d, "getTime");
        addProxyMethod(utc, "setTime", d, "setTime");

        var props = ["Date", "Day", "FullYear", "Hours", "Milliseconds", "Minutes", "Month", "Seconds"];

        for (var p = 0; p < props.length; p++) {
            addProxyMethod(utc, "get" + props[p], d, "getUTC" + props[p]);
            addProxyMethod(utc, "set" + props[p], d, "setUTC" + props[p]);
        }

        return utc;
    }

    // select time zone strategy.  This returns a date-like object tied to the
    // desired timezone
    function dateGenerator(ts, opts) {
        var maxDateValue = 8640000000000000;

        ts *= 1000;

        if (ts > maxDateValue) {
            ts = maxDateValue;
        } else if (ts < -maxDateValue) {
            ts = -maxDateValue;
        }

        if (opts.timezone === "browser") {
            return new Date(ts);
        } else if (!opts.timezone || opts.timezone === "utc") {
            return makeUtcWrapper(new Date(ts));
        } else if (typeof timezoneJS !== "undefined" && typeof timezoneJS.Date !== "undefined") {
            var d = new timezoneJS.Date();
            // timezone-js is fickle, so be sure to set the time zone before
            // setting the time.
            d.setTimezone(opts.timezone);
            d.setTime(ts);
            return d;
        } else {
            return makeUtcWrapper(new Date(ts));
        }
    }

    // map of app. size of time units in milliseconds
    var timeUnitSize = {
        "millisecond": 0.001,
        "second": 1,
        "minute": 60,
        "hour": 60 * 60,
        "day": 24 * 60 * 60,
        "month": 30 * 24 * 60 * 60,
        "quarter": 3 * 30 * 24 * 60 * 60,
        "year": 365.2425 * 24 * 60 * 60
    };

    // the allowed tick sizes, after 1 year we use
    // an integer algorithm

    var baseSpec = [
        [1, "millisecond"], [2, "millisecond"], [5, "millisecond"], [10, "millisecond"],
        [25, "millisecond"], [50, "millisecond"], [100, "millisecond"], [250, "millisecond"], [500, "millisecond"],
        [1, "second"], [2, "second"], [5, "second"], [10, "second"],
        [30, "second"],
        [1, "minute"], [2, "minute"], [5, "minute"], [10, "minute"],
        [30, "minute"],
        [1, "hour"], [2, "hour"], [4, "hour"],
        [8, "hour"], [12, "hour"],
        [1, "day"], [2, "day"], [3, "day"],
        [0.25, "month"], [0.5, "month"], [1, "month"],
        [2, "month"]
    ];

    // we don't know which variant(s) we'll need yet, but generating both is
    // cheap

    var specMonths = baseSpec.concat([[3, "month"], [6, "month"],
        [1, "year"]]);
    var specQuarters = baseSpec.concat([[1, "quarter"], [2, "quarter"],
        [1, "year"]]);

    //function used for relative time axis to compute the first data point from which the values are starting
    function updateAxisFirstData(plot, axis) {
        var plotData = plot.getData();
        if (plotData.length > 0 && (plotData[0].data.length > 0 || plotData[0].datapoints.points.length > 0)) {
            var i, firstPlotData, minFirstPlotData, datapoints = plotData[0].datapoints;
            if (datapoints.points.length !== 0) {
                if (plotData[0].xaxis === axis || plotData[0].yaxis === axis) {
                    minFirstPlotData = axis.direction === "x" ? datapoints.points[0] : datapoints.points[1];
                } else { minFirstPlotData = axis.max; }
            } else { minFirstPlotData = axis.min; }

            for (i = 1; i < plotData.length; i++) {
                datapoints = plotData[i].datapoints;
                if (plotData[i].xaxis === axis || plotData[i].yaxis === axis) {
                    firstPlotData = axis.direction === "x" ? datapoints.points[0] : datapoints.points[1];
                    if (minFirstPlotData > firstPlotData) {
                        minFirstPlotData = firstPlotData;
                    }
                }
            }

            axis.valueOfFirstData = minFirstPlotData * 1000;
        }
    }

    function init(plot) {
        plot.hooks.processOptions.push(function (plot) {
            $.each(plot.getAxes(), function(axisName, axis) {
                var opts = axis.options;
                if (opts.format === "time") {
                    axis.tickGenerator = function(axis) {
                        var ticks = [],
                            d = dateGenerator(axis.min, opts),
                            minSize = 0;

                        if (axis.valueOfFirstData === undefined) {
                            updateAxisFirstData(plot, axis);
                        }

                        // make quarter use a possibility if quarters are
                        // mentioned in either of these options
                        var spec = (opts.tickSize && opts.tickSize[1] ===
                            "quarter") ||
                            (opts.minTickSize && opts.minTickSize[1] ===
                            "quarter") ? specQuarters : specMonths;

                        if (opts.minTickSize !== null && opts.minTickSize !== undefined) {
                            if (typeof opts.tickSize === "number") {
                                minSize = opts.tickSize;
                            } else {
                                minSize = opts.minTickSize[0] * timeUnitSize[opts.minTickSize[1]];
                            }
                        }

                        var delta = axis.delta * 2;
                        for (var i = 0; i < spec.length - 1; ++i) {
                            if (delta < (spec[i][0] * timeUnitSize[spec[i][1]] +
                                spec[i + 1][0] * timeUnitSize[spec[i + 1][1]]) / 2 &&
                                spec[i][0] * timeUnitSize[spec[i][1]] >= minSize) {
                                break;
                            }
                        }

                        var size = spec[i][0];
                        var unit = spec[i][1];
                        // special-case the possibility of several years
                        if (unit === "year") {
                            // if given a minTickSize in years, just use it,
                            // ensuring that it's an integer

                            if (opts.minTickSize !== null && opts.minTickSize !== undefined && opts.minTickSize[1] === "year") {
                                size = Math.floor(opts.minTickSize[0]);
                            } else {
                                var magn = Math.pow(10, Math.floor(Math.log(axis.delta / timeUnitSize.year) / Math.LN10));
                                var norm = (axis.delta / timeUnitSize.year) / magn;

                                if (norm < 1.5) {
                                    size = 1;
                                } else if (norm < 3) {
                                    size = 2;
                                } else if (norm < 7.5) {
                                    size = 5;
                                } else {
                                    size = 10;
                                }

                                size *= magn;
                            }

                            // minimum size for years is 1

                            if (size < 1) {
                                size = 1;
                            }
                        }

                        axis.tickSize = opts.tickSize || [size, unit];
                        var tickSize = axis.tickSize[0];
                        unit = axis.tickSize[1];

                        var step = tickSize * timeUnitSize[unit];

                        if (unit === "millisecond") {
                            d.setMilliseconds(floorInBase(d.getMilliseconds(), tickSize));
                        } else if (unit === "second") {
                            d.setSeconds(floorInBase(d.getSeconds(), tickSize));
                        } else if (unit === "minute") {
                            d.setMinutes(floorInBase(d.getMinutes(), tickSize));
                        } else if (unit === "hour") {
                            d.setHours(floorInBase(d.getHours(), tickSize));
                        } else if (unit === "month") {
                            d.setMonth(floorInBase(d.getMonth(), tickSize));
                        } else if (unit === "quarter") {
                            d.setMonth(3 * floorInBase(d.getMonth() / 3,
                                tickSize));
                        } else if (unit === "year") {
                            d.setFullYear(floorInBase(d.getFullYear(), tickSize));
                        }

                        // reset smaller components

                        if (step >= timeUnitSize.second) {
                            d.setMilliseconds(0);
                        }

                        if (step >= timeUnitSize.minute) {
                            d.setSeconds(0);
                        }
                        if (step >= timeUnitSize.hour) {
                            d.setMinutes(0);
                        }
                        if (step >= timeUnitSize.day) {
                            d.setHours(0);
                        }
                        if (step >= timeUnitSize.day * 4) {
                            d.setDate(1);
                        }
                        if (step >= timeUnitSize.month * 2) {
                            d.setMonth(floorInBase(d.getMonth(), 3));
                        }
                        if (step >= timeUnitSize.quarter * 2) {
                            d.setMonth(floorInBase(d.getMonth(), 6));
                        }
                        if (step >= timeUnitSize.year) {
                            d.setMonth(0);
                        }

                        var carry = 0;
                        var v = Number.NaN;
                        var v1000;
                        var prev;
                        do {
                            prev = v;
                            v1000 = d.getTime();
                            v = v1000 / 1000;
                            ticks.push(v);

                            if (unit === "month" || unit === "quarter") {
                                if (tickSize < 1) {
                                    // a bit complicated - we'll divide the
                                    // month/quarter up but we need to take
                                    // care of fractions so we don't end up in
                                    // the middle of a day
                                    d.setDate(1);
                                    var start = d.getTime();
                                    d.setMonth(d.getMonth() +
                                        (unit === "quarter" ? 3 : 1));
                                    var end = d.getTime();
                                    d.setTime((v + carry * timeUnitSize.hour + (end - start) * tickSize));
                                    carry = d.getHours();
                                    d.setHours(0);
                                } else {
                                    d.setMonth(d.getMonth() +
                                        tickSize * (unit === "quarter" ? 3 : 1));
                                }
                            } else if (unit === "year") {
                                d.setFullYear(d.getFullYear() + tickSize);
                            } else {
                                d.setTime((v + step) * 1000);
                            }
                        } while (v < axis.max && v !== prev);

                        return ticks;
                    };

                    axis.tickFormatter = function (v, axis) {
                        var d = dateGenerator(v, axis.options);
                        // first check global format
                        if (opts.timeformat !== null && opts.timeformat !== undefined) {
                            return formatDate(d, opts.timeformat, opts.monthNames, opts.dayNames, axis.tickSize[1] === 'millisecond', axis);
                        }
                    };
                }
            });
        });
    }

    $.plot.plugins.push({
        init: init,
        options: options,
        name: 'time',
        version: '1.0'
    });

    // Time-axis support used to be in Flot core, which exposed the
    // formatDate function on the plot object.  Various plugins depend
    // on the function, so we need to re-expose it here.

    $.plot.formatDate = formatDate;
    $.plot.dateGenerator = dateGenerator;
})(jQuery);
