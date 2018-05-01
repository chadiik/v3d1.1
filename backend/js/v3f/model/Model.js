
Object.assign(V3d.Model.prototype, {

    toJSON: function(){
        return {
            layouts: this.layouts,
            current: this.current
        };
    }
});