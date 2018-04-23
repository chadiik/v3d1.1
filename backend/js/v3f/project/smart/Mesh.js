
V3f.Smart.Mesh = function(mesh){
    V3f.Smart.Object3D.call(this, mesh);

    var meshChanged = function(){
    };
    var meshController = {
    };
    this.Config('Mesh', mesh, meshChanged, 'visible');

    var materialConfig = new V3f.Smart.StandardMaterialConfig(mesh.material);
    materialConfig.Edit(this.gui, 'StandardMaterial');
};

V3f.Smart.Mesh.prototype = Object.assign(Object.create(V3f.Smart.Object3D.prototype), {
    constructor: V3f.Smart.Mesh
    
});