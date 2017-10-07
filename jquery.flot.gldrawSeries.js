(function($) {
    "use strict";

    var GlDrawSeries = function() {   
        /**
         * TODO: - set camera projection matrics instead of calling axis.p2c 
         *       - Improve memory management for points allocation
         * @param {*} series 
         * @param {*} scene 
         * @param {*} plotOffset 
         * @param {*} plotWidth 
         * @param {*} plotHeight 
         * @param {*} drawSymbol 
         * @param {*} getColorOrGradient 
         */      
        function drawSeriesPoints(series, plotscene, mainscene,  plotOffset, plotWidth, plotHeight, drawSymbol, getColorOrGradient) {
            var texture = plotscene.userData.texture;
            var material = plotscene.userData.material;
            var geometry = plotscene.userData.geometry;

            // create point texture
            if(!texture) {
                var symbol = series.points.symbol;
                var textureCanvas = document.createElement('canvas');
                textureCanvas.width = 128;
                textureCanvas.height = 128;
                var context = textureCanvas.getContext('2d');
                context.clearRect(0, 0, 128, 128);
                context.globalAlpha = 1;
                context.strokeStyle = series.color;
                context.lineWidth = series.points.lineWidth * 10 || 10;

                if(symbol === "circle") {
                    context.arc(64, 64, 32, 0, 2 * Math.PI);
                } else if (typeof symbol === 'string' && drawSymbol && drawSymbol[symbol]) {
                    drawSymbol[symbol](context, 64, 64, 32, false);
                } else if (typeof drawSymbol === 'function') {
                    drawSymbol(context, 64, 64, 32, false);
                }

                context.fillStyle = getFillStyle(series.points, series.color, null, null, getColorOrGradient) || series.color;
                context.fill();   
                context.stroke();
                texture = new THREE.Texture(textureCanvas);
                texture.needsUpdate = true;

                // save texture for future draw
                plotscene.userData.texture = texture;
            }

            // update points material from texture
            if(!material || texture.needsUpdate) {
                material = new THREE.PointsMaterial({ size: series.points.radius / 10, map: texture, transparent: true, alphaTest: .1 });
                material.needsUpdate = true;

                // save material for future draw
                plotscene.userData.material = material;
            }

            if(!geometry) {
                geometry = plotscene.userData.geometry = new THREE.Geometry();;
            } else {
                geometry.verticesNeedUpdate = true;
                geometry.dynamic = true;
            }

            // clear the scene
            while(plotscene.children.length > 0){ 
                plotscene.remove(plotscene.children[0]); 
            }

            function plotPoints(datapoints, radius, fill, offset, shadow, axisx, axisy) {
                var points = datapoints.points,
                    ps = datapoints.pointsize, x, y, down, top, left, right;
                var j = 0;
                for (var i = 0; i < points.length; i += ps) {
                    if (points[i] == null) {
                        // move the point behind the camera
                        j++;
                        continue;
                    }

                    if(points[i] < axisx.min || points[i] > axisx.max || points[i + 1] < axisy.min || points[i + 1] > axisy.max) {
                        if(geometry.vertices[i/ps - j]) {
                            geometry.vertices[i/ps - j].z = -1;
                        }
                        continue;
                    }

                    // TODO: update camera projection matrix instead of axis.p2c() 
                    x = axisx.p2c(points[i]) + offset.left;
                    y = axisy.p2c(points[i + 1]) + offset.top;

                    if(geometry.vertices.length > points.length / ps) {
                        geometry.vertices = geometry.vertices.slice(0, points.length / ps);
                    }
                    if(!geometry.vertices[i / ps - j]) {
                        geometry.vertices[i / ps - j] = new THREE.Vector3(x , y, 5);
                    } 

                    geometry.vertices[i / ps - j].x = x;
                    geometry.vertices[i / ps - j].y = y;
                    geometry.vertices[i / ps - j].z = 5;

                    
                }
                mainscene.add(new THREE.Points(geometry, material));
            }

            var datapoints = {
                points: series.datapoints.points,
                pointsize: series.datapoints.pointsize
            };

            if (series.decimatePoints) {
                datapoints.points = series.decimatePoints(series, series.xaxis.min, series.xaxis.max, plotWidth, series.yaxis.min, series.yaxis.max, plotHeight);
            }
            mainscene.userData.plotOffset = plotOffset;
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
