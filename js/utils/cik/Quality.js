if(typeof Cik === 'undefined') Cik = {};

Cik.Quality = function(callback){
    this.testCallback = callback;
};

Object.assign(Cik.Quality.prototype, {

    Common: function(quality){
        //                      0       1       2       3
        var composer        = [ 0,      0,      0,      1       ];
        var antialias       = [ 0,      1,      1,      0       ];
        var shadows         = [ 0,      0,      1,      1       ];
        var renderSizeMul   = [ .5,     1,      1,      1       ];
        
        var result = {
            composer: Boolean(composer[quality]), 
            antialias: Boolean(antialias[quality]),
            shadows: Boolean(shadows[quality]),
            renderSizeMul: renderSizeMul[quality]
        };
        return result;
    },

    OnTestComplete: function(quality){
        var result = this.Common(quality);
        this.testCallback(result);
    },

    PerformanceTest1: function(){
        var quality = 2;
        this.OnTestComplete(quality);
    }

});