
V3f.Project.Library = function(){
    this.library = new V3d.Library();

    var scope = this;
    this.controller = {
        LoadGLTF: function(){
            Cik.IO.PHPClear(V3d.Ressources.Temp());
            Cik.IO.GetFile(function(file){
                var fileInfo = Cik.IO.FileInfo(file);
                if(fileInfo.extension !== 'zip'){
                    var abort = true;
                    // var query = 'Textured Library are uploaded as .zip files. Continue anyway?';
                    var query = 'Zipped GLTF assets only. Continue anyway?';
                    V3f.Feedback.Confirm(query, function(){abort = false;});
                    if(abort){
                        return;
                    }
                }

                var extractPath = V3d.Ressources.Temp('archives');
                Cik.IO.PHPZipExtract(file, extractPath,
                    function(response){
                        if(response === '0'){
                            console.log("error uploading/unzipping archive");
                        }
                        else{
                            try{
                                console.log(file, 'extracted');
                            }
                            catch(lrlError){
                                V3f.Feedback.Notify('Layout import failed: ' + lrlError);
                                V3f.Feedback.Reload();
                            }
                        }
                    },
                    function(response){
                        console.log(response);
                    }
                );
            });
        }
    };
};

Object.assign(V3f.Project.Library.prototype, {

    GUI: function(folder){
        folder.add(this.controller, 'LoadGLTF');
    },

    LoadGLTF: function(path, onLoad){
        V3f.Project.Library.LoadGLTF(path, onLoad);
    }
});

Object.assign(V3f.Project.Library, {
    
    LoadGLTF: function(path, onLoad){
        if(V3d.Lib.loadingManager === undefined) V3d.Lib.loadingManager = new THREE.LoadingManager();

        var loader = new THREE.GLTFLoader(V3d.Lib.loadingManager);
        try{
            loader.load(path, function (gltf) {
                V3d.Library.ParseGLTF(gltf, function(items){
                    if(onLoad !== undefined) onLoad(items);
                });
            });
        }
        catch(error){
            console.trace(error);
            V3f.Feedback.Notify(error);
        }
    }
});