(function($) {
    "use strict";

    var GlDrawSeries = function() {
        var vertexShaderCode = `
            attribute vec2 a_position;

            varying vec4 v_color;

            uniform vec2 u_resolution;
            uniform float u_pointSize;
            uniform vec4 u_color;
            
            void main() {            
                // convert from canvas coords to clip space(-1->1)
                vec2 clipSpace = a_position * 2. / u_resolution - 1.0;
                
                // Multiply the position by the matrix
                gl_Position = vec4(clipSpace * vec2(1., -1.), 0., 1.);

                // set point size
                gl_PointSize = u_pointSize;

                // pass the color to fragment shader
                v_color = u_color / 255.;

            }`;

        var fragmentShaderCode = `
            precision mediump float;

            // passed in from vertex shader
            varying vec4 v_color;
            void main() {
                // Transform color from 0-255 to 0-1
                gl_FragColor = v_color;
            }`;

        /**
         * Creates a program from 2 shaders.
         *
         * @param {!WebGLRenderingContext} gl The WebGL context.
         * @param {!WebGLShader} vertexShader A vertex shader.
         * @param {!WebGLShader} fragmentShader A fragment shader.
         * @return {!WebGLProgram} A program.
         */
        function createProgram(gl, vertexShaderCode, fragmentShaderCode) {
            // create a program.
            var vertexShader = compileShader(gl, vertexShaderCode, gl.VERTEX_SHADER),
                fragmentShader = compileShader(gl, fragmentShaderCode, gl.FRAGMENT_SHADER),
                program = gl.createProgram();

            // attach the shaders.
            gl.attachShader(program, vertexShader);
            gl.attachShader(program, fragmentShader);

            // link the program.
            gl.linkProgram(program);

            // Check if it linked.
            var success = gl.getProgramParameter(program, gl.LINK_STATUS);
            if (!success) {
                // something went wrong with the link
                throw new Error("program failed to link:" + gl.getProgramInfoLog(program));
            }

            return program;
        };

        /**
         * Creates and compiles a shader.
         *
         * @param {!WebGLRenderingContext} gl The WebGL Context.
         * @param {string} shaderSource The GLSL source code for the shader.
         * @param {number} shaderType The type of shader, VERTEX_SHADER or FRAGMENT_SHADER.
         * @return {!WebGLShader} The shader.
         */
        function compileShader(gl, shaderSource, shaderType) {
            // Create the shader object
            var shader = gl.createShader(shaderType);

            // Set the shader source code.
            gl.shaderSource(shader, shaderSource);

            // Compile the shader
            gl.compileShader(shader);

            // Check if it compiled
            var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
            if (!success) {
                // Something went wrong during compilation; get the error
                throw new Error("could not compile shader:" + gl.getShaderInfoLog(shader));
            }

            return shader;
        };

        var program, positionAttributeLocation, resolutionUniformLocation, pointSizeUniformLocation, colorUniformLocation;
        function drawSeriesPoints(series, gl, plotOffset, plotWidth, plotHeight, drawSymbol, getColorOrGradient) {
            var positions,
                positionBuffer = gl.createBuffer();

            if (!program) {
                program = createProgram(gl, vertexShaderCode, fragmentShaderCode);
                positionAttributeLocation = gl.getAttribLocation(program, "a_position");
                resolutionUniformLocation = gl.getUniformLocation(program, "u_resolution");
                pointSizeUniformLocation = gl.getUniformLocation(program, "u_pointSize");
                colorUniformLocation = gl.getUniformLocation(program, "u_color");

                gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
                gl.useProgram(program);

                // Turn on the attribute
                gl.enableVertexAttribArray(positionAttributeLocation);
                gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);
                // set the resolution
                gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);
            }

            function fillBufferPoints(datapoints, radius, fill, offset, shadow, axisx, axisy, drawSymbolFn) {
                var points = datapoints.points,
                    ps = datapoints.pointsize;
                positions = new Float32Array(points.length);
                positionBuffer.numItems = 0;
                for (var i = 0; i < points.length; i += ps) {
                    if (points[i] == null || points[i] < axisx.min || points[i] > axisx.max || points[i + 1] < axisy.min || points[i + 1] > axisy.max) {
                        continue;
                    }

                    positions[i] = axisx.p2c(points[i]) + offset.left;
                    positions[i + 1] = axisy.p2c(points[i + 1]) + offset.top;
                    positionBuffer.numItems++;
                }

                gl.bufferData(gl.ARRAY_BUFFER, positions, gl.DYNAMIC_DRAW);
            }

            // set the point size
            gl.uniform1f(pointSizeUniformLocation, series.points.radius);
            // set the point color
            var colorObj = $.color.parse(series.color);
            gl.uniform4f(colorUniformLocation, colorObj.r, colorObj.g, colorObj.b, colorObj.a * 255.0);

            var datapoints = {
                points: series.datapoints.points,
                pointsize: series.datapoints.pointsize
            };

            if (series.decimatePoints) {
                datapoints.points = series.decimatePoints(series, series.xaxis.min, series.xaxis.max, plotWidth, series.yaxis.min, series.yaxis.max, plotHeight);
            }

            fillBufferPoints(datapoints, series.points.radius,
                true, plotOffset, false,
                series.xaxis, series.yaxis);
            gl.viewport(0.0, 0.0, gl.drawingBufferWidth, gl.drawingBufferHeight);
            // don't fill console with warnings
            if (positionBuffer.numItems > 0) {
                gl.drawArrays(gl.POINTS, 0, positionBuffer.numItems);
            }
        }

        this.drawSeriesPoints = drawSeriesPoints;
    };

    $.plot.gldrawSeries = new GlDrawSeries();
})(jQuery);
