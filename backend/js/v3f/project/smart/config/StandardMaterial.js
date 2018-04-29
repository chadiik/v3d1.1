
V3f.Smart.StandardMaterialConfig = function(material){
    
    V3f.Smart.MaterialConfig.call(this, material);

    var c = Cik.Config.Controller;
    this.keys.push(new c('material.metalness', -1, 1, .05));
};

V3f.Smart.StandardMaterialConfig.prototype = Object.assign(Object.create(V3f.Smart.MaterialConfig.prototype), {
    constructor: V3f.Smart.StandardMaterialConfig,

    OnGuiChanged: function(){
        V3f.Smart.MaterialConfig.prototype.OnGuiChanged.call(this);
    }
});