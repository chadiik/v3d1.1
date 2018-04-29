
Object.assign(V3d.Library.prototype, {

    toJSON: function(){
        var items = Object.values(this.items);
        return {
            items: items
        };
    }
});

Object.assign(V3d.Library, {
    
});