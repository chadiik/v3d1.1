
V3d.Library.Asset.Config = function(asset){
    this.asset = asset;
};

Object.assign(V3d.Library.Asset.Config.prototype, {

    Save: function(){
        this.meshes = {};
        this.materials = {};

        var scope = this;
        this.asset.view.traverse(function(child){
            if(child instanceof THREE.Mesh){
                scope.TrackMesh(child);
            }
        });
    },

    Load: function(){
        var scope = this;
        this.asset.view.traverse(function(child){
            if(child instanceof THREE.Mesh){
                scope.LoadToMesh(child);
            }
        });
    },

    TrackMesh: function(mesh){
        this.meshes[mesh.uuid] = mesh.smart.config.Snapshot();
        this.materials[mesh.material.uuid] = mesh.material.materialConfig.config.Snapshot();

        console.log('tracked', this);
    },

    LoadToMesh: function(mesh){
        Cik.Config.Load(mesh.smart, this.meshes[mesh.uuid]);
        mesh.smart.UpdateGUI();

        Cik.Config.Load(mesh.material.materialConfig, this.materials[mesh.material.uuid]);
        mesh.material.smart.UpdateGUI();

        console.log('load', this);
        
    },

    toJSON: function(){
        return {
            meshes: this.meshes,
            materials: this.materials
        };
    }

});

Object.assign(V3d.Library.Asset.Config, {

    FromJSON: function(data, asset){
        var config = new V3d.Library.Asset.Config(asset);
        config.meshes = data.meshes;
        config.materials = data.materials;
        return config;
    }
});