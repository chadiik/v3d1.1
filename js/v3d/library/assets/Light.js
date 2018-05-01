
V3d.Library.Light = function(lightObject){
    this.lightObject = lightObject;

    V3d.Library.Light.RegisterLight(this);
};

Object.assign(V3d.Library.Light.prototype, {

    Delete: function(){
        V3d.Library.Light.UnregisterLight(this);
    }
});

Object.assign(V3d.Library.Light, {

    instances: [],

    RegisterLight: function(light){
        this.instances.push(light);
    },

    UnregisterLight: function(light){
        var index = this.instances.indexOf(light);
        this.instances.splice(index, 1);
    },

    FromJSON: function(data){
        var lightObject = V3d.Library.loader.parse(data.lightObject);
        var light = new V3d.Library.Light(lightObject);
        return light;
    }
});