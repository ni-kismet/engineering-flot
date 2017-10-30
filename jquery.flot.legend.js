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

        var entries = [],
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
                        color: s.color,
                        style: {
                            lines: s.lines,
                            points: s.points,
                            bars: s.bars
                        }
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
        var html = [],
            j = 0;
        html[j++] = '<svg class="legendLayer" width="100%" height="100%">';// viewBox="0 0 160 250" preserveAspectRatio="none">';
        html[j++] = svgShapeDefs;
        for (i = 0; i < entries.length; ++i) {
            var entry = entries[i];
            var entryHtml = '';
            var shapeHtml = '';
            var labelHtml = '';
            var xpos = "0em";
            var ypos = i * 1.5 + "em";
            var shape = { 
                    label: entry.label,
                    position: {
                        x: xpos,
                        y: ypos
                    }
                };
            if (entry.style.lines.show) {
                shape.name = "lines";
                shape.position = { 
                        x: "0em", 
                        y: i * 1.5 + "em" 
                    };
                shape.strokeColor = entry.color;
                shape.strokeWidth = entry.style.lines.lineWidth;
                shapeHtml += getEntryHtml(shape);
            }
            if (entry.style.points.show) {
                shape.name = entry.style.points.symbol;
                shape.position = { 
                        x: "0em", 
                        y: i * 1.5 + "em" 
                    };
                shape.strokeColor = entry.color;
                shape.fillColor = entry.style.points.fillColor;
                shape.strokeWidth = entry.style.points.lineWidth;
                shapeHtml += getEntryHtml(shape);
            }
            if (entry.style.bars.show) {
                shape.name = "bar";
                shape.position = { 
                        x: "0em", 
                        y: i * 1.5 + "em" 
                    };
                shape.fillColor = entry.color;
                shapeHtml += getEntryHtml(shape);
            }
            // area?
            if (false) {
                shape.name = "area";
                shape.position = { 
                        x: "0em", 
                        y: i * 1.5 + "em" 
                    };
                shape.fillColor = entry.color;
                shapeHtml += getEntryHtml(shape);
            }
            labelHtml = '<text x="' + xpos + '" y="' + ypos +'" text-anchor="start"><tspan dx="2em" dy="1em">' + shape.label + '</tspan></text>'
            html[j++] = '<g>' + shapeHtml + labelHtml + '</g>';
        }

        html[j++] = '</svg>';
        if (options.legend.container != null) {
            $(options.legend.container).html(html.join(''));
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

            var legendEl = $('<div class="legend" style="position:absolute;' + pos +'">' + html.join('') + '</div>').appendTo(placeholder);
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
                        c = $.color.extract(legendEl, 'background-color');
                    }

                    c.a = 1;
                    c = c.toString();
                }
                var div = legendEl.children();
                // $('<div style="position:absolute;width:' +
                //     div.width() + 'px;height:' +
                //     div.height() + 'px;' +
                //     pos + 'background-color:' +
                //     c + ';"> </div>')
                // .prependTo(legendEl).css('opacity', options.legend.backgroundOpacity);
            }
        }
    }

    var svgShapeDefs = `
        <defs>
            <symbol id="line" fill="none" viewBox="-5 -5 25 25">
                <polyline points="0,15 5,5 10,10 15,0"/>
            </symbol>

            <symbol id="area" stroke-width="1" viewBox="-5 -5 25 25">
                <polyline points="0,15 5,5 10,10 15,0, 15,15, 0,15"/>
            </symbol>

            <symbol id="bars" stroke-width="1" viewBox="-5 -5 25 25">
                <polyline points="1.5,15.5 1.5,12.5, 4.5,12.5 4.5,15.5 6.5,15.5 6.5,3.5, 9.5,3.5 9.5,15.5 11.5,15.5 11.5,7.5 14.5,7.5 14.5,15.5 1.5,15.5"/>
            </symbol>

            <symbol id="circle" viewBox="-5 -5 25 25">
                <circle cx="0" cy="15" r="2.5"/>
                <circle cx="5" cy="5" r="2.5"/>
                <circle cx="10" cy="10" r="2.5"/>
                <circle cx="15" cy="0" r="2.5"/>
            </symbol>

            <symbol id="rectangle" viewBox="-5 -5 25 25">
                <rect x="-2.1" y="12.9" width="4.2" height="4.2"/>
                <rect x="2.9" y="2.9" width="4.2" height="4.2"/>
                <rect x="7.9" y="7.9" width="4.2" height="4.2"/>
                <rect x="12.9" y="-2.1" width="4.2" height="4.2"/>
            </symbol>

            <symbol id="diamond" viewBox="-5 -5 25 25">
                <path d="M-3,15 L0,12 L3,15, L0,18 Z"/>
                <path d="M2,5 L5,2 L8,5, L5,8 Z"/>
                <path d="M7,10 L10,7 L13,10, L10,13 Z"/>
                <path d="M12,0 L15,-3 L18,0, L15,3 Z"/>
            </symbol>

            <symbol id="cross" fill="none" viewBox="-5 -5 25 25">
                <path d="M-2.1,12.9 L2.1,17.1, M2.1,12.9 L-2.1,17.1 Z"/>
                <path d="M2.9,2.9 L7.1,7.1 M7.1,2.9 L2.9,7.1 Z"/>
                <path d="M7.9,7.9 L12.1,12.1 M12.1,7.9 L7.9,12.1 Z"/>
                <path d="M12.9,-2.1 L17.1,2.1 M17.1,-2.1 L12.9,2.1 Z"/>
            </symbol>

            <symbol id="plus" fill="none" viewBox="-5 -5 25 25">
                <path d="M0,12 L0,18, M-3,15 L3,15 Z"/>
                <path d="M5,2 L5,8 M2,5 L8,5 Z"/>
                <path d="M10,7 L10,13 M7,10 L13,10 Z"/>
                <path d="M15,-3 L15,3 M12,0 L18,0 Z"/>
            </symbol>
        </defs>`;

    function getEntryHtml(shape) {
        var html = '',
            name = shape.name,
            x = shape.position.x,
            y = shape.position.y,
            fill = shape.fillColor,
            stroke = shape.strokeColor,
            width = shape.strokeWidth;
        switch(name) {
            case "circle":
                html = '<use xlink:href="#circle" class="legendIcon" ' +
                    'x="' + x + '" ' + 
                    'y="' + y + '" ' +
                    'fill="' + fill + '" ' +
                    'stroke="' + stroke + '" ' +
                    'stroke-width="' + width + '" ' + 
                    'width="25" height="25"' +
                    '/>';
                break;
            case "diamond":
                html = '<use xlink:href="#diamond" class="legendIcon" ' +
                    'x="' + x + '" ' + 
                    'y="' + y + '" ' +
                    'fill="' + fill + '" ' +
                    'stroke="' + stroke + '" ' +
                    'stroke-width="' + width + '" ' +
                    'width="25" height="25"' +
                    '/>';
                break;
            case "cross":
                html = '<use xlink:href="#cross" class="legendIcon" ' +
                    'x="' + x + '" ' + 
                    'y="' + y + '" ' +
                    // 'fill="' + fill + '" ' +
                    'stroke="' + stroke + '" ' +
                    'stroke-width="' + width + '" ' +
                    'width="25" height="25"' + 
                    '/>';
                break;
            case "square":
                html = '<use xlink:href="#rectangle" class="legendIcon" ' +
                    'x="' + x + '" ' + 
                    'y="' + y + '" ' +
                    'fill="' + fill + '" ' +
                    'stroke="' + stroke + '" ' +
                    'stroke-width="' + width + '" ' +
                    'width="25" height="25"' + 
                    '/>';
                break;
            case "plus":
                html = '<use xlink:href="#plus" class="legendIcon" ' +
                    'x="' + x + '" ' + 
                    'y="' + y + '" ' +
                    // 'fill="' + fill + '" ' +
                    'stroke="' + stroke + '" ' +
                    'stroke-width="' + width + '" ' + 
                    'width="25" height="25"' +
                    '/>';
                break;
            case "bar":
                html = '<use xlink:href="#bars" class="legendIcon" ' +
                    'x="' + x + '" ' + 
                    'y="' + y + '" ' +
                    'fill="' + fill + '" ' +
                    // 'stroke="' + stroke + '" ' +
                    // 'stroke-width="' + width + '" ' + 
                    'width="25" height="25"' +
                    '/>';
                break;
            case "area":
                html = '<use xlink:href="#area" class="legendIcon" ' +
                    'x="' + x + '" ' + 
                    'y="' + y + '" ' +
                    'fill="' + fill + '" ' +
                    // 'stroke="' + stroke + '" ' +
                    // 'stroke-width="' + width + '" ' + 
                    'width="25" height="25"' +
                    '/>';
                break;
            case "line":
                html = '<use xlink:href="#line" class="legendIcon" ' +
                    'x="' + x + '" ' + 
                    'y="' + y + '" ' +
                    // 'fill="' + fill + '" ' +
                    'stroke="' + stroke + '" ' +
                    'stroke-width="' + width + '" ' + 
                    'width="25" height="25"' +
                    '/>';
                break;
            default:
                // default is line
                html = '<use xlink:href="#line" class="legendIcon" ' +
                    'x="' + x + '" ' + 
                    'y="' + y + '" ' +
                    // 'fill="' + fill + '" ' +
                    'stroke="' + stroke + '" ' +
                    'stroke-width="' + width + '" ' + 
                    'width="25" height="25"' +
                    '/>';
        }

        return html;
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


/*
<style>
	.legend {
     	border-style: solid; 
        border-color: black;
    }
</style>

//////////

	<div style="">
		<svg class="legend" width="100%" height="100%" viewBox="0 0 160 250" preserveAspectRatio="none">
        	<defs>
            	<g id="line" fill="none">
                	<polyline points="0,15 5,5 10,10 15,0"/>
                </g>
                
                <g id="area" stroke-width="0">
                	<polyline points="0,15 5,5 10,10 15,0, 15,15, 0,15"/>
                </g>
                
                <g id="bars" stroke-width="0">
                	<polyline points="1.5,15.5 1.5,12.5, 4.5,12.5 4.5,15.5 6.5,15.5 6.5,3.5, 9.5,3.5 9.5,15.5 11.5,15.5 11.5,7.5 14.5,7.5 14.5,15.5 1.5,15.5"/>
               	</g>
                
                <g id="circle">
                	<circle cx="0" cy="15" r="3"/>
                	<circle cx="5" cy="5" r="3"/>
                	<circle cx="10" cy="10" r="3"/>
                	<circle cx="15" cy="0" r="3"/>
                </g>
                
                <g id="rectangle">
                	<rect x="-2.1" y="12.9" width="4.2" height="4.2"/>
                    <rect x="2.9" y="2.9" width="4.2" height="4.2"/>
                    <rect x="7.9" y="7.9" width="4.2" height="4.2"/>
                    <rect x="12.9" y="-2.1" width="4.2" height="4.2"/>
                </g>
                
                <g id="diamond">
                	<path d="M-3,15 L0,12 L3,15, L0,18 Z"/>
                    <path d="M2,5 L5,2 L8,5, L5,8 Z"/>
                    <path d="M7,10 L10,7 L13,10, L10,13 Z"/>
                    <path d="M12,0 L15,-3 L18,0, L15,3 Z"/>
                </g>
                
                <g id="cross" fill="none">
                	<path d="M-2.1,12.9 L2.1,17.1, M2.1,12.9 L-2.1,17.1 Z"/>
                    <path d="M2.9,2.9 L7.1,7.1 M7.1,2.9 L2.9,7.1 Z"/>
                    <path d="M7.9,7.9 L12.1,12.1 M12.1,7.9 L7.9,12.1 Z"/>
                    <path d="M12.9,-2.1 L17.1,2.1 M17.1,-2.1 L12.9,2.1 Z"/>
                </g>
                
                <g id="plus" fill="none">
                	<path d="M0,12 L0,18, M-3,15 L3,15 Z"/>
                    <path d="M5,2 L5,8 M2,5 L8,5 Z"/>
                    <path d="M10,7 L10,13 M7,10 L13,10 Z"/>
                    <path d="M15,-3 L15,3 M12,0 L18,0 Z"/>
                </g>
            </defs>
            <g>
            	<use xlink:href="#line" x="10" y="10" fill="none" stroke="#FF0000" stroke-width="1"/>
            	<text font-size="25" x="40" y="25">Lines</text>
            </g>
            
            <g>
            	<use xlink:href="#area" x="10" y="40" fill="#FF00F0"/>
            	<text font-size="25" x="40" y="55">Area</text>
            </g>
            
            <g>
            	<use xlink:href="#bars" x="10" y="70" fill="#0000FF"/>
            	<text font-size="25" x="40" y="85">Bars</text>
            </g>
            
            <g>
            	<use xlink:href="#circle" x="10" y="100" fill="#F0F000" stroke="#A0A000" stroke-width="1"/>
            	<text font-size="25" x="40" y="115">Circles</text>
            </g>
            
            <g>
            	<use xlink:href="#diamond" x="10" y="130" fill="#F0F000" stroke="#A0A000" stroke-width="1"/>
            	<text font-size="25" x="40" y="145">Diamond</text>
            </g>
            
            <g>
            	<use xlink:href="#cross" x="10" y="160" fill="#F0F000" stroke="#A0A000" stroke-width="1"/>
            	<text font-size="25" x="40" y="175">Cross</text>
            </g>
            
            <g>
            	<use xlink:href="#rectangle" x="10" y="190" fill="#F0F000" stroke="#A0A000" stroke-width="1"/>
            	<text font-size="25" x="40" y="205">Rectangle</text>
            </g>
            
            <g>
            	<use xlink:href="#plus" x="10" y="220" fill="#F0F000" stroke="#A0A000" stroke-width="1"/>
            	<text font-size="25" x="40" y="235">Plus</text>
            </g>
        </svg>      	
	</div>
*/