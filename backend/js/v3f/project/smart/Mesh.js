
V3f.Smart.Mesh = function(mesh){
    V3f.Smart.Object3D.call(this, mesh);

    this.Config('Mesh', this, this.OnGuiChanged.bind(this), 'target.visible', 'InvertNormals', 'DebugGeometry');

    var isSM = mesh.material instanceof THREE.MeshStandardMaterial;
    var materialConfig = isSM ? new V3f.Smart.StandardMaterialConfig(mesh.material) : new V3f.MaterialConfig(mesh.material);
    materialConfig.Edit(this.gui, isSM ? 'StandardMaterial' : 'Material');
};

V3f.Smart.Mesh.prototype = Object.assign(Object.create(V3f.Smart.Object3D.prototype), {
    constructor: V3f.Smart.Mesh,

    OnGuiChanged: function(){

    },

    DebugGeometry: function(){
        console.log(this.target.geometry);
    },

    InvertNormals: function(){
        var geometry = this.target.geometry;
        if(geometry instanceof THREE.BufferGeometry){
            var index = geometry.index.array.reverse();
            geometry.index.needsUpdate = true;
        }
    }    
});