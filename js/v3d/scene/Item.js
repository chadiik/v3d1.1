
V3d.Scene.Item = function(parent){
    
    this.section;
    this.view;
    this.parent = parent;
};

Object.assign(V3d.Scene.Item.prototype, {

    Update: function(){
        var view = this.section !== undefined ? this.section.view : undefined;

        if(this.view !== undefined && view === undefined){
            this.parent.remove(this.view);
            this.view = undefined;
        }

        if(this.view !== undefined && view !== undefined && this.view !== view){
            this.parent.remove(this.view);
            this.view = undefined;
        }

        if(this.view === undefined && view !== undefined){
            this.parent.add(view);
            this.view = view;
        }
    }
});