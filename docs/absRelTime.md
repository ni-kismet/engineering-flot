## jquery.flot.absRelTime.js

This plugin is used to format the time axis in absolute time representation as
well as relative time representation.

It supports the following options:
```js
xaxis: {
   timezone: null, // "browser" for local to the client or timezone for timezone-js
   timeformat: null, // format string to use
   twelveHourClock: false, // 12 or 24 time in time mode
   monthNames: null // list of names of months
}
```

Depending upon the timeformat axis parameter value, the axis tick formatter will
choose between an absolute time representation if the value is '%A' or
relative time for timeformat '%r'.

If the format for an axis is 'time', inside processOptions hook the tickGenerator
and tickFormatter of the axis will be overrided with the custom ones used by time axes.

### Relative time axis
A relative time axis will show the time values with respect to the first data sample.
Basically, the first datapoint from the points array will be considered time 00:00:00:00.
If the difference between two datapoints is small, the milliseconds will apear.
Otherwise, the time representation will contain only the hour, minute and second.

### Absolute time axis
The absolute time representation contains, beside the hours, minutes and secconds
corresponding to the sample the date and year.
The value will be splitted on two rows, where the first row is the time and
the the second one the date in gregorian date format.
