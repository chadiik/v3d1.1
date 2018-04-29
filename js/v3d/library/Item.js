

V3d.Library.Item = function(sov, asset){
    this.sov = sov;
    this.asset = asset;
};

Object.assign(V3d.Library.Item.prototype, {
    
    toJSON: function(){
        return {
            sov: this.sov,
            asset: this.asset
        }
    }
});