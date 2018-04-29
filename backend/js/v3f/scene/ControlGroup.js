
V3f.ControlGroup = function(){
    var camera = V3f.Auto.GetDefaultCamera(),
        domElement = V3f.Auto.GetDefaultDomElement(),
        scene = V3f.Auto.GetDefaultSceneController();
        
    V3f.Control3D.call(this, camera, domElement);
    
    scene.Add(this.control);
    this.space = 'local';
    this.mode = 'translate';
};

V3f.ControlGroup.prototype = Object.assign(Object.create(V3f.Control3D.prototype), {
    constructor: V3f.ControlGroup,

    Attach: function(target){
        V3f.Control3D.prototype.Attach.call(this, target);
    }
});

Object.assign(V3f.ControlGroup, {
    
});