
function smartGLTF(gltf){
    var sceneController = V3d.app.sceneController;
    sceneController.Add(gltf.scene);

    var meshes = [];
    gltf.scene.traverse(function(child){
        if(child instanceof THREE.Mesh){
            meshes.push(child);
        }
    });

    V3f.Auto.MakeSmart(meshes);
}