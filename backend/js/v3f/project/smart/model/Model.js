
V3f.Smart.Model = function(model){
    V3f.Smart.call(this, model);
    V3f.Smart.Model.activeModel = this;

    var numLayouts = model.layouts.length;
    var layoutsNames = {};
    layoutsNames['(' + numLayouts + ')'] = -1;
    for(var i = 0; i < numLayouts; i++){
        layoutsNames['Layout' + i] = i;
    };

    var c = Cik.Config.Controller; //(property, min, max, step, onChange)
    var track = [
        new c('ConfigLayout', layoutsNames),
        'PickSection'
    ];
    var folder = this.Config('Model', this, this.OnGuiChanged.bind(this), ...track);
    folder.open();
};

V3f.Smart.Model.prototype = Object.assign(Object.create(V3f.Smart.prototype), {
    constructor: V3f.Smart.Model,

    OnGuiChanged: function(){
        
    },

    PickSection: function(){
        V3f.Smart.Model.PickSection(this);
    }
});

Object.defineProperties(V3f.Smart.Model.prototype, {
    ConfigLayout: {
        get: function(){
            return -1;
        },

        set: function(layout){
            layout = parseInt(layout);
            if(layout >= 0){
                layout = this.target.layouts[layout];
                var smartLayout = new V3f.Smart.Layout(layout);
                smartLayout.Show();
            }
        }
    }
});

Object.assign(V3f.Smart.Model, {

    activeModel: undefined,

    PickSection: function(activeModel){
        this.activeModel = activeModel;
        V3f.Smart.onFocus.push(V3f.Smart.Model.FindSection);
    },

    FindSection: function(pick){
        V3f.Smart.onFocus.splice(V3f.Smart.onFocus.indexOf(V3f.Smart.Model.FindSection), 1);

        var model = V3f.Smart.Model.activeModel.target;
        var parent = pick.target;
        while(parent !== null){
            var section = model.FindSection(parent.name);
            if(section){
                console.log('Found', section);
                Cik.Input.DelayedAction(function(){
                    var smartSection = new V3f.Smart.Section(section);
                    smartSection.Show();
                }, 500);
                return;
            }
            parent = parent.parent;
        }
    }
});