(function($) {
    "use strict";
    const CGENERALFAILURECALLBACKERROR = -100; //simply a negative number
    const CSUCCESSFULIMAGEPREPARATION = 0;
    const CEMPTYARRAYOFIMAGESOURCES = -1;
    const CNEGATIVEIMAGESIZE = -2;

    function composeImages(canvasOrSvgSources, destinationCanvas) {
        var tempImgs = [];
        var allImgCompositionPromises = [];
        for (var i = 0; i < canvasOrSvgSources.length; i++) {
            var currentTempImg = new Image();
            tempImgs.push(currentTempImg);
            var currentPromise = new Promise(getGenerateTempImg(currentTempImg, canvasOrSvgSources[i]));
            allImgCompositionPromises.push(currentPromise);
        }
        var lastPromise = Promise.all(allImgCompositionPromises).then(getExecuteImgComposition(tempImgs, destinationCanvas), failureCallback);
        return lastPromise;
    }

    function copyCanvasToImg(canvas, img) {
        img.src = canvas.toDataURL('image/png');
    }

    function getCSSRules(document) {
        var styleSheets = document.styleSheets,
            rulesList = [];
        for (var i = 0; i < styleSheets.length; i++) {
            // in Chrome the external CSS files are empty when the page is loaded from directly disk
            var rules = styleSheets[i].cssRules || [];
            for (var j = 0; j < rules.length; j++) {
                var rule = rules[j];
                rulesList.push(rule.cssText);
            }
        }
        return rulesList;
    }

    function embedCSSRulesInSVG(rules, svg) {
        var text = [
            '<svg width="' + svg.getAttribute('width') + '" height="' + svg.getAttribute('height') + '" viewBox="0 0 ' + svg.getAttribute('width') + ' ' + svg.getAttribute('height') + '" xmlns="http://www.w3.org/2000/svg">',
            '<style>',
            '/* <![CDATA[ */',
            rules.join('\n'),
            '/* ]]> */',
            '</style>',
            svg.innerHTML,
            '</svg>'
        ].join('\n');
        return text;
    }

    function copySVGToImgMostBrowsers(svg, img) {
        var rules = getCSSRules(document),
            text = embedCSSRulesInSVG(rules, svg),
            blob = new Blob([text], {type: "image/svg+xml;charset=utf-8"}),
            domURL = self.URL || self.webkitURL || self,
            url = domURL.createObjectURL(blob);
        img.src = url;
    }

    function copySVGToImgSafari(svg, img) {
        var rules = getCSSRules(document),
            text = embedCSSRulesInSVG(rules, svg),
            data = "data:image/svg+xml;base64," + btoa(text);
        img.src = data;
    }

    function copySVGToImg(svg, img) {
        // *** https://stackoverflow.com/questions/9847580/how-to-detect-safari-chrome-ie-firefox-and-opera-browser
        // Safari 3.0+ "[object HTMLElementConstructor]"
        var isSafari = /constructor/i.test(window.HTMLElement) || (function (p) { return p.toString() === "[object SafariRemoteNotification]"; })(!window['safari'] || (typeof safari !== 'undefined' && safari.pushNotification));

        if (isSafari) {
            copySVGToImgSafari(svg, img);
        } else {
            copySVGToImgMostBrowsers(svg, img);
        }
    }

    function prepareImagesToBeComposed(sources, destination) {
        var result = CSUCCESSFULIMAGEPREPARATION;
        if (sources.length === 0) {
            result = CEMPTYARRAYOFIMAGESOURCES; //nothing to do if called without sources
        } else {
            var minX = sources[0].genLeft;
            var minY = sources[0].genTop;
            var maxX = sources[0].genRight;
            var maxY = sources[0].genBottom;
            var i = 0;

            for (i = 1; i < sources.length; i++) {
                if (minX > sources[i].genLeft) {
                    minX = sources[i].genLeft;
                }

                if (minY > sources[i].genTop) {
                    minY = sources[i].genTop;
                }
            }

            for (i = 1; i < sources.length; i++) {
                if (maxX < sources[i].genRight) {
                    maxX = sources[i].genRight;
                }

                if (maxY < sources[i].genBottom) {
                    maxY = sources[i].genBottom;
                }
            }

            if ((maxX - minX <= 0) || (maxY - minY <= 0)) {
                result = CNEGATIVEIMAGESIZE; //this might occur on hidden images
            } else {
                destination.width = Math.round(maxX - minX);
                destination.height = Math.round(maxY - minY);

                for (i = 0; i < sources.length; i++) {
                    sources[i].xCompOffset = sources[i].genLeft - minX;
                    sources[i].yCompOffset = sources[i].genTop - minY;
                }
            }
        }
        return result;
    }

    function copyImgsToCanvas(sources, destination) {
        var prepareImagesResult = prepareImagesToBeComposed(sources, destination);
        if (prepareImagesResult === CSUCCESSFULIMAGEPREPARATION) {
            var destinationCtx = destination.getContext('2d');

            for (var i = 0; i < sources.length; i++) {
                destinationCtx.drawImage(sources[i], sources[i].xCompOffset, sources[i].yCompOffset);
            }
        }
        return prepareImagesResult;
    }

    function adnotateDestImgWithBoundingClientRect(srcCanvasOrSvg, destImg) {
        destImg.genLeft = srcCanvasOrSvg.getBoundingClientRect().left;
        destImg.genTop = srcCanvasOrSvg.getBoundingClientRect().top;
        destImg.genRight = srcCanvasOrSvg.getBoundingClientRect().right;
        destImg.genBottom = srcCanvasOrSvg.getBoundingClientRect().bottom;
    }

    function generateTempImageFromCanvasOrSvg(srcCanvasOrSvg, destImg) {
        if (srcCanvasOrSvg.tagName === "CANVAS") {
            copyCanvasToImg(srcCanvasOrSvg, destImg);
        }

        if (srcCanvasOrSvg.tagName === "svg") {
            copySVGToImg(srcCanvasOrSvg, destImg);
        }

        adnotateDestImgWithBoundingClientRect(srcCanvasOrSvg, destImg);
    }

    function getExecuteImgComposition(tempImgs, destinationCanvas) {
        return function executeImgComposition(result) {
            var compositionResult = copyImgsToCanvas(tempImgs, destinationCanvas);
            return compositionResult;
        };
    }

    function failureCallback() {
        return CGENERALFAILURECALLBACKERROR;
    }

    function getGenerateTempImg(tempImg, canvasOrSvgSource) {
        return function doGenerateTempImg(successCallbackFunc, failureCallbackFunc) {
            tempImg.onload = successCallbackFunc;
            generateTempImageFromCanvasOrSvg(canvasOrSvgSource, tempImg);
        };
    }

    $.plot.composeImages = composeImages;
})(jQuery);
