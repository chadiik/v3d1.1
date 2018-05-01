if(typeof V3f === 'undefined') V3f = {};

V3f.Project = function(){

    window.project = this;

    this.onLibraryCreated = [];
    this.onElementsCreated = [];
    this.onModelCreated = [];

    V3f.Project.onNewProjectRequest.push(this.New.bind(this));
    V3f.Project.onProjectFileLoaded.push(this.LoadProjectFile.bind(this));
    V3f.Project.onSaveRequest.push(this.GetSaveData.bind(this));
};

Object.assign(V3f.Project.prototype, {

    New: function(){
        this.projectLibrary = new V3f.Project.Library();
        this.NotifyLibraryCreated();

        this.projectModel = new V3f.Project.Model();
        this.NotifyModelCreated();

        this.projectElements = new V3f.Project.Elements();
        this.NotifyElementsCreated();
    },

    LoadProjectFile: function(zip, filename){
        var scope = this;

        zip.file("projectLibrary.json").async("string").then(
            function (projectLibraryContent) {
                var data = JSON.parse(projectLibraryContent);
                scope.projectLibrary = V3f.Project.Library.FromJSON(data);
                scope.NotifyLibraryCreated();

                zip.file("projectModel.json").async("string").then(
                    function (projectModelContent) {
                        var projectModelData = JSON.parse(projectModelContent);
                        scope.projectModel = V3f.Project.Model.FromJSON(projectModelData);
                        scope.NotifyModelCreated();
                    }
                );
            }
        );

        zip.file("projectElements.json").async("string").then(
            function (projectElementsContent) {
                var data = JSON.parse(projectElementsContent);
                scope.projectElements = V3f.Project.Elements.FromJSON(data);
                scope.NotifyElementsCreated();
            }
        );
    },

    NotifyLibraryCreated: function(){
        for(var i = 0; i < this.onLibraryCreated.length; i++){
            this.onLibraryCreated[i]();
        }
    },

    NotifyModelCreated: function(){
        for(var i = 0; i < this.onModelCreated.length; i++){
            this.onModelCreated[i]();
        }
    },

    NotifyElementsCreated: function(){
        for(var i = 0; i < this.onElementsCreated.length; i++){
            this.onElementsCreated[i]();
        }
    },

    GUI: function(container){
        var ui = this.ui = new V3f.MainUI(container);

        ui.sideBar.AddTitle('Common');
        ui.sideBar.Add(Cik.Config.mainGui.domElement);
    
        V3f.Smart.onFocus.push(function(smart){
            if(smart.target.visible !== undefined)
                ui.Preview3D(smart.target);
        });

        V3f.Smart.onFocusLost.push(function(smart){
            ui.HidePreview3D();
        });

        var projectFolder = ui.AddFolder('Project');
        projectFolder.open();
        V3f.Project.Controller.GUI(projectFolder);

        var libraryFolder = this.ui.AddFolder('Library');
        var modelFolder = this.ui.AddFolder('Layout');
        var elementsFolder = this.ui.AddFolder('Add');

        var scope = this;
        this.onLibraryCreated.push(function(){
            scope.LibraryGUI(libraryFolder);
        });
        this.onModelCreated.push(function(){
            scope.ModelGUI(modelFolder);
        });
        this.onElementsCreated.push(function(){
            scope.ElementsGUI(elementsFolder);
        });
        
    },

    LibraryGUI: function(libraryFolder){
        libraryFolder.open();
        this.projectLibrary.GUI(libraryFolder);
    },

    ModelGUI: function(modelFolder){
        modelFolder.open();
        this.projectModel.GUI(modelFolder);
    },

    ElementsGUI: function(elementsFolder){
        elementsFolder.open();
        this.projectElements.GUI(elementsFolder);
    },

    Zip: function(onCompleted){

        var projectLibrary = JSON.stringify(this.projectLibrary);
        var projectModel = JSON.stringify(this.projectModel);
        var projectElements = JSON.stringify(this.projectElements);

        var zip = new JSZip();
        zip.file("projectLibrary.json", projectLibrary);
        zip.file("projectModel.json", projectModel);
        zip.file("projectElements.json", projectElements);
        
        zip.generateAsync(
            {
                type:"blob",
                compression: "DEFLATE",
                compressionOptions: {
                    level: 9
                }
            }
        ).then(onCompleted);
    },

    GetSaveData: function(callback){
        this.Zip(function(file){
            var data = {
                file: file,
                filename: 'Project.v3f'
            };
            callback(data);
        });
    }
});

Object.assign(V3f.Project, {

    onNewProjectRequest: [],

    New: function(){
        for(var i = 0; i < this.onNewProjectRequest.length; i++){
            this.onNewProjectRequest[i]();
        }
    },

    onProjectFileLoaded: [],

    LoadProjectFile: function(file, filename){
        var onProjectFileLoaded = this.onProjectFileLoaded;
        JSZip.loadAsync(file).then(function (zip) {
            for(var i = 0; i < onProjectFileLoaded.length; i++) onProjectFileLoaded[i](zip, filename);
        });
    },

    onSaveRequest: [],

    GetSaveData: function(callback){
        for(var i = 0; i < this.onSaveRequest.length; i++){
            this.onSaveRequest[i](callback);
        }
    }
});