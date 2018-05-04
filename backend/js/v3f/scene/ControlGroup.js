
V3f.ControlGroup = function(){
    var camera = V3d.Loop.GetActiveCamera(),
        domElement = V3f.Auto.GetDefaultDomElement(),
        sceneController = V3d.Loop.GetActiveSceneController();
        
    V3f.Control3D.call(this, camera, domElement);
    
    this.sceneController = sceneController;
    this.sceneController.Add(this.control);

    this.space = 'local';
    this.mode = 'translate';
};

V3f.ControlGroup.prototype = Object.assign(Object.create(V3f.Control3D.prototype), {
    constructor: V3f.ControlGroup,

    Attach: function(target){
        var sceneController = V3d.Loop.GetActiveSceneController();
        if(sceneController !== this.sceneController){
            this.sceneController.Remove(this.control);
            sceneController.Add(this.control);
            this.sceneController = sceneController;
        }
        V3f.Control3D.prototype.Attach.call(this, target);
    }
});

Object.assign(V3f.ControlGroup, {
    
});