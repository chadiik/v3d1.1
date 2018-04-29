
V3f.Project.Controller = {
    GUI: function(folder){
        folder.add(this, 'New');
        folder.add(this, 'Load');
        folder.add(this, 'Save');
    },

    New: function(){
        V3f.Project.New();
    },

    Load: function(){
        Cik.IO.GetFile(function(file){
            var fileInfo = Cik.IO.FileInfo(file);

            if(fileInfo.extension !== 'v3f'){
                var query = 'v3f archives only.';
                V3f.Feedback.Notify(query);
                return;
            }

            var reader = new FileReader();
			reader.onload = function(event) {
                V3f.Project.LoadProjectFile(event.target.result, file.name);
			};
			reader.readAsArrayBuffer(file);
        });
    },

    Save: function(){
        V3f.Project.GetSaveData(function(data){
            saveAs(data.file, data.filename);
        });
    }
};