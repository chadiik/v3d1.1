
V3f.Project.Model.Controller = {

    LoadLayout: function(){
        Cik.IO.PHPClear(V3d.Ressources.Temp('archives'));
        Cik.IO.GetFile(function(file){
            var fileInfo = Cik.IO.FileInfo(file);

            if(fileInfo.extension !== 'zip'){
                var abort = true;
                var query = 'Zipped GLTF assets only. Continue anyway?';
                V3f.Feedback.Confirm(query, function(){abort = false;});
                if(abort){
                    return;
                }
            }

            var extractPath = V3d.Ressources.Temp('archives');
            Cik.IO.PHPZipExtract(file, '../' + extractPath,
                function(response){
                    if(response === '0'){
                        console.log("error uploading/unzipping archive");
                    }
                    else{
                        try{
                            var gltfPath = extractPath + fileInfo.name + '/' + fileInfo.name + '.gltf';
                            V3f.Project.Model.LoadGLTFFile(gltfPath);
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