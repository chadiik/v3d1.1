
V3f.Smart.Section = function(section){
    V3f.Smart.call(this, section);

    var c = Cik.Config.Controller; //(property, min, max, step, onChange)
    var track = [
        'Toggle'
    ];
    var folder = this.Config('View', this, this.OnGuiChanged.bind(this), ...track);
    folder.open();
};

V3f.Smart.Section.prototype = Object.assign(Object.create(V3f.Smart.prototype), {
    constructor: V3f.Smart.Section,

    OnGuiChanged: function(){

    },

    Toggle: function(){
        var view = this.target.view;
        if(view !== undefined){
            var parent = view.parent;
            if(parent){
                view.toggleParent = parent;
                view.traverse(function(child){
                    child.disableRaycast = true;
                });
                parent.remove(view);
            }
            else if(view.toggleParent){
                view.traverse(function(child){
                    child.disableRaycast = false;
                });
                view.toggleParent.add(view);
                view.toggleParent = undefined;
            }
        }
    },

    Show: function(){

        V3f.Smart.prototype.Show.call(this);
        
        var view = this.target.view;
        if(view !== undefined){
            var ui = V3f.MainUI.instance;
            ui.Preview3D(this.target.view);
        }
    }
});

Object.defineProperties(V3f.Smart.Section.prototype, {
    
});