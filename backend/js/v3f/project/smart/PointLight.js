
V3f.Smart.PointLight = function(light, label){
    if(label === undefined) label = 'PointLight';
    V3f.Smart.call(this, light, label);

    var c = Cik.Config.Controller; //(property, min, max, step, onChange)
    function prependArray(pre, values){
        for(var i = 0; i < values.length; i++) {
            if(values[i] instanceof Cik.Config.Controller) values[i].property = pre + values[i].property;
            else values[i] = pre + values[i];
        }
        return values;
    }
    var track = prependArray('target.lightObject.', [
        'name', 
        new c('intensity', 0, 50, .5),
        'distance',
        new c('power', 0, 50, .5),
        'decay'
    ]);
    
    this.color = this.target.lightObject.color.getHex();
    var scope = this;
    track.splice(1, 0, 
        new c('color', undefined, undefined, undefined, function(){
            scope.target.lightObject.color.setHex(scope.color);
        })
    );
    
    track.push('DebugLight');
    this.Config('PointLight', this, this.OnGuiChanged.bind(this), ...track);
};

V3f.Smart.PointLight.prototype = Object.assign(Object.create(V3f.Smart.prototype), {
    constructor: V3f.Smart.PointLight,

    DebugLight: function(){
        console.log(this.target.lightObject);
    },

    OnGuiChanged: function(){
        
    },

    Show: function(){
       
        
        V3f.Smart.prototype.Show.call(this);
    }
});