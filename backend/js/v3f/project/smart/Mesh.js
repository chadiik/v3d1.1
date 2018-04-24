
V3f.Smart.Mesh = function(mesh){
    V3f.Smart.Object3D.call(this, mesh);

    var meshChanged = function(){
    };
    var meshController = {
    };
    this.Config('Mesh', mesh, meshChanged, 'visible');

    var isSM = mesh.material instanceof THREE.MeshStandardMaterial;
    var materialConfig = isSM ? new V3f.Smart.StandardMaterialConfig(mesh.material) : new V3f.MaterialConfig(mesh.material);
    materialConfig.Edit(this.gui, isSM ? 'StandardMaterial' : 'Material');
};

V3f.Smart.Mesh.prototype = Object.assign(Object.create(V3f.Smart.Object3D.prototype), {
    constructor: V3f.Smart.Mesh
    
});