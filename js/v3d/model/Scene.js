
V3d.Model.Scene = function(model, container){

    this.model = model;
    this.container = container;
    this.sceneItems = [];
};

V3d.Model.Scene.prototype = Object.assign(Object.create(THREE.EventDispatcher.prototype), {
    
    constructor: V3d.Model.Scene,

    Update: function(){
        var sections = this.model.activeLayout.sections;
        var maxLength = Math.max(sections.length, this.sceneItems.length);
        for(var i = 0; i < maxLength; i++){
            if(this.sceneItems[i] === undefined) this.sceneItems[i] = new V3d.Scene.Item(this.container);
            var sceneItem = this.sceneItems[i];

            var section = sections[i];
            sceneItem.section = section;
            sceneItem.Update();
        }

        this.dispatchEvent(V3d.Model.Scene.updateEvent);
    }

});

Object.assign(V3d.Model.Scene, {

    updateEvent: { type: 'update' }
});