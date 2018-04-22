if(typeof V3f === 'undefined') V3f = {};

V3f.Project = function(){
    this.projectLibrary = new V3f.Project.Library();
};

Object.assign(V3f.Project.prototype, {

    GUI: function(container){
        this.ui = new V3f.MainUI(container);

        this.ui.sideBar.AddTitle('Common');
        this.ui.sideBar.Add(Cik.Config.mainGui.domElement);
    
        var libraryFolder = this.ui.AddFolder('Library');
        libraryFolder.open();
        this.projectLibrary.GUI(libraryFolder);
    }
});