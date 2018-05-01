
Object.assign(V3d.Model.Layout.prototype, {

    toJSON: function(){
        return {
            sections: this.sections
        };
    }
});