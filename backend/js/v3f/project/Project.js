if(typeof V3f === 'undefined') V3f = {};

V3f.Project = function(){

    this.onLibraryCreated = [];
    this.onElementsCreated = [];

    V3f.Project.onNewProjectRequest.push(this.New.bind(this));
    V3f.Project.onProjectFileLoaded.push(this.LoadProjectFile.bind(this));
    V3f.Project.onSaveRequest.push(this.GetSaveData.bind(this));
};

Object.assign(V3f.Project.prototype, {

    New: function(){
        this.projectLibrary = new V3f.Project.Library();
        this.NotifyLibraryCreated();
        this.projectElements = new V3f.Project.Elements();
    },

    LoadProjectFile: function(zip, filename){
        var scope = this;
        zip.file("projectLibrary.json").async("string").then(
            function (projectLibraryContent) {
                var data = JSON.parse(projectLibraryContent);
                scope.projectLibrary = V3f.Project.Library.FromJSON(data);
                scope.NotifyLibraryCreated();
            }
        );
    },

    NotifyLibraryCreated: function(){
        for(var i = 0; i < this.onLibraryCreated.length; i++){
            this.onLibraryCreated[i]();
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

        this.onLibraryCreated.push(this.LibraryGUI.bind(this));
        this.onElementsCreated.push(this.ElementsGUI.bind(this));
        
    },

    LibraryGUI: function(){
        var libraryFolder = this.ui.AddFolder('Library');
        libraryFolder.open();
        this.projectLibrary.GUI(libraryFolder);
    },

    ElementsGUI: function(){
        var elementsFolder = this.ui.AddFolder('Add');
        this.projectElements.GUI(elementsFolder);
    },

    Zip: function(onCompleted){

        var projectLibrary = JSON.stringify(this.projectLibrary);

        var zip = new JSZip();
        zip.file("projectLibrary.json", projectLibrary);
        
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