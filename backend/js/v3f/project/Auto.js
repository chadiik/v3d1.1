
V3f.Auto = {
    
    LoadGLTF: function(nameOnly){
        var gltfPath = V3d.Ressources.Temp('archives') + nameOnly + '/' + nameOnly + '.gltf';
        V3f.Project.Library.LoadGLTF(gltfPath, function(items){
            console.log(items);
        });
    }
};