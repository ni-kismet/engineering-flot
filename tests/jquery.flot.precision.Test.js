describe("unit tests for the tickLables precision of axis", function() {
    var plot;
    var placeholder;
    var sampledata = [[0, 1], [1, 1.1], [2, 1.2]];
    
    beforeEach(function () {
        var fixture = setFixtures('<div id="demo-container" style="width: 800px;height: 600px">').find('#demo-container').get(0);

        placeholder = $('<div id="placeholder" style="width: 100%;height: 100%">');
        placeholder.appendTo(fixture);
    });

    afterEach(function () {
        if (plot) {
            plot.shutdown();
        }
        $('#placeholder').empty();
    });

    it('should use the default tickSize when specified', function() {
        var options = [];
        
        plot = $.plot("#placeholder", [sampledata], {});

        var testVector = [
            [1, 10, 10, 2, 3, 2],
            [1, 5, 10, null, 3, 0.5],
            [1, 1.2, 5, null, 3, 0.05]
            ];
        
        testVector.forEach(function (t) {
            var min = t[0],
                max = t[1],
                tickDecimals = t[4],
                expectedValue = t[5];
                
            options.ticks = t[2];
            options.minTickSize = t[3];
            var axisPrecision = plot.enhanceValuePrecision(min, max, "x", options, tickDecimals);
                
            expect(axisPrecision.tickSize).toEqual(expectedValue);
        });
    });
    
    it('should use the precision given by tickDecimals when specified', function() {
        var options = [];
        
        plot = $.plot("#placeholder", [sampledata], {});

        var testVector = [
            [1, 10, 10, 2, 3, 1],
            [1, 1.01, 10, null, 2, 2],
            [1, 1.1, 5, null, 1, 1]
            ];
        
        testVector.forEach(function (t) {
            var min = t[0],
                max = t[1],
                tickDecimals = t[4],
                expectedValue = t[5];
                
            options.ticks = t[2];
            options.minTickSize = t[3];
            var axisPrecision = plot.enhanceValuePrecision(min, max, "x", options, tickDecimals);
                
            expect(axisPrecision.precision).toEqual(expectedValue);
        });
    });
    
    it('should use the maximum precision when tickDecimals not specified', function() {
        var options = [];
        
        plot = $.plot("#placeholder", [sampledata], {});

        var testVector = [
            [1, 10, 10, 2, 1],
            [1, 1.01, 10, null, 3],
            [1, 1.1, 5, null, 2]
            ];
        
        testVector.forEach(function (t) {
            var min = t[0],
                max = t[1],
                expectedValue = t[4];
                
            options.ticks = t[2];
            options.minTickSize = t[3];
            var axisPrecision = plot.enhanceValuePrecision(min, max, "x", options);
                
            expect(axisPrecision.precision).toEqual(expectedValue);
        });
    });
});