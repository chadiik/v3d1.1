
V3f.Smart.Light = function(light, label){
    if(label === undefined) label = 'Light';
    V3f.Smart.call(this, light, label);

    var c = Cik.Config.Controller; //(property, min, max, step, onChange)
    function prependArray(pre, values){
        for(var i = 0; i < values.length; i++) {
            if(values[i] instanceof Cik.Config.Controller) values[i].property = pre + values[i].property;
            else values[i] = pre + values[i];
        }
        return values;
    }

    this.color = this.target.lightObject.color.getHex();
    var scope = this;

    var track = [];
    
    var largeIntensity = this.target.lightObject instanceof THREE.PointLight;
    track = track.concat(prependArray('target.lightObject.', [
        'name', 
        largeIntensity ? new c('intensity', 0, 1000, 1) : new c('intensity', 0, 2, .02)
    ]));

    track = track.concat([
        new c('color', undefined, undefined, undefined, function(){
            scope.target.lightObject.color.setHex(scope.color);
        })
    ]);
    
    track.push('DebugLight', 'Delete');
    this.Config('Light', this, this.OnGuiChanged.bind(this), ...track);
};

V3f.Smart.Light.prototype = Object.assign(Object.create(V3f.Smart.prototype), {
    constructor: V3f.Smart.Light,

    DebugLight: function(){
        console.log(this.target.lightObject);
    },

    Delete: function(){
        if(this.target.lightObject.OnDelete !== undefined){
            this.target.lightObject.OnDelete();
        }
    },

    OnGuiChanged: function(){
        this.target.Update();
    },

    Show: function(){
        
        V3f.Smart.prototype.Show.call(this);
    }
});