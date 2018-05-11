
V3f.Smart.PointLight = function(light, label){
    if(label === undefined) label = 'PointLight';
    V3f.Smart.Light.call(this, light, label);

    var c = Cik.Config.Controller; //(property, min, max, step, onChange)
    function prependArray(pre, values){
        for(var i = 0; i < values.length; i++) {
            if(values[i] instanceof Cik.Config.Controller) values[i].property = pre + values[i].property;
            else values[i] = pre + values[i];
        }
        return values;
    }

    var track = [];
    
    track = track.concat(prependArray('target.lightObject.', [
        'distance',
        new c('power', 0, 1000, 1),
        'decay'
    ]));

    track = track.concat(prependArray('target.lightObject.shadow.', [
        new c('bias', -1, 1, .0001),
        'radius'
    ]));

    track = track.concat(prependArray('target.lightObject.shadow.camera.', [
        'fov',
        'near',
        'far'
    ]));

    var shadowMapSizes = {'256': 256, '512': 512, '1024': 1024, '2048': 2048, '4096': 4096};
    track.push(
        new c('shadowMapSize', shadowMapSizes)
    );

    var folder = this.Config('PointLight', this, this.OnGuiChanged.bind(this), ...track);
    folder.open();
};

V3f.Smart.PointLight.prototype = Object.assign(Object.create(V3f.Smart.Light.prototype), {
    constructor: V3f.Smart.PointLight,

    DebugLight: function(){
        
        V3f.Smart.Light.prototype.DebugLight.call(this);
    },

    OnGuiChanged: function(){
        
        V3f.Smart.Light.prototype.OnGuiChanged.call(this);
    },

    Show: function(){
        
        V3f.Smart.Light.prototype.Show.call(this);
    }
});

Object.defineProperties(V3f.Smart.PointLight.prototype, {

    shadowMapSize: {
        get: function(){
            var shadowMapSize = this.target.shadowMapSize;
            if(shadowMapSize === undefined){
                var shadow = this.target.lightObject.shadow;
                shadowMapSize = shadow.mapSize.y;
            }
            
            return shadowMapSize;
        },

        set: function(value){
            value = parseFloat(value);
            this.target.SetShadowMapSize(value);
        }
    }
});