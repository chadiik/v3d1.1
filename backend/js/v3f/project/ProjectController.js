
V3f.Project.Controller = function(){
    
};

Object.assign(V3f.Project.Controller.prototype, {

    GUI: function(folder){
        this.guiFolder = folder;

        folder.add(this, 'New');
        folder.add(this, 'Load');
        folder.add(this, 'Save');
    },

    New: function(){
        this.DisableNewLoad();

        V3f.Project.New();
    },

    Load: function(){
        var scope = this;
        Cik.IO.GetFile(function(file){
            var fileInfo = Cik.IO.FileInfo(file);

            if(fileInfo.extension !== 'v3f'){
                var query = 'v3f archives only.';
                V3f.Feedback.Notify(query);
                return;
            }

            var reader = new FileReader();
			reader.onload = function(event) {
                scope.DisableNewLoad();
                V3f.Project.LoadProjectFile(event.target.result, file.name);
			};
			reader.readAsArrayBuffer(file);
        });
    },

    DisableNewLoad: function(){
        this.guiFolder.enable(this, 'New', false);
        this.guiFolder.enable(this, 'Load', false);
    },

    Save: function(){
        V3f.Project.GetSaveData(function(data){
            saveAs(data.file, data.filename);
        });
    }
});