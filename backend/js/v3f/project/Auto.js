
V3f.Auto = {

    GetDefaultDomElement: function(){
        return V3d.app.sceneRenderer.renderer.domElement;
    },
    
    LoadLibrary: function(nameOnly){
        var gltfPath = V3d.Ressources.Temp('archives') + nameOnly + '/' + nameOnly + '.gltf';
        V3f.Project.Library.LoadGLTFFile(gltfPath);
    },

    LoadLayout: function(nameOnly){
        var gltfPath = V3d.Ressources.Temp('archives') + nameOnly + '/' + nameOnly + '.gltf';
        V3f.Project.Model.LoadGLTFFile(gltfPath);
    },

    FileAsArrayBuffer: function(path, onLoad){
        var loader = new THREE.FileLoader();
        loader.setResponseType('arraybuffer');
        loader.load(path, onLoad);
    },

    LoadProject: function(path){
        this.FileAsArrayBuffer(path, function(file){
            V3f.Project.LoadProjectFile(file, path);
        });
    },

    smartGroupCount: 0,
    MakeSmart: function(meshes, stateLabel){

        var smartMeshes = [];
        meshes.forEach(mesh => {
            var smart = new V3f.Smart.Mesh(mesh);
            mesh.smart = smart;
            smartMeshes.push(smart);
        });

        var smartRaycastGroup = new Cik.Input.RaycastGroup(smartMeshes, 
            function(smartMesh){
                if(stateLabel !== undefined){
                    var state = V3d.Loop.activeLoop.activeState;
                    if(state.label !== stateLabel) return;
                }

                smartMesh.Show();
                if(Cik.Input.keys['ctrl']){
                    if(smartMesh.target.asset !== undefined) smartMesh.target.asset.Smart();
                }
            }, 
            function(smartMesh){
                return smartMesh.target;
            }, 
            false, // updateProperty, 
            false, // recursive, 
            false, // continuous
        );

        Cik.Input.AddRaycastGroup('OnClick', 'Smart.Group' + (V3f.Auto.smartGroupCount ++), smartRaycastGroup);
    },

    DisplayRow: function(objects){
        var container = new THREE.Object3D();
        var box3 = new THREE.Box3();
        var vec3 = new THREE.Vector3();
        var slider = 0;
        for(var i = 0; i < objects.length; i++){
            var object = objects[i];

            box3.setFromObject(object);

            box3.getCenter(vec3);
            object.position.sub(vec3);

            box3.getSize(vec3);
            object.position.y += vec3.y * .5;

            object.position.x += slider + vec3.x * .5;
            slider += vec3.x * 1.1;

            container.add(object);
        }

        return container;
    },

    SmartDisplay: function(objects, sceneController){
        var state = V3d.Loop.activeLoop.activeState;
        if(sceneController === undefined) sceneController = state.sceneController;
        
        var row = V3f.Auto.DisplayRow(objects);
        sceneController.Add(row);

        var meshes = [];
        objects.forEach(object => {
            object.traverse(function(child){
                if(child instanceof THREE.Mesh){
                    meshes.push(child);
                }
            });
        });

        V3f.Auto.MakeSmart(meshes, state.label);
    }
};