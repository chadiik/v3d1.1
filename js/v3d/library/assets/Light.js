
V3d.Library.Light = function(lightObject, shadowMapSize){
    console.warn(shadowMapSize);
    this.lightObject = lightObject;
    this.shadowMapSize = shadowMapSize !== undefined ? shadowMapSize : 512;
    V3d.Library.Light.RegisterLight(this);
};

Object.assign(V3d.Library.Light.prototype, {

    SetShadowMapSize: function(size){
        if(this.lightObject.shadow === undefined) return;

        if(size === undefined) size = this.shadowMapSize;
        this.shadowMapSize = size;

        this.lightObject.shadow.mapSize.set(size, size);
        this.lightObject.shadow.map.dispose();
        this.lightObject.shadow.map = null;
    },

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
        var light = new V3d.Library.Light(lightObject, parseInt(data.shadowMapSize));
        return light;
    },

    UpdateAll: function(){
        for(var i = 0; i < this.instances.length; i++){
            this.instances[i].SetShadowMapSize();
        }
    }
});