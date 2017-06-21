/* Flot plugin for drawing legends.

*/

(function($) {
    var placeholder, options;

    var options = {
        legend: {
            show: true,
            noColumns: 1, // number of colums in legend table
            labelFormatter: null, // fn: string -> string
            labelBoxBorderColor: "#ccc", // border color for the little label boxes
            container: null, // container (as jQuery object) to put legend in, null means default on top of graph
            position: "ne", // position of default legend container within plot
            margin: 5, // distance from grid edge to default legend container within plot
            backgroundColor: null, // null means auto-detect
            backgroundOpacity: 0.85, // set to 0 to avoid background
            sorted: null // default to no legend sorting
        }
    };

    function insertLegend(plot) {
        var series = plot.getData(),
            plotOffset = plot.getPlotOffset();
            
        if (options.legend.container != null) {
            $(options.legend.container).html("");
        } else {
            placeholder.find(".legend").remove();
        }

        if (!options.legend.show) {
            return;
        }

        var fragments = [],
            entries = [],
            rowStarted = false,
            lf = options.legend.labelFormatter,
            s, label;

        // Build a list of legend entries, with each having a label and a color
        for (var i = 0; i < series.length; ++i) {
            s = series[i];
            if (s.label) {
                label = lf ? lf(s.label, s) : s.label;
                if (label) {
                    entries.push({
                        label: label,
                        color: s.color
                    });
                }
            }
        }

        // Sort the legend using either the default or a custom comparator
        if (options.legend.sorted) {
            if ($.isFunction(options.legend.sorted)) {
                entries.sort(options.legend.sorted);
            } else if (options.legend.sorted === "reverse") {
                entries.reverse();
            } else {
                var ascending = options.legend.sorted !== "descending";
                entries.sort(function(a, b) {
                    return a.label === b.label
                        ? 0
                        : ((a.label < b.label) !== ascending ? 1 : -1 // Logical XOR
                        );
                });
            }
        }

        // Generate markup for the list of entries, in their final order

        for (i = 0; i < entries.length; ++i) {
            var entry = entries[i];

            if (i % options.legend.noColumns === 0) {
                if (rowStarted) {
                    fragments.push('</tr>');
                }

                fragments.push('<tr>');
                rowStarted = true;
            }

            fragments.push(
                '<td class="legendColorBox"><div style="border:1px solid ' + options.legend.labelBoxBorderColor + ';padding:1px"><div style="width:4px;height:0;border:5px solid ' + entry.color + ';overflow:hidden"></div></div></td>' +
                '<td class="legendLabel">' + entry.label + '</td>'
            );
        }

        if (rowStarted) {
            fragments.push('</tr>');
        }

        if (fragments.length === 0) {
            return;
        }

        var table = '<table style="font-size:smaller;color:' + options.grid.color + '">' + fragments.join("") + '</table>';
        if (options.legend.container != null) {
            $(options.legend.container).html(table);
        } else {
            var pos = "",
                p = options.legend.position,
                m = options.legend.margin;
            if (m[0] == null) {
                m = [m, m];
            }

            if (p.charAt(0) === "n") {
                pos += 'top:' + (m[1] + plotOffset.top) + 'px;';
            } else if (p.charAt(0) === "s") {
                pos += 'bottom:' + (m[1] + plotOffset.bottom) + 'px;';
            }

            if (p.charAt(1) === "e") {
                pos += 'right:' + (m[0] + plotOffset.right) + 'px;';
            } else if (p.charAt(1) === "w") {
                pos += 'left:' + (m[0] + plotOffset.left) + 'px;';
            }

            var legend = $('<div class="legend">' + table.replace('style="', 'style="position:absolute;' + pos + ';') + '</div>').appendTo(placeholder);
            if (options.legend.backgroundOpacity !== 0.0) {
                // put in the transparent background
                // separately to avoid blended labels and
                // label boxes
                var c = options.legend.backgroundColor;
                if (c == null) {
                    c = options.grid.backgroundColor;
                    if (c && typeof c === "string") {
                        c = $.color.parse(c);
                    } else {
                        c = $.color.extract(legend, 'background-color');
                    }

                    c.a = 1;
                    c = c.toString();
                }
                var div = legend.children();
                $('<div style="position:absolute;width:' + div.width() + 'px;height:' + div.height() + 'px;' + pos + 'background-color:' + c + ';"> </div>').prependTo(legend).css('opacity', options.legend.backgroundOpacity);
            }
        }
    }

    function init(plot) {
        placeholder = plot.getPlaceholder();
        options = plot.getOptions();

        plot.hooks.setupGrid.push(function (plot) {
            insertLegend(plot);
        });
    }

    $.plot.plugins.push({
        init: init,
        options: options,
        name: "legend",
        version: "0.1"
    });
})(jQuery);
