
V3f.Project.Elements = function(){
    V3f.Project.Elements.instance = this;

    var scope = this;
    this.controller = {
        AddPointLight: function(){
            var light = new V3d.Library.Light(V3f.Project.Elements.CreateLightObject('point'));
            scope.AddLight(light);
        },

        AddAmbientLight: function(){
            var light = new V3d.Library.Light(V3f.Project.Elements.CreateLightObject('ambient'));
            scope.AddLight(light);
        }
    };
};

Object.assign(V3f.Project.Elements.prototype, {

    GUI: function(folder){
        var lightsFolder = folder.addFolder('Lights');
        lightsFolder.open();
        lightsFolder.add(this.controller, 'AddAmbientLight');
        lightsFolder.add(this.controller, 'AddPointLight');
    },

    AddLight: function(light){
        var sceneController = V3d.app.sceneController;

        sceneController.Add(light);
    },

    toJSON: function(){
        var lights = V3d.Library.Light.instances;
        return {
            lights: lights
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

    FromJSON: function(data){
        var projectElements = new V3f.Project.Elements();
        var lights = data.lights;
        lights.forEach(light => {
            var light = V3d.Library.Light.FromJSON(light);
            projectElements.AddLight(light);
        });

        return projectElements;
    }
});