(function() {
function GlPlotter() {
    this.pluginName = 'glplotter';
    this.pluginVersion = '0.2';

    /**
     * Initialize a webgl layer
     */
    this.init = function(plot) {
        var defaultPlotOffset = {
            left: 0,
            right: 0,
            top: 0,
            bottom: 0
        };

        var textures = [],
            materials = [],
            geometries = [];

        plot.hooks.processOptions.push(processOptions);

        function processOptions(plot, options) {
            var container = plot.getPlaceholder(),
                webglsurface = plot.getWebGlSurface(),
                canvas = plot.getWebGlCanvas(),
                width = webglsurface.width,
                height = webglsurface.height,
                renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: false, alpha: true }),
                mainScene = new THREE.Scene(),
                camera = new THREE.OrthographicCamera(webglsurface.width / 2, -webglsurface.width / 2, -webglsurface.height / 2, webglsurface.height / 2, 0.1, 1000),
                cameraFocus = new THREE.Vector3(width / 2, height / 2, 1000);

            // Setup the THREE.OrthographicCamera
            camera.aspect = width / height;
            camera.position.set(width / 2, height / 2, 0);
            camera.lookAt(cameraFocus);
            camera.updateMatrixWorld();
            camera.updateProjectionMatrix();

            // Setup the THREE.WebGLRenderer
            renderer.setPixelRatio(webglsurface.pixelRatio);
            renderer.setSize(webglsurface.width, webglsurface.height, true);
            renderer.autoClear = true;

            // Save settings for future reuse.
            camera.userData.cameraFocus = cameraFocus;
            renderer.userData.camera = camera;
            renderer.userData.mainScene = mainScene;
            renderer.userData.plotOffset = defaultPlotOffset;
            
            this.renderer = renderer;
            webglsurface.render = getRenderingFunction(renderer);

            if(renderer) {
                plot.hooks.drawSeries.push(drawSeries);
            }
        };

        function getRenderingFunction(renderer) {
            if(renderer) {
                return function() {
                    var camera = renderer.userData.camera,
                        mainScene = renderer.userData.mainScene,
                        cameraFocus = camera.userData.cameraFocus,
                        plotOffset = renderer.userData.plotOffset || defaultPlotOffset;

                    cameraFocus.x = this.width / 2;
                    cameraFocus.y = this.height / 2;
                    cameraFocus.z = 1000;

                    renderer.clear();
                    renderer.setSize(this.width, this.height, false);
                    renderer.setViewport(0, 0, this.width, this.height);

                    camera.position.set(this.width / 2, this.height / 2, 0);
                    camera.lookAt(cameraFocus);
                    camera.updateProjectionMatrix();
                    camera.updateMatrixWorld();

                    renderer.setScissor(plotOffset.left, plotOffset.top, rendererSize.width - plotOffset.right - plotOffset.left, rendererSize.height - plotOffset.bottom - plotOffset.top);
                    renderer.render(mainscene, camera);
                    renderer.clearDepth();
                };
            } else {
                return function() {};
            }
        };

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
        };

        function generateTexture(symbol, filloptions, drawSymbol) {
            var textureCanvas, context, texture;

            textureCanvas = document.createElement('canvas');
            textureCanvas.width = 128;
            textureCanvas.height = 128;
            context = textureCanvas.getContext('2d');
            context.clearRect(0, 0, 128, 128);
            context.globalAlpha = 1;
            context.strokeStyle = series.color;
            context.lineWidth = series.points.lineWidth * 10 || 10;

            if (symbol === "circle") {
                context.arc(64, 64, 32, 0, 2 * Math.PI);
            } else if (typeof symbol === 'string' && drawSymbol && drawSymbol[symbol]) {
                drawSymbol[symbol](context, 64, 64, 32, false);
            } else if (typeof drawSymbol === 'function') {
                drawSymbol(context, 64, 64, 32, false);
            }

            context.fillStyle = filloptions;
            context.fill();
            context.stroke();
            texture = new THREE.Texture(textureCanvas);
            texture.needsUpdate = true;

            return texture;
        };

        function drawSeries(plot, ctx, serie, index) {
            var plotOffset = plot.getOffset(),
                webglsurface = plot.getWebGlSurface();
            var plotWidth, plotHeight;
            if(serie.points.glshow || serie.points.show) {
                serie.points.show = false;
                serie.points.glshow = true;
                this.renderer.userData.plotOffset = plotOffset;

                // generate a texture if needed
                if(!textures[index]) {
                    var filloptions = getFillStyle(serie.points, serie.color, null, null, getColorOrGradient) || serie.color;
                    textures[index] = generateTexture(serie.points.symbol, filloptions, plot.drawSymbol)
                }

                // generate a material if texture changed
                if (!materials[index] || textures[index].needsUpdate) {
                    materials[index] = new THREE.PointsMaterial({
                            size: serie.points.radius * 4,
                            sizeAttenuation: false,
                            map: textures[index],
                            transparent: true,
                            alphaTest: 0.1
                        });
                    materials[index].needsUpdate = true;
                }

                // generate a geometry
                // TODO: switch to buffer geometry for better performance
                if(!geometries[index]) {
                    geometries[index] = new THREE.Geometry();
                }

                var datapoints = {
                    points: serie.datapoints.points,
                    pointsize: serie.datapoints.pointsize
                };
    
                if (serie.decimatePoints) {
                    //after adjusting the axis, plot width and height will be modified
                    plotWidth = surface.width - plotOffset.left - plotOffset.right;
                    plotHeight = surface.height - plotOffset.bottom - plotOffset.top;
                    datapoints.points = serie.decimatePoints(serie, serie.xaxis.min, serie.xaxis.max, plot., series.yaxis.min, series.yaxis.max, plotHeight);
                }

                drawSeriesPoints(serie, index)
            }
        };

        function drawSeriesPoints()
    }
}
})();