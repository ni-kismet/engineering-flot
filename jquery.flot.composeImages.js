(function($){
    "use strict";

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
            '<svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">',
            //'<svg xmlns="http://www.w3.org/2000/svg">', //doesn't work in Firefox :(
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
            blob = new Blob([text], {type:"image/svg+xml;charset=utf-8"}),
            domURL = self.URL || self.webkitURL || self,
            url = domURL.createObjectURL(blob);
        img.src = url;
    }

    function copySVGToImgSafari(svg, img) {
        // *** https://stackoverflow.com/questions/9847580/how-to-detect-safari-chrome-ie-firefox-and-opera-browser
        //
        // Opera 8.0+
        var isOpera = (!!window.opr && !!opr.addons) || !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;

        // Firefox 1.0+
        var isFirefox = typeof InstallTrigger !== 'undefined';

        // Safari 3.0+ "[object HTMLElementConstructor]"
        var isSafari = /constructor/i.test(window.HTMLElement) || (function (p) { return p.toString() === "[object SafariRemoteNotification]"; })(!window['safari'] || (typeof safari !== 'undefined' && safari.pushNotification));

        // Internet Explorer 6-11
        var isIE = /*@cc_on!@*/false || !!document.documentMode;

        // Edge 20+
        var isEdge = !isIE && !!window.StyleMedia;

        // Chrome 1+
        var isChrome = !!window.chrome && !!window.chrome.webstore;

        // Blink engine detection
        var isBlink = (isChrome || isOpera) && !!window.CSS;
        // ***

        var rules = getCSSRules(document),
            text = embedCSSRulesInSVG(rules, svg),
            data = "data:image/svg+xml;base64," + btoa(text);
        img.src = data;
    }

    function copySVGToImg(svg, img) {
        if (isEdge || isIE || isFirefox || isOpera || isChrome) {
            copySVGToImgMostBrowsers(svg, img);
        } else {
            if (isSafari) {
                copySVGToImgSafari(svg, img);
            }
        }
    }


    function prepareImagesToBeComposed(sources, destination) {
        var Result = 0;
        if (sources.length === 0) {
            Result = -1; //nothing to do if called without sources
        } else {
            var minX = sources[0].genLeft;
            var minY = sources[0].genTop;
            var maxX = sources[0].genRight;
            var maxY = sources[0].genBottom;

            for (var i = 1; i < sources.length; i++) {
                if (minX > sources[i].genLeft) {
                    minX = sources[i].genLeft;
                }

                if (minY > sources[i].genTop) {
                    minY = sources[i].genTop;
                }
            }

            for (var i = 1; i < sources.length; i++) {
                if (maxX < sources[i].genRight) {
                    maxX = sources[i].genRight;
                }

                if (maxY < sources[i].genBottom) {
                    maxY = sources[i].genBottom;
                }
            }

            if ((maxX - minX <= 0) || (maxY - minY <= 0)) {
                Result = -2;
            } else {
                destination.width = maxX - minX;
                destination.height = maxY - minY;

                for (var i = 0; i < sources.length; i++) {
                    sources[i]["xCompOffset"] = sources[i].genLeft - minX;
                    sources[i]["yCompOffset"] = sources[i].genTop - minY;
                }
            }
        }
        return Result;
    }


    function copyImgsToCanvas(sources, destination) {
        var prepareImagesResult = prepareImagesToBeComposed(sources, destination);
        if (prepareImagesResult === 0) {
            var destinationCtx = destination.getContext('2d');

            for (var i = 0; i < sources.length; i++) {
                destinationCtx.drawImage(sources[i], sources[i].xCompOffset, sources[i].yCompOffset);
            }
        }
        return prepareImagesResult;
    }


    function getSetDownloadableImgRef(downloadLinkElement, img) {
        return function setDownloadableImgRef(result) {
            downloadLinkElement.href = img.toDataURL('image/png');
            return true;
        }
    }


    function generateTempImageFromCanvasOrSvg(srcCanvasOrSvg, destImg) {
        if (srcCanvasOrSvg.tagName === "CANVAS") {
            copyCanvasToImg(srcCanvasOrSvg, destImg);
        }

        if (srcCanvasOrSvg.tagName === "svg") {
            copySVGToImg(srcCanvasOrSvg, destImg);
        }

        //destImg will be used as temp image, so add to it some properties about position on page.
        destImg["genLeft"] = srcCanvasOrSvg.getBoundingClientRect().left;
        destImg["genTop"] = srcCanvasOrSvg.getBoundingClientRect().top;
        destImg["genRight"] = srcCanvasOrSvg.getBoundingClientRect().right;
        destImg["genBottom"] = srcCanvasOrSvg.getBoundingClientRect().bottom;
    }


    function getExecuteImgComposition(tempImgs, destination) {
        return function executeImgComposition(result) {
          var compositionResult = copyImgsToCanvas(tempImgs, destination);
          return compositionResult;
      };
    }

    function failureCallback(error) {
      return -100; //a negative number
    }


    function getGenerateTempImg(tempImg, canvasOrSvgSource) {
        return function doGenerateTempImg(successCallbackFunc, failureCallbackFunc) {
            tempImg.onload = successCallbackFunc;
            generateTempImageFromCanvasOrSvg(canvasOrSvgSource, tempImg);
        };
    }


    function composeImages(canvasOrSvgSources, destinationImage) {
        var tempImgs = [];
        var allImgCompositionPromises = [];
        for (var i = 0; i < canvasOrSvgSources.length; i++) {
            var currentTempImg = new Image;
            tempImgs.push(currentTempImg);
            var currentPromise = new Promise(getGenerateTempImg(currentTempImg, canvasOrSvgSources[i]));
            allImgCompositionPromises.push(currentPromise);
        }
        var lastPromise = Promise.all(allImgCompositionPromises).then(getExecuteImgComposition(tempImgs, destinationImage), failureCallback);
        return lastPromise;
    }


    $.plot.composeImages = composeImages;
})(jQuery);
