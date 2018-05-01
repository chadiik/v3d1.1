
Object.assign(V3d.Model.Section.prototype, {
    
    toJSON: function(){
        return {
            sov: this._sov,
            transform: this._transform
        };
    }
});