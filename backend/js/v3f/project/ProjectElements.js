
V3f.Project.Elements = function(project){

    var scope = this;
    this.controller = {
        AddPointLight: function(){
            var light = new V3d.Library.Light(V3f.Project.Elements.CreateLightObject('point'));
            var spawnPosition = V3f.Project.Elements.SpawnPositionAhead();
            light.lightObject.position.copy(spawnPosition);
            scope.AddSceneObject(light);
        },

        AddAmbientLight: function(){
            var light = new V3d.Library.Light(V3f.Project.Elements.CreateLightObject('ambient'));
            var spawnPosition = V3f.Project.Elements.SpawnPositionAhead();
            light.lightObject.position.copy(spawnPosition);
            scope.AddSceneObject(light);
        },

        AddCubeCam: function(){
            var cubeCamController = new V3d.Library.CubeCameraController(256);
            var spawnPosition = V3f.Project.Elements.SpawnPositionAhead();
            cubeCamController.cubeCamera.position.copy(spawnPosition);
            cubeCamController.helper.position.copy(spawnPosition);
            scope.AddSceneObject(cubeCamController.helper.view);
        },

        ao: {
            Edit: function(){
                scope.aoEditor.ToggleAOEditor();
            },

            Update: function(){
                scope.aoEditor.Update();
            }
        }
    };

    this.aoEditor = new V3f.Project.AOEditor(project.projectModel.model);
};

Object.assign(V3f.Project.Elements.prototype, {

    GUI: function(folder){
        var lightsFolder = folder.addFolder('Lights');
        lightsFolder.open();
        lightsFolder.add(this.controller, 'AddAmbientLight');
        lightsFolder.add(this.controller, 'AddPointLight');
        
        var envFolder = folder.addFolder('Environment');
        envFolder.open();
        envFolder.add(this.controller, 'AddCubeCam');

        var aoFolder = folder.addFolder('Ambient occlusion');
        aoFolder.open();
        aoFolder.add(this.controller.ao, 'Edit');
        aoFolder.add(this.controller.ao, 'Update');
    },

    AddSceneObject: function(object){
        var sceneController = V3d.Loop.GetActiveSceneController();
        sceneController.Add(object);
    },

    toJSON: function(){
        var lights = V3d.Library.Light.instances;
        var cubeCameras = V3d.Library.CubeCameraController.instances;
        return {
            lights: lights,
            cubeCameras: cubeCameras
        };
    }
});

Object.assign(V3f.Project.Elements, {

    lightsFactory: (function(){
        var factory = new Object();
        Object.defineProperties(factory, {
            ambient:{
                get: function(){
                    return new THREE.AmbientLight();
                }
            },
            point: {
                get: function(){
                    return new THREE.PointLight();
                }
            }
        });
        return factory;
    })(),

    CreateLightObject: function(type){
        return V3f.Project.Elements.lightsFactory[type];
    },

    SpawnPositionAhead: function(){
        var cameraController = V3d.Loop.GetActiveCameraController();
        var position = cameraController.SpawnPositionAhead();
        return position;
    },

    FromJSON: function(data, project){
        var projectElements = new V3f.Project.Elements(project);
        
        var lightsData = data.lights;
        lightsData.forEach(lightData => {
            var light = V3d.Library.Light.FromJSON(lightData);
            projectElements.AddSceneObject(light);
        });

        var renderer = V3d.Loop.GetActiveRenderer();
        var scene = V3d.Loop.GetActiveScene();

        var cubeCamerasData = data.cubeCameras;
        cubeCamerasData.forEach(cubeCameraData => {
            var cubeCameraController = V3d.Library.CubeCameraController.FromJSON(cubeCameraData);
            cubeCameraController.UseRenderer(renderer);
            cubeCameraController.UseScene(scene);

            projectElements.AddSceneObject(cubeCameraController.helper.view);
        });

        return projectElements;
    }
});