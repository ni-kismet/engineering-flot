(function($) {
    "use strict";

    var GlDrawSeries = function() {           
        function drawSeriesPoints(series, scene, plotOffset, plotWidth, plotHeight, drawSymbol, getColorOrGradient) {
            var texture = scene.userData.texture;
            var material = scene.userData.material;
            var geometry = new THREE.Geometry();

            // create point texture
            if(!texture) {
                var textureCanvas = document.createElement('canvas');
                textureCanvas.width = 128;
                textureCanvas.height = 128;
                var context = textureCanvas.getContext( '2d' );
                context.globalAlpha = 1;
                context.strokeStyle = series.color;
                context.lineWidth = series.points.lineWidth * 10 || 10;

                context.arc(64, 64, 32, 0, 2 * Math.PI);
                context.fillStyle = getFillStyle(series.points, series.color, null, null, getColorOrGradient) || series.color;

                context.fill();   
                context.stroke();

                texture = new THREE.Texture(textureCanvas);
                texture.needsUpdate = true;

                // save texture for future draw
                scene.userData.texture = texture;
            }

            // update points material from texture
            if(!material || texture.needsUpdate) {
                material = new THREE.PointsMaterial({ size: series.points.radius / 20, map: texture, transparent: true, alphaTest: .1 });
                material.needsUpdate = true;

                // save material for future draw
                scene.userData.material = material;
            }

            // clear the scene
            while(scene.children.length > 0){ 
                scene.remove(scene.children[0]); 
            }

            function plotPoints(datapoints, radius, fill, offset, shadow, axisx, axisy) {
                var points = datapoints.points,
                    ps = datapoints.pointsize, x, y, down, top, left, right;
         

                for (var i = 0; i < points.length; i += ps) {
                    if (points[i] == null || points[i] < axisx.min || points[i] > axisx.max || points[i + 1] < axisy.min || points[i + 1] > axisy.max) {
                        continue;
                    }
                    x = axisx.p2c(points[i]) + offset.left/2;
                    y = axisy.p2c(points[i + 1]) - offset.top/2;

                    geometry.vertices.push(new THREE.Vector3(x - plotWidth/2, -y + plotHeight/2, 0));
                }
                scene.add(new THREE.Points(geometry, material));
            }

            var datapoints = {
                points: series.datapoints.points,
                pointsize: series.datapoints.pointsize
            };

            if (series.decimatePoints) {
                datapoints.points = series.decimatePoints(series, series.xaxis.min, series.xaxis.max, plotWidth, series.yaxis.min, series.yaxis.max, plotHeight);
            }
            plotPoints(datapoints, series.points.radius, true, plotOffset, false, series.xaxis, series.yaxis);
        }

        function getFillStyle(filloptions, seriesColor, bottom, top, getColorOrGradient) {
            var fill = filloptions.fill;
            if (!fill) {
                return null;
            }

            if (filloptions.fillColor) {
                return getColorOrGradient(filloptions.fillColor, bottom, top, seriesColor);
            }

            var c = $.color.parse(seriesColor);
            c.a = typeof fill === "number" ? fill : 0.4;
            c.normalize();
            return c.toString();
        }

        this.drawSeriesPoints = drawSeriesPoints;
    };

    $.plot.gldrawSeries = new GlDrawSeries();
})(jQuery);
