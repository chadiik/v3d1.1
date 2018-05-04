
V3f.Project.Library.Controller = {
    LoadGLTF: function(){
        var extractPath = V3d.Ressources.Temp('archives');

        Cik.IO.PHPClear('../' + extractPath,
            function(){ // success
                console.log('cleared', extractPath);
            },
            function(){
                console.log('error clearing space for archive');
            }
        );
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

            Cik.IO.PHPZipExtract(file, '../' + extractPath,
                function(response){
                    if(response === '0'){
                        console.log("error uploading/unzipping archive");
                    }
                    else{
                        try{
                            var gltfPath = extractPath + fileInfo.name + '/' + fileInfo.name + '.gltf';
                            V3f.Project.Library.LoadGLTFFile(gltfPath);
                        }
                        catch(lrlError){
                            V3f.Feedback.Notify('Library import failed: ' + lrlError);
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