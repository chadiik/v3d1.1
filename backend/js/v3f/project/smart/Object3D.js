
V3f.Smart.Object3D = function(object, label){
    if(label === undefined) label = object.name;
    V3f.Smart.call(this, object, label);
    object.smart = this;

    this.Config('Object3D', this, this.OnGuiChanged.bind(this), 'Back', 'ConfigParent', 'target.position.x', 'target.position.y', 'target.position.z');
};

V3f.Smart.Object3D.prototype = Object.assign(Object.create(V3f.Smart.prototype), {
    constructor: V3f.Smart.Object3D,

    OnGuiChanged: function(){

    },

    Show: function(){
        this.gui.__folders.Object3D.enable(this, 'Back', this.backtrack !== undefined);
        
        V3f.Smart.prototype.Show.call(this);
    },

    ConfigParent: function(){
        var ui = V3f.MainUI.instance;
        var parent = this.target.parent;
        console.log('config parent', parent);
        if(parent){
            if(parent.smart === undefined) parent.smart = new V3f.Smart.Object3D(parent);
            parent.smart.backtrack = this;
            parent.smart.Show();
        }
    },

    Back: function(){
        var ui = V3f.MainUI.instance;
        this.backtrack.Show();
    }
});