
V3f.Project.Elements = function(){
    V3f.Project.Elements.instance = this;

    var scope = this;
    this.controller = {
        AddLight: function(){
            scope.AddLight();
        }
    };
};

Object.assign(V3f.Project.Elements.prototype, {

    GUI: function(folder){
        folder.add(this.controller, 'AddLight');
    },

    AddLight: function(){
        var sceneController = V3d.app.sceneController;

        var lightObject = V3f.Project.Elements.CreateLight();
        var light = new V3d.Library.Light(lightObject);
        sceneController.Add(light);
    }
});

Object.assign(V3f.Project.Elements, {

    CreateLight: function(){
        if(this.lightInstance === undefined || this.lightInstance.parent !== null) {
            this.lightInstance = new THREE.PointLight();
        }

        return this.lightInstance;
    }
});