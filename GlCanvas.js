(function(global, $) {
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
        var container, canvas, width, height,
            renderer, pixelRatio;
        plot.hooks.processOptions.push(processOptions);

        function processOptions(plot, options) {
            var mainScene, camera, cameraFocus;
            container = plot.getPlaceholder()[0];

            if(!canvas) {
                canvas = getGlSurface("flot-gl", container);
            }
    
            if(!renderer) {
                renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: false, alpha: true });
                mainScene = new THREE.Scene();
                camera = new THREE.OrthographicCamera(width / 2, -width / 2, -height / 2, height / 2, 0.1, 1000);
                cameraFocus = new THREE.Vector3(width / 2, height / 2, 1000);

                var devicePixelRatio = window.devicePixelRatio || 1;
                var backingStoreRatio =
                        renderer.webkitBackingStorePixelRatio ||
                        renderer.mozBackingStorePixelRatio ||
                        renderer.msBackingStorePixelRatio ||
                        renderer.oBackingStorePixelRatio ||
                        renderer.backingStorePixelRatio || 1;
    
                pixelRatio = devicePixelRatio / backingStoreRatio;
            } else {
                mainScene = renderer.userData.mainScene;
                camera = renderer.userData.camera;
                cameraFocus = camera.userData.cameraFocus;
            }

            // Setup the THREE.OrthographicCamera
            camera.aspect = width / height;
            camera.position.set(width / 2, height / 2, 0);
            camera.lookAt(cameraFocus);
            camera.updateMatrixWorld();
            camera.updateProjectionMatrix();

            // Setup the THREE.WebGLRenderer
            renderer.setPixelRatio(pixelRatio);
            renderer.setSize(width, height, true);
            renderer.autoClear = true;
            renderer.userData = {};

            // Save settings for future reuse.
            camera.userData.cameraFocus = cameraFocus;
            renderer.userData.camera = camera;
            renderer.userData.mainScene = mainScene;
            renderer.userData.plotOffset = defaultPlotOffset;

            resize(plot, width, height);
            
            plot.hooks.drawSeries.push(drawSeries);
            plot.hooks.draw.push(render);
            plot.hooks.resize.push(resize);
            plot.hooks.drawBackground.push(clear);
            plot.hooks.shutdown.push(shutdown);
        };

        function getGlSurface(cls, container) {
            var element = container.getElementsByClassName(cls)[0];
            var flotBaseElement = container.getElementsByClassName("flot-base")[0];

            if (!element) {
                element = document.createElement('canvas');
                element.className = cls;
                element.style.direction = 'ltr';
                element.style.position = 'absolute';
                element.style.left = '0px';
                element.style.top = '0px';

                container.insertBefore(element, flotBaseElement.nextSibling);
            }

            // Determine the screen's ratio of physical to device-independent
            // pixels.  This is the ratio between the canvas width that the browser
            // advertises and the number of pixels actually present in that space.

            // The iPhone 4, for example, has a device-independent width of 320px,
            // but its screen is actually 640px wide.  It therefore has a pixel
            // ratio of 2, while most normal devices have a ratio of 1.

            
            var box = container.getBoundingClientRect();

            // Size the canvas to match the internal dimensions of its container
            width = box.width;
            height = box.height;

            return element;
        };

        function render() {
            var camera = renderer.userData.camera,
                mainScene = renderer.userData.mainScene,
                cameraFocus = camera.userData.cameraFocus,
                plotOffset = renderer.userData.plotOffset || defaultPlotOffset;

            cameraFocus.x = width / 2;
            cameraFocus.y = height / 2;
            cameraFocus.z = 1000;

            renderer.setSize(width, height, false);
            renderer.setViewport(0, 0, width, height);

            camera.position.set(width / 2, height / 2, 0);
            camera.lookAt(cameraFocus);
            camera.updateProjectionMatrix();
            camera.updateMatrixWorld();

            renderer.setScissor(
                plotOffset.left,
                plotOffset.top,
                width - plotOffset.right - plotOffset.left,
                height - plotOffset.bottom - plotOffset.top
            );
            renderer.render(mainScene, camera);
            renderer.clearDepth();
        };

        function resize(plot, newWidth, newHeight) {
            var userData = renderer.userData,
                minSize = 10,
                shouldresize = false,
                element = canvas;
    
                newWidth = newWidth < minSize ? minSize : newWidth;
                newHeight = newHeight < minSize ? minSize : newHeight;
    
                // Resize the canvas, increasing its density based on the display's
                // pixel ratio; basically giving it more pixels without increasing the
                // size of its element, to take advantage of the fact that retina
                // displays have that many more pixels in the same advertised space.
        
                // Resizing should reset the state (excanvas seems to be buggy though)
        
                if (width !== newWidth) {
                    element.width = newWidth * pixelRatio;
                    element.style.width = newWidth + 'px';
                    width = newWidth;
                    shouldresize = true; 
                }
        
                if (height !== newHeight) {
                    element.height = newHeight * pixelRatio;
                    element.style.height = newHeight + 'px';
                    height = newHeight;
                    shouldresize = true;
                }
    
                if (renderer && shouldresize) {
                    var mainscene = renderer.userData.mainScene,
                        camera = renderer.userData.camera;
    
                    renderer.setClearColor(0xff0000, 0);
                    renderer.setSize(width, height, false);
                    renderer.setPixelRatio(pixelRatio);
    
                    if(camera) {
                        camera.aspect = width/height;
                        camera.userData.cameraFocus.x = width / 2;
                        camera.userData.cameraFocus.y = height / 2;
                        camera.userData.cameraFocus.z = 1000;
        
                        camera.position.set(width / 2, height / 2, 0);
                        camera.lookAt(camera.userData.cameraFocus);
                        camera.updateMatrixWorld();
                        camera.updateProjectionMatrix();
                    }

                    renderer.clear();
                }
        };

        function clear() {
            if (renderer) {
                // Clear the canvas
                mainscene = renderer.userData.mainScene;
                renderer.setClearColor(0x0f0f0f, 0.2);
                renderer.setScissorTest(false);
                renderer.clear();
    
                while (mainscene.children.length > 0) {
                    mainscene.remove(mainscene.children[0]);
                }
    
                renderer.setClearColor(0xff0000, 0.2);
                renderer.setScissorTest(true);
                renderer.clear();
            }
        };

        function shutdown() {
            renderer.dispose();
            canvas.remove();
        };

        function drawSeries(plot, ctx, serie, index, getColorOrGradient) {
            var plotOffset = plot.getPlotOffset(),
                plotWidth, plotHeight;
            if(serie.points.glshow || serie.points.show) {
                serie.points.show = false;
                serie.points.glshow = true;
                renderer.userData.plotOffset = plotOffset;

                // generate a texture if needed
                if(!textures[index]) {
                    var filloptions = getFillStyle(serie.points, serie.color, null, null, getColorOrGradient) || serie.color;
                    textures[index] = generateTexture(serie.points.symbol, serie.points.lineWidth, serie.color, filloptions, plot.drawSymbol)
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
                    plotWidth = width - plotOffset.left - plotOffset.right;
                    plotHeight = height - plotOffset.bottom - plotOffset.top;
                    // TODO: return Vector3 array of p2c coords after switching to BufferGeometry.
                    datapoints.points = serie.decimatePoints(
                        serie, 
                        serie.xaxis.min, 
                        serie.xaxis.max, 
                        plotWidth, 
                        serie.yaxis.min, 
                        serie.yaxis.max, 
                        plotHeight
                    );
                }

                drawSeriesPoints(renderer, datapoints, index, plotOffset, serie.xaxis, serie.yaxis);
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

        function generateTexture(symbol, lineWidth, color, filloptions, drawSymbol) {
            var textureCanvas, context, texture;

            textureCanvas = document.createElement('canvas');
            textureCanvas.width = 128;
            textureCanvas.height = 128;
            context = textureCanvas.getContext('2d');
            context.clearRect(0, 0, 128, 128);
            context.globalAlpha = 1;
            context.strokeStyle = color;
            context.lineWidth = lineWidth * 10 || 10;

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

        function drawSeriesPoints(renderer, datapoints, index, offset, axisx, axisy) {
            var mainscene = renderer.userData.mainScene,
                geometry = geometries[index],
                material = materials[index],
                vertices = geometry.vertices,
                points = datapoints.points,
                ps = datapoints.pointsize, 
                x, y, z = 1000 - index;
            var i = 0, j = 0, k = 0;
        
            // move/create each vertex
            for (i = 0; i < points.length; i += ps) {
                if (points[i] == null) {
                    j++;
                    continue;
                }
                
                if (points[i] < axisx.min || points[i] > axisx.max || points[i + 1] < axisy.min || points[i + 1] > axisy.max) {
                    if (vertices[i / ps - j]) {
                        vertices[i / ps - j].z = -1;
                    }
                    continue;
                }

                x = axisx.p2c(points[i]) + offset.left;
                y = axisy.p2c(points[i + 1]) + offset.top;

                if (!vertices[i / ps - j]) {
                    vertices[i / ps - j] = new THREE.Vector3(x, y, z);
                } else {
                    vertices[i / ps - j].x = x;
                    vertices[i / ps - j].y = y;
                    vertices[i / ps - j].z = z;
                }
            }
            
            if (vertices.length > points.length / ps) {
                for(k = points.length / ps; k < vertices.length; k++) {
                    vertices[k].z = -1;
                }
            }

            if(points.length > 0) {
                geometry.verticesNeedUpdate = true;
                geometry.dynamic = true;

                mainscene.add(new THREE.Points(geometry, material));
            }
        };
    };
};

var glplotter = new GlPlotter();
$.plot.plugins.push({
    init: glplotter.init,
    name: glplotter.pluginName,
    version: glplotter.pluginVersion
});
global.GlPlotter = GlPlotter;
})(this, jQuery);