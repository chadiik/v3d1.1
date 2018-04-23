
Object.assign(V3d.Library.prototype, {
    AddItems: function(...args){

    }
});

Object.assign(V3d.Library, {
    
    ParseGLTF: function(gltf, onComplete){
        console.log(gltf.scene);

        var propRegex = new RegExp(/(?:Prop_)(.+)/);

        var sceneController = V3d.app.sceneController;
        sceneController.Add(gltf.scene);

        var ui = V3f.MainUI.instance;
        var smartMeshes = [];
        gltf.scene.traverse(function(child){
            if(child instanceof THREE.Mesh){
                var smart = new V3f.Smart.Mesh(child);
                smartMeshes.push(smart);
            }
        });

        V3f.Smart.onFocus.push(function(smart){
            ui.Preview3D(smart.target);
        });

        V3f.Smart.onFocusLost.push(function(smart){
            ui.HidePreview3D();
        });

        var smartRaycastGroup = new Cik.Input.RaycastGroup(smartMeshes, 
            function(smartMesh){
                smartMesh.Show();
            }, 
            function(smartMesh){
                return smartMesh.target;
            }, 
            false, // updateProperty, 
            false, // recursive, 
            false, // continuous
        );

        Cik.Input.AddRaycastGroup('OnClick', 'Smart.Mesh', smartRaycastGroup);
    }
});