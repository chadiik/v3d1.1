
V3d.Model = Cik.Utils.Redefine(V3d.Model, function(instanceProperties){
    return function(){
        instanceProperties.constructor.call(this);
        V3d.Model.editorModel = this;
    }
});

Object.assign(V3d.Model.prototype, {

    toJSON: function(){
        return {
            layouts: this.layouts,
            current: this.current
        };
    }
});

Object.assign(V3d.Model, {

    editorModel: undefined,

    FindSection: function(object){

        var model = V3d.Model.editorModel;
        var parent = object;
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