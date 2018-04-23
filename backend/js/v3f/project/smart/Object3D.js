
V3f.Smart.Object3D = function(object, label){
    if(label === undefined) label = object.name;
    V3f.Smart.call(this, object, label);

    var guiChanged = function(){

    };

    var controller = {

    };

    this.Config('Object3D', object, guiChanged, 'position.x', 'position.y', 'position.z');
};

V3f.Smart.Object3D.prototype = Object.assign(Object.create(V3f.Smart.prototype), {
    constructor: V3f.Smart.Object3D

});