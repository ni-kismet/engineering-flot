///////////////////////////////////////////////////////////////////////////
// The Canvas object is a wrapper around an HTML5 <canvas> tag.
//
// @constructor
// @param {string} cls List of classes to apply to the canvas.
// @param {element} container Element onto which to append the canvas.
//
// Requiring a container is a little iffy, but unfortunately canvas
// operations don't work unless the canvas is attached to the DOM.

(function() {
    var Canvas = function(cls, container) {
        var element = container.getElementsByClassName(cls)[0];

        if (!element) {
            element = document.createElement('canvas');
            element.className = cls;
            element.style.direction = 'ltr';
            element.style.position = 'absolute';
            element.style.left = '0px';
            element.style.top = '0px';

            container.appendChild(element);

            // If HTML5 Canvas isn't available, throw

            if (!element.getContext) {
                throw new Error('Canvas is not available.');
            }
        }

        this.element = element;

        var context = this.context = element.getContext('2d');

        // Determine the screen's ratio of physical to device-independent
        // pixels.  This is the ratio between the canvas width that the browser
        // advertises and the number of pixels actually present in that space.

        // The iPhone 4, for example, has a device-independent width of 320px,
        // but its screen is actually 640px wide.  It therefore has a pixel
        // ratio of 2, while most normal devices have a ratio of 1.

        var devicePixelRatio = window.devicePixelRatio || 1,
            backingStoreRatio =
            context.webkitBackingStorePixelRatio ||
            context.mozBackingStorePixelRatio ||
            context.msBackingStorePixelRatio ||
            context.oBackingStorePixelRatio ||
            context.backingStorePixelRatio || 1;

        this.pixelRatio = devicePixelRatio / backingStoreRatio;

        // Size the canvas to match the internal dimensions of its container

        var box = container.getBoundingClientRect();
        this.resize(box.width, box.height);

        // Collection of HTML div layers for text overlaid onto the canvas

        this.textContainer = null;
        this.SVGContainer = null;
        this.text = {};
        this.SVG = {};

        // Cache of text fragments and metrics, so we can avoid expensively
        // re-calculating them when the plot is re-rendered in a loop.

        this._textCache = {};
    }

    // Resizes the canvas to the given dimensions.
    //
    // @param {number} width New width of the canvas, in pixels.
    // @param {number} width New height of the canvas, in pixels.

    Canvas.prototype.resize = function(width, height) {
        var minSize = 10;
        width = width < minSize ? minSize : width;
        height = height < minSize ? minSize : height;

        var element = this.element,
            context = this.context,
            pixelRatio = this.pixelRatio;

        // Resize the canvas, increasing its density based on the display's
        // pixel ratio; basically giving it more pixels without increasing the
        // size of its element, to take advantage of the fact that retina
        // displays have that many more pixels in the same advertised space.

        // Resizing should reset the state (excanvas seems to be buggy though)

        if (this.width !== width) {
            element.width = width * pixelRatio;
            element.style.width = width + 'px';
            this.width = width;
        }

        if (this.height !== height) {
            element.height = height * pixelRatio;
            element.style.height = height + 'px';
            this.height = height;
        }

        // Save the context, so we can reset in case we get replotted.  The
        // restore ensure that we're really back at the initial state, and
        // should be safe even if we haven't saved the initial state yet.

        context.restore();
        context.save();

        // Scale the coordinate space to match the display density; so even though we
        // may have twice as many pixels, we still want lines and other drawing to
        // appear at the same size; the extra pixels will just make them crisper.

        context.scale(pixelRatio, pixelRatio);
    };

    // Clears the entire canvas area, not including any overlaid HTML text

    Canvas.prototype.clear = function() {
        this.context.clearRect(0, 0, this.width, this.height);
    };

    // Finishes rendering the canvas, including managing the text overlay.

    Canvas.prototype.render = function() {
        var cache = this._textCache;

        // For each text layer, add elements marked as active that haven't
        // already been rendered, and remove those that are no longer active.

        for (var layerKey in cache) {
            if (hasOwnProperty.call(cache, layerKey)) {
                var layer = this.getTextLayer(layerKey),
                    layerCache = cache[layerKey];

                var display = layer.style.display;
                layer.style.display = 'none';

                for (var styleKey in layerCache) {
                    if (hasOwnProperty.call(layerCache, styleKey)) {
                        var styleCache = layerCache[styleKey];
                        for (var key in styleCache) {
                            if (hasOwnProperty.call(styleCache, key)) {
                                var val = styleCache[key],
                                    positions = val.positions;

                                for (var i = 0, position; positions[i]; i++) {
                                    position = positions[i];
                                    if (position.active) {
                                        if (!position.rendered) {
                                            layer.appendChild(position.element);
                                            position.rendered = true;
                                        }
                                    } else {
                                        positions.splice(i--, 1);
                                        if (position.rendered) {
                                            position.element.parentNode.removeChild(position.element);
                                        }
                                    }
                                }

                                if (positions.length === 0) {
                                    if (val.measured) {
                                        val.measured = false;
                                    } else {
                                        delete styleCache[key];
                                    }
                                }
                            }
                        }
                    }
                }

                layer.style.display = display;
            }
        }
    };

    // Creates (if necessary) and returns the text overlay container.
    //
    // @param {string} classes String of space-separated CSS classes used to
    //     uniquely identify the text layer.
    // @return {object} The text-layer div.

    Canvas.prototype.getTextLayer = function(classes) {
        var layer = this.text[classes];

        // Create the text layer if it doesn't exist

        if (!layer) {
            // Create the text layer container, if it doesn't exist
            if (!this.textContainer) {
                this.textContainer = document.createElement('div');
                this.textContainer.className = 'flot-text';
                this.textContainer.style.position = 'absolute';
                this.textContainer.style.top = '0px';
                this.textContainer.style.left = '0px';
                this.textContainer.style.bottom = '0px';
                this.textContainer.style.right = '0px';
                this.textContainer.style.color = 'inherit';
                this.element.parentNode.insertBefore(this.textContainer, this.element);
            }

            layer = document.createElement('div');
            layer.className = classes;
            layer.style.position = 'absolute';
            layer.style.top = '0px';
            layer.style.left = '0px';
            layer.style.bottom = '0px';
            layer.style.right = '0px';
            this.textContainer.appendChild(layer);
            this.text[classes] = layer;
        }

        return layer;
    };

    // Creates (if necessary) and returns the SVG overlay container.
    //
    // @param {string} classes String of space-separated CSS classes used to
    //     uniquely identify the text layer.
    // @return {object} The text-layer div.

    Canvas.prototype.getSVGLayer = function(classes) {
        var layer = this.SVG[classes];

        // Create the SVG layer if it doesn't exist

        if (!layer) {
            // Create the text layer container, if it doesn't exist

            var svgElement;

            if (!this.SVGContainer) {
                this.SVGContainer = document.createElement('div');
                this.SVGContainer.className = 'flot-svg';
                this.SVGContainer.style.position = 'absolute';
                this.SVGContainer.style.top = '0px';
                this.SVGContainer.style.left = '0px';
                this.SVGContainer.style.bottom = '0px';
                this.SVGContainer.style.right = '0px';
                this.SVGContainer.style.pointerEvents = 'none';
                this.element.parentNode.insertAfter(this.SVGContainer, this.element);

                svgElement = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                svgElement.style.width = '100%';
                svgElement.style.height = '100%';
                this.SVGContainer.appendChild(svgElement);
            } else {
                svgElement = this.SVGContainer.getElementsByName('svg')[0];
            }

            layer = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            layer.className = 'classes';
            layer.style.position = 'absolute';
            layer.style.top = '0px';
            layer.style.left = '0px';
            layer.style.bottom = '0px';
            layer.style.right = '0px';
            layer.style.fill = '#aaaaaa';
            svgElement.appendChild(layer, this.element);

            this.SVG[classes] = layer;
        }

        return layer;
    };

    // Creates (if necessary) and returns a text info object.
    //
    // The object looks like this:
    //
    // {
    //     width: Width of the text's wrapper div.
    //     height: Height of the text's wrapper div.
    //     element: The HTML div containing the text.
    //     positions: Array of positions at which this text is drawn.
    // }
    //
    // The positions array contains objects that look like this:
    //
    // {
    //     active: Flag indicating whether the text should be visible.
    //     rendered: Flag indicating whether the text is currently visible.
    //     element: The HTML div containing the text.
    //     text: The actual text and is identical with element[0].innerHTML.
    //     x: X coordinate at which to draw the text.
    //     y: Y coordinate at which to draw the text.
    // }
    //
    // Each position after the first receives a clone of the original element.
    //
    // The idea is that that the width, height, and general 'identity' of the
    // text is constant no matter where it is placed; the placements are a
    // secondary property.
    //
    // Canvas maintains a cache of recently-used text info objects; getTextInfo
    // either returns the cached element or creates a new entry.
    //
    // @param {string} layer A string of space-separated CSS classes uniquely
    //     identifying the layer containing this text.
    // @param {string} text Text string to retrieve info for.
    // @param {(string|object)=} font Either a string of space-separated CSS
    //     classes or a font-spec object, defining the text's font and style.
    // @param {number=} angle Angle at which to rotate the text, in degrees.
    //     Angle is currently unused, it will be implemented in the future.
    // @param {number=} width Maximum width of the text before it wraps.
    // @return {object} a text info object.

    Canvas.prototype.getTextInfo = function(layer, text, font, angle, width) {
        var textStyle, layerCache, styleCache, info;

        // Cast the value to a string, in case we were given a number or such

        text = '' + text;

        // If the font is a font-spec object, generate a CSS font definition

        if (typeof font === 'object') {
            textStyle = font.style + ' ' + font.variant + ' ' + font.weight + ' ' + font.size + 'px/' + font.lineHeight + 'px ' + font.family;
        } else {
            textStyle = font;
        }

        // Retrieve (or create) the cache for the text's layer and styles

        layerCache = this._textCache[layer];

        if (layerCache == null) {
            layerCache = this._textCache[layer] = {};
        }

        styleCache = layerCache[textStyle];

        if (styleCache == null) {
            styleCache = layerCache[textStyle] = {};
        }

        var key = generateKey(text);
        info = styleCache[key];

        // If we can't find a matching element in our cache, create a new one

        if (!info) {
            var element = document.createElement('div');
            element.innerHTML = text;
            element.style.position = 'absolute';
            element.style.maxWidth = width;
            element.style.top = '-9999px';

            if (typeof font === 'object') {
                element.style.font = textStyle;
                element.style.color = font.color;
            } else if (typeof font === 'string') {
                element.className = font;
            }

            this.getTextLayer(layer).appendChild(element);

            info = styleCache[key] = {
                width: element.offsetWidth,
                height: element.offsetHeight,
                measured: true,
                element: element,
                positions: []
            };

            element.parentNode.removeChild(element);
        }

        info.measured = true;
        return info;
    };

    // Adds a text string to the canvas text overlay.
    //
    // The text isn't drawn immediately; it is marked as rendering, which will
    // result in its addition to the canvas on the next render pass.
    //
    // @param {string} layer A string of space-separated CSS classes uniquely
    //     identifying the layer containing this text.
    // @param {number} x X coordinate at which to draw the text.
    // @param {number} y Y coordinate at which to draw the text.
    // @param {string} text Text string to draw.
    // @param {(string|object)=} font Either a string of space-separated CSS
    //     classes or a font-spec object, defining the text's font and style.
    // @param {number=} angle Angle at which to rotate the text, in degrees.
    //     Angle is currently unused, it will be implemented in the future.
    // @param {number=} width Maximum width of the text before it wraps.
    // @param {string=} halign Horizontal alignment of the text; either "left",
    //     "center" or "right".
    // @param {string=} valign Vertical alignment of the text; either "top",
    //     "middle" or "bottom".

    Canvas.prototype.addText = function(layer, x, y, text, font, angle, width, halign, valign) {
        var info = this.getTextInfo(layer, text, font, angle, width),
            positions = info.positions;

        // Tweak the div's position to match the text's alignment

        if (halign === 'center') {
            x -= info.width / 2;
        } else if (halign === 'right') {
            x -= info.width;
        }

        if (valign === 'middle') {
            y -= info.height / 2;
        } else if (valign === 'bottom') {
            y -= info.height;
        }

        // Determine whether this text already exists at this position.
        // If so, mark it for inclusion in the next render pass.

        for (var i = 0, position; positions[i]; i++) {
            position = positions[i];
            if (position.x === x && position.y === y && position.text === text) {
                position.active = true;
                return;
            } else if (position.active === false) {
                position.active = true;
                position.text = text;
                position.x = x;
                position.y = y;
                position.element.style.top = Math.round(y) + 'px';
                position.element.style.left = Math.round(x) + 'px';
                position.element.innerHTML = text;
                return;
            }
        }

        // If the text doesn't exist at this position, create a new entry

        // For the very first position we'll re-use the original element,
        // while for subsequent ones we'll clone it.

        position = {
            active: true,
            rendered: false,
            element: positions.length ? info.element.cloneNode() : info.element,
            text: text,
            x: x,
            y: y
        };

        positions.push(position);

        // Move the element to its final position within the container

        position.element.style.top = Math.round(y) + 'px';
        position.element.style.left = Math.round(x) + 'px';
        position.element.style.textAlign = halign;

        position.element.innerHTML = text;
    };

    /**
     * 
     * Removes one or more text strings from the canvas text overlay.
     *
     * If no parameters are given, all text within the layer is removed.
     *
     * Note that the text is not immediately removed; it is simply marked as
     * inactive, which will result in its removal on the next render pass.
     * This avoids the performance penalty for 'clear and redraw' behavior,
     * where we potentially get rid of all text on a layer, but will likely
     * add back most or all of it later, as when redrawing axes, for example.
     *
     * @param {string} layer A string of space-separated CSS classes uniquely
     * identifying the layer containing this text.
     * @param {number=} x X coordinate of the text.
     * @param {number=} y Y coordinate of the text.
     * @param {string=} text Text string to remove.
     * @param {(string|object)=} font Either a string of space-separated CSS
     * classes or a font-spec object, defining the text's font and style.
     * @param {number=} angle Angle at which the text is rotated, in degrees.
     * Angle is currently unused, it will be implemented in the future.
     */
    Canvas.prototype.removeText = function(layer, x, y, text, font, angle) {
        var position, i;
        if (text == null) {
            var layerCache = this._textCache[layer];
            if (layerCache != null) {
                for (var styleKey in layerCache) {
                    if (hasOwnProperty.call(layerCache, styleKey)) {
                        var styleCache = layerCache[styleKey];
                        for (var key in styleCache) {
                            if (hasOwnProperty.call(styleCache, key)) {
                                var positions = styleCache[key].positions;
                                for (i = 0; positions[i]; i++) {
                                    position = positions[i];
                                    position.active = false;
                                }
                            }
                        }
                    }
                }
            }
        } else {
            positions = this.getTextInfo(layer, text, font, angle).positions;
            for (i = 0; positions[i]; i++) {
                position = positions[i];
                if (position.x === x && position.y === y && position.text === text) {
                    position.active = false;
                }
            }
        }
    };

    // Clears the cache used to speed up the text size measurements.
    // As an (unfortunate) side effect all text within the text Layer is removed.
    // Use this function before plot.setupGrid() and plot.draw() in one of these
    // cases:
    // 1. The plot just became visible.
    // 2. The styles changed.
    Canvas.prototype.clearCache = function() {
        var cache = this._textCache;
        for (var layerKey in cache) {
            if (hasOwnProperty.call(cache, layerKey)) {
                var layer = this.getTextLayer(layerKey);
                while (layer.firstChild) {
                    layer.removeChild(layer.firstChild);
                }
            }
        };

        this._textCache = {};
    };

    /**
     * The WebGlCanvas object is a wrapper around an HTML5 <canvas> tag with a webgl context.
     * 
     * @constructor
     * @param {string} cls The class name of the element
     * @param {element} container Element onto which to append the canvas.
     */
    var WebGlCanvas = function(cls, container) {
        var element = container.getElementsByClassName(cls)[0];
        var renderer, camera,
            scenes = [new THREE.Scene()],
            mainscene = new THREE.Scene();

        if (!element) {
            element = document.createElement('canvas');
            element.className = cls;
            element.style.direction = 'ltr';
            element.style.position = 'absolute';
            element.style.left = '0px';
            element.style.top = '0px';

            container.appendChild(element);

            // If HTML5 Canvas isn't available, throw
            if (!element.getContext) {
                throw new Error('Canvas is not available.');
            }
        }
        renderer = new THREE.WebGLRenderer({canvas: element, antialias: false, alpha: true });

        // Determine the screen's ratio of physical to device-independent
        // pixels.  This is the ratio between the canvas width that the browser
        // advertises and the number of pixels actually present in that space.

        // The iPhone 4, for example, has a device-independent width of 320px,
        // but its screen is actually 640px wide.  It therefore has a pixel
        // ratio of 2, while most normal devices have a ratio of 1.

        var devicePixelRatio = window.devicePixelRatio || 1,
            backingStoreRatio = 1,
            box = container.getBoundingClientRect(),
            rendererSize = { width: box.width, height: box.height };

        // Size the canvas to match the internal dimensions of its container
        this.width = box.width;
        this.height = box.height;

        this.element = element;
        this.scenes = scenes;
        this.mainscene = mainscene;
        this.camera = camera = new THREE.OrthographicCamera(this.width / 2, -this.width / 2, -this.height / 2, this.height / 2, 0.1, 1000);
        this.renderer = renderer;
        this.scale = { x: 1, y: 1, z: 1 };
        if (renderer) {
            backingStoreRatio =
            renderer.webkitBackingStorePixelRatio ||
            renderer.mozBackingStorePixelRatio ||
            renderer.msBackingStorePixelRatio ||
            renderer.oBackingStorePixelRatio ||
            renderer.backingStorePixelRatio || 1;

            this.pixelRatio = devicePixelRatio / backingStoreRatio;
            mainscene.userData.pixelRatio = this.pixelRatio;
            mainscene.userData.rendererSize = rendererSize;
            renderer.setPixelRatio(this.pixelRatio);
            renderer.setSize(this.width, this.height, true);
            renderer.setPixelRatio(this.pixelRatio);
            renderer.autoClear = true;
            camera.aspect = this.width / this.height;
            
            this.cameraSight = new THREE.Vector3(this.width / 2, this.height / 2, 1000);
            camera.position.set(this.width / 2, this.height / 2, 0);
            camera.lookAt(this.cameraSight);
            camera.updateMatrixWorld();
            camera.updateProjectionMatrix();

            this.clear();
        } else {
            console.warn('WebGL not supported on this device.');
        }
    };

    /**
     * Resizes the canvas to the given dimensions.
     * 
     * @param {number} width The desired width of the canvas
     * @param {number} heigh The desired height of the canvas
     */
    WebGlCanvas.prototype.resize = function(width, height) {
        var renderer = this.renderer,
            mainscene = this.mainscene,
            scenes = this.scenes,
            camera = this.camera
            minSize = 10,
            shouldresize = false,
            element = this.element,
            pixelRatio = this.pixelRatio,
            scale = this.scale;

            width = width < minSize ? minSize : width;
            height = height < minSize ? minSize : height;

            // Resize the canvas, increasing its density based on the display's
            // pixel ratio; basically giving it more pixels without increasing the
            // size of its element, to take advantage of the fact that retina
            // displays have that many more pixels in the same advertised space.
    
            // Resizing should reset the state (excanvas seems to be buggy though)
    
            if (this.width !== width) {
                scale.x = 1;
                element.width = width * pixelRatio;
                element.style.width = width + 'px';
                this.width = width;
                shouldresize = true; 
            }
    
            if (this.height !== height) {
                scale.y = 1;
                element.height = height * pixelRatio;
                element.style.height = height + 'px';
                this.height = height;
                shouldresize = true;
            }

            scale.z = 1;

            // Scale the coordinate space to match the display density; so even though we
            // may have twice as many pixels, we still want lines and other drawing to
            // appear at the same size; the extra pixels will just make them crisper.

            if (renderer && shouldresize) {
                renderer.clear();
                mainscene.userData.rendererSize.width = width;
                mainscene.userData.rendererSize.height = height;

                renderer.setClearColor(0xff0000, 0);
                renderer.setSize(width, height, false);
                renderer.setPixelRatio(this.pixelRatio);

                camera.aspect = width/height;
                camera.updateProjectionMatrix();

                this.cameraSight.x = width / 2;
                this.cameraSight.y = height / 2;
                this.cameraSight.z = 1000;
                
                camera.position.set(width / 2, height / 2, 0);
                camera.lookAt(this.cameraSight);
                camera.updateMatrixWorld();
            }
    };

    WebGlCanvas.prototype.clear = function() {
        var renderer = this.renderer,
            scenes = this.scenes,
            mainscene = this.mainscene;

        if (renderer) {
            // Clear the canvas
            renderer.setClearColor(0x0f0f0f, 0);
            renderer.setScissorTest(false);
            renderer.clear();

            while (mainscene.children.length > 0) {
                mainscene.remove(mainscene.children[0]);
            }

            renderer.setClearColor(0xff0000, 0);
            renderer.setScissorTest(true);
        }
    };

    var defaultPlotOffset = {
        left: 0,
        right: 0,
        top: 0,
        bottom: 0
    };

    /**
     * Render the mainscene to 
     * 
     */
    WebGlCanvas.prototype.render = function() {
        var renderer = this.renderer,
            camera = this.camera,
            mainscene = this.mainscene,
            plotOffset = mainscene.userData.plotOffset || defaultPlotOffset,
            scale = this.scale,
            rendererSize;

        if (renderer && (mainscene.children.length > 0)) {
            renderer.setSize(this.width, this.height, false);
            renderer.setViewport(0, 0, this.width, this.height);
            rendererSize = renderer.getSize();
            //renderer.clear();
            
            this.cameraSight.x = this.width / 2;
            this.cameraSight.y = this.height / 2;
            this.cameraSight.z = 1000;

            camera.position.set(this.width / 2, this.height / 2, 0);
            camera.lookAt(this.cameraSight);
            camera.updateProjectionMatrix();
            camera.updateMatrixWorld();

            mainscene.userData.camera = camera;
            mainscene.updateMatrixWorld();

            renderer.setScissor(plotOffset.left, plotOffset.top, rendererSize.width - plotOffset.right - plotOffset.left, rendererSize.height - plotOffset.bottom - plotOffset.top);
            renderer.render(mainscene, camera);
            renderer.clearDepth();
        }
    };

    function generateKey(text) {
        return text.replace(/0|1|2|3|4|5|6|7|8|9/g, '0');
    }

    if (!window.Flot) {
        window.Flot = {};
    }

    window.Flot.Canvas = Canvas;
    window.Flot.WebGlCanvas = WebGlCanvas;
})();
