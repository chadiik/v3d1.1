
V3f.Project.Library = function(library){

    if(library === undefined) library = new V3d.Library();
    this.library = library;

    this.controller = {
        LoadGLTF: V3f.Project.Library.Controller.LoadGLTF
    };

    V3f.Project.Library.onItemsLoaded.push(this.AddImportedItems.bind(this));
};

Object.assign(V3f.Project.Library.prototype, {

    GUI: function(folder){
        folder.add(this.controller, 'LoadGLTF');
    },

    AddImportedItems: function(items){
        
        items.forEach(item => {
            var item = this.library.Add(item.sov, item.obj);
        });

        //this.TestLibrary();
    },

    TestLibrary: function(){
        //var jsonString = JSON.stringify(this.library);
        //var jsonData = JSON.parse(jsonString);

        var libItems = Object.values(this.library.items);
        var objects = [];
        libItems.forEach(function(libItem){
            objects.push(libItem.asset.view);
        });

        V3f.Auto.SmartDisplay(objects);
    },

    toJSON: function(){
        return {
            library: this.library
        };
    }
});

Object.assign(V3f.Project.Library, {

    onItemsLoaded: [],
    NotifyItemsLoaded: function(items){
        var callbacks = V3f.Project.Library.onItemsLoaded;
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
        var imported = new V3f.Project.Imported(gltf.scene);
        imported.Parse(V3f.Project.Library.NotifyItemsLoaded);
    },

    FromJSON: function(data){
        var library = V3d.Library.FromJSON(data.library);
        var projectLibrary = new V3f.Project.Library(library);
        //projectLibrary.TestLibrary();

        return projectLibrary;
    }
});