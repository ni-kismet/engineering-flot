(function ($) {
    "use strict";

    var Constants  = {
        DIGITAL_PLOT_HEIGHT: 1,
        DIGITAL_PLOT_SPACE: 0.5
    }

    var pluginName = "waveform";
    var pluginVersion = "0.0.1";

    var options = {
        waveform: {
            active: false
        }
    };

    var svgNS = "http://www.w3.org/2000/svg";
    var expanderRectangleSize = 12; // TODO - compute this based on font size
    var spaceForTree = expanderRectangleSize + 8;

    function init(plot) {
        plot.hooks.processOptions.push(processOptions);

        function processOptions(plot, options) {
            if (options.waveform.active) {
                plot.hooks.drawSeries.push(drawSeries);
                plot.hooks.axisReserveSpace.push(reserveSpaceForDigitalAxis);
                plot.hooks.drawAxis.push(drawDigitalAxis);
                plot.hooks.drawOverlay.push(drawDigitalAxesOverlay);
            }

            /* look for axes with absPixels option and set a getter for the max property
            so that the axis coordinates are always expressed in pixels.
            These are used by digital axes, these aren't supposed to zoom or depend on
            the heigth of the graphs*/
            plot.getXAxes().concat(plot.getYAxes()).forEach(function (axis) {
                if (axis.options.absPixels) {
                    Object.defineProperty(axis, 'max', {
                        get: function () {
                            return axis.min + plot.height()/15;
                        },
                        set: function () {}
                    });
                }
            });
        }

        /* adjust the space reserved for digital the axes */
        function reserveSpaceForDigitalAxis(plot, axis) {
            if (axis.options.type === 'digital') {
                axis.labelWidth += spaceForTree;
            }
        }

        /* Draw the tree on the digital axis.
        TODO: remove jQuery and use a svg library like savage or svg.js to make it readable.
        */
        function drawTree(plot, axis, svglayer, box, i, tick) {
            var g = document.createElementNS(svgNS, 'g');
            $(g).appendTo(svglayer);
            var plotOffset = plot.getPlotOffset();
            var y = plotOffset.top + axis.p2c(tick.v);

            if (tick.label.group) {
                var rect = document.createElementNS(svgNS, 'rect');
                $(rect).attr('x', box.left);
                $(rect).attr('y', y - expanderRectangleSize / 2);
                $(rect).attr('width', expanderRectangleSize);
                $(rect).attr('height', expanderRectangleSize);
                $(rect).attr('fill', 'white');
                $(rect).appendTo(g);
                var hline = document.createElementNS(svgNS, 'line');
                $(hline).attr('x1', box.left + 2);
                $(hline).attr('y1', y);
                $(hline).attr('x2', box.left + expanderRectangleSize - 2);
                $(hline).attr('y2', y);
                $(hline).appendTo(g);

                if (tick.label.hidden) {
                    var vline = document.createElementNS(svgNS, 'line');
                    $(vline).attr('x1', box.left + expanderRectangleSize / 2);
                    $(vline).attr('y1', y - expanderRectangleSize / 2 + 2);
                    $(vline).attr('x2', box.left + expanderRectangleSize / 2);
                    $(vline).attr('y2', y + expanderRectangleSize / 2 - 2);
                    $(vline).appendTo(g);
                }
            } else {
                var line = document.createElementNS(svgNS, 'line');
                $(line).attr('x1', box.left + expanderRectangleSize / 2);
                $(line).attr('y1', y);
                $(line).attr('x2', box.left + expanderRectangleSize / 2);
                $(line).attr('y2', y - axis.p2c(Constants.DIGITAL_PLOT_HEIGHT + Constants.DIGITAL_PLOT_SPACE) + axis.p2c(0));
                $(line).appendTo(g);
                var line2 = document.createElementNS(svgNS, 'line');
                $(line2).attr('x1', box.left + expanderRectangleSize / 2);
                $(line2).attr('y1', y);
                $(line2).attr('x2', box.left + expanderRectangleSize / 2 + 5);
                $(line2).attr('y2', y);
                $(line2).appendTo(g);
            }
        }

        /*draw a transparent rectangle on the overlay layer that captures mouse events*/
        function drawTreeOverlay(plot, axis, svglayer, box, i, tick) {
            var g = document.createElementNS(svgNS, 'g');
            $(g).appendTo(svglayer);
            $(g).css({
                'pointer-events': 'fill'
            });
            var plotOffset = plot.getPlotOffset();
            var y = plotOffset.top + axis.p2c(tick.v);

            if (tick.label.group) {
                var rect = document.createElementNS(svgNS, 'rect');
                $(rect).attr('x', box.left);
                $(rect).attr('y', y - expanderRectangleSize / 2);
                $(rect).attr('width', expanderRectangleSize);
                $(rect).attr('height', expanderRectangleSize);
                $(rect).attr('fill', 'rgba(0, 0, 0, 0)');
                $(rect).attr('stroke', 'none');
                $(rect).appendTo(g);

                $(g).bind('click', function () {
                    console.log('click!', axis, tick);
                    $(plot.getPlaceholder()).trigger('GroupCollapse', tick.label.groupNumber)
                });
            }
        }

        /* draw transparent rectangles on the SVG overlay layer so we can capture the
        click events on expanders.
        A flot graph is composed of multiple layers and mouse events only reach the upper ones.*/
        function drawDigitalAxesOverlay(plot, octx, surface) {
            plot.getYAxes().forEach(function (axis) {
                if (axis.options.type === 'digital') {
                    var box = axis.box;
                    var tick, x, y;
                    var plotOffset = plot.getPlotOffset();

                    var svglayer = surface.getSVGLayer('flot-axis' + axis.n);
                    $(svglayer).addClass('digital-axis-tree');

                    $(svglayer).empty();

                    for (var i = axis.ticks.length - 1; i >= 0; --i) {
                        tick = axis.ticks[i];
                        if (!tick.label || tick.v < axis.min || tick.v > axis.max)
                            continue;

                        y = plotOffset.top + axis.p2c(tick.v);
                        x = box.left + spaceForTree;

                        drawTreeOverlay(plot, axis, svglayer, box, i, tick);
                    }

                }
            });
        }

        /* draw the group and signal labels and "trees" connecting the groups to signals
        for the digital axis*/
        function drawDigitalAxis(plot, axis, surface) {
            if (axis.options.type === 'digital') {
                var box = axis.box;
                var tick, x, y;
                var plotOffset = plot.getPlotOffset();

                var svglayer = surface.getSVGLayer('flot-axis' + axis.n);
                $(svglayer).addClass('digital-axis-tree');

                $(svglayer).empty();

                for (var i = axis.ticks.length - 1; i >= 0; --i) {
                    tick = axis.ticks[i];
                    if (!tick.label || tick.v < axis.min || tick.v > axis.max)
                        continue;

                    y = plotOffset.top + axis.p2c(tick.v);
                    x = box.left + spaceForTree;

                    var text = document.createElementNS(svgNS, 'text');
                    $(text).attr('x', x);
                    $(text).attr('y', y);
                    $(text).attr('text-anchor', 'left');
                    $(text).attr('alignment-baseline', 'central');
                    text.textContent = tick.label.name;

                    $(text).appendTo(svglayer);
                    drawTree(plot, axis, svglayer, box, i, tick);
                }

            }
        }

        /* Custom renderer for waveform groups */
        function drawSeries(plot, ctx, series) {
            if (series.waveform && series.waveform.show) {
                let offset = plot.getPlotOffset();
                let prev = {
                    x: undefined,
                    y: undefined
                };
                let index = plot.getData().indexOf(series);

                ctx.save();
                ctx.strokeStyle = 'rgba(0,0,0,0)';
                ctx.beginPath();
                ctx.rect(offset.left, offset.top, plot.width(), plot.height());
                ctx.stroke();
                ctx.clip();

                ctx.strokeStyle = series.color;
                ctx.fillStyle = series.color;
                ctx.lineWidth = series.lines.lineWidth || 1;
                ctx.font = "14px Mono";
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                var points = series.datapoints.points;
                for (var iPoints = 0; iPoints < points.length; iPoints+=2) {
                    if (typeof(points[iPoints + 1]) === 'boolean') {
                      drawBoolWave(plot, ctx, offset, prev, series, index, points.slice(iPoints, iPoints + 2), iPoints === points.length - 1);
                    } else {
                      drawWave(plot, ctx, offset, prev, series, index, points.slice(iPoints, iPoints + 2), iPoints === points.length - 1);
                    }
                }
                ctx.restore();
            }
        }

        /* Custom renderer for integer waveform groups */
        function drawWave(plot, ctx, offset, prev, series, index, data, last) {
            var start = 0.1;
            var end = 0.9;

            if (prev.x === undefined) {
                start = 0;
            }

            if (last) {
                end = 1;
            }

            var x = offset.left + series.xaxis.p2c(data[0] + start);

            if (x > offset.left + plot.width()) {
                return;
            }

            var x1 = offset.left + series.xaxis.p2c(data[0] + end);
            var x2 = offset.left + series.xaxis.p2c(data[0] + 1.1);

            if (x2 < offset.left) {
                return;
            }

            var y = offset.top + series.yaxis.p2c(index * (Constants.DIGITAL_PLOT_HEIGHT + Constants.DIGITAL_PLOT_SPACE));

            if (y < offset.top) {
                return;
            }

            var y1 = offset.top + series.yaxis.p2c(index * (Constants.DIGITAL_PLOT_HEIGHT + Constants.DIGITAL_PLOT_SPACE) + Constants.DIGITAL_PLOT_HEIGHT);

            if (y1 > offset.top + plot.height()) {
                return;
            }

            ctx.beginPath();

            ctx.moveTo(x, y);
            ctx.lineTo(x1, y);
            if (!last) {
                ctx.lineTo(x2, y1);
            }
            ctx.moveTo(x, y1);
            ctx.lineTo(x1, y1);
            if (!last) {
                ctx.lineTo(x2, y);
            }

            ctx.stroke();

            if (x1 - x > 30)
                ctx.fillText((data[1] | 0 ).toString(), x + (x1 - x) / 2, y + (y1 - y) / 2);

            prev.x = x;
            prev.y = y;
        }

        /* Custom renderer for boolean waveform groups */
        function drawBoolWave(plot, ctx, offset, prev, series, index, data, last) {
            var start = 0.1;
            var end = 0.9;

            if (prev.x === undefined) {
                start = 0;
            }

            if (last) {
                end = 1;
            }

            var x = offset.left + series.xaxis.p2c(data[0] + start);

            if (x > offset.left + plot.width()) {
                return;
            }

            var x1 = offset.left + series.xaxis.p2c(data[0] + end);

            if (x1 < offset.left) {
                return;
            }

            var y = offset.top + series.yaxis.p2c(index * (Constants.DIGITAL_PLOT_HEIGHT + Constants.DIGITAL_PLOT_SPACE));

            if (y < offset.top) {
                return;
            }

            var y1 = offset.top + series.yaxis.p2c(index * (Constants.DIGITAL_PLOT_HEIGHT + Constants.DIGITAL_PLOT_SPACE) + Constants.DIGITAL_PLOT_HEIGHT);

            if (y1 > offset.top + plot.height()) {
                return;
            }

            ctx.beginPath();

            if (prev.x) {
              ctx.moveTo(prev.x, prev.y);
            } else {
              ctx.moveTo(x, data[1] ? y1 : y);
            }
            ctx.lineTo(x, data[1] ? y1 : y);
            ctx.lineTo(x1, data[1] ? y1 : y);

            ctx.stroke();

            if (x1 - x > 40)
                ctx.fillText(data[1].toString(), x + (x1 - x) / 2, y + (y1 - y) / 2);

            prev.x = x1;
            prev.y = data[1] ? y1 : y;
        }

    }

    $.plot.plugins.push({
        init: init,
        options: options,
        name: pluginName,
        version: pluginVersion
    });
})(jQuery);
