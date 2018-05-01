
V3f.Project.Model = function(model){

    if(model === undefined) model = new V3d.Model();
    this.model = model;
    this.modelScene = new V3d.Model.Scene(this.model, V3d.app.sceneController.itemsContainer);
    this.modelScene.addEventListener('update', function(){
        V3d.app.sceneRenderer.UpdateShadowMaps();
    });

    this.controller = {
        LoadLayout: V3f.Project.Model.Controller.LoadLayout
    };

    V3f.Project.Model.onItemsLoaded.push(this.AddLayout.bind(this));
};

Object.assign(V3f.Project.Model.prototype, {

    GUI: function(folder){
        folder.add(this.controller, 'LoadLayout');
    },

    AddLayout: function(items){
        this.model.AddLayout();
        var layout = this.model.activeLayout;
        items.forEach(item => {
            var section = new V3d.Model.Section(item.sov);
            section.transform = new V3d.Scene.TRS().FromObject(item.target);
            layout.Add(section);
        });

        this.TestModel();
    },

    TestModel: function(){
        this.modelScene.Update();

        var meshes = [];
        this.model.activeLayout.sections.forEach(section => {
            section.view.traverse(function(child){
                if(child instanceof THREE.Mesh){
                    meshes.push(child);
                }
            });
        });

        V3f.Auto.MakeSmart(meshes);
    },

    toJSON: function(){
        return {
            model: this.model
        };
    }

});

Object.assign(V3f.Project.Model, {

    onItemsLoaded: [],
    NotifyItemsLoaded: function(items){
        var callbacks = V3f.Project.Model.onItemsLoaded;
        for(var i = 0; i < callbacks.length; i++){
            callbacks[i](items);
        }
    },
    
    LoadGLTFFile: function(path){
        if(this.loadingManager === undefined) this.loadingManager = new THREE.LoadingManager();

        var loader = new THREE.GLTFLoader(this.loadingManager);
        try{
            loader.load(path, this.LoadGLTF);
        }
        catch(error){
            console.trace(error);
            V3f.Feedback.Notify(error);
        }
    },

    LoadGLTF: function(gltf){
        var items = items = V3f.Project.Imported.Collect(gltf.scene);
        V3f.Project.Model.NotifyItemsLoaded(items);
    },

    FromJSON: function(data){
        var model = V3d.Model.FromJSON(data.model);
        var projectModel = new V3f.Project.Model(model);

        projectModel.TestModel();
        return projectModel;
    }
});