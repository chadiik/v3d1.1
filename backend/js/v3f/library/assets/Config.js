
V3d.Library.Asset.Config = function(asset){
    this.asset = asset;
    this.meshes = {};
    this.materials = {};
};

Object.assign(V3d.Library.Asset.Config.prototype, {

    Save: function(id){

        var scope = this;
        this.asset.view.traverse(function(child){
            if(child instanceof THREE.Mesh){
                if(scope.meshes[id] === undefined) scope.meshes[id] = {};
                if(scope.materials[id] === undefined) scope.materials[id] = {};
                scope.TrackMesh(child, id);
            }
        });

        console.log(this.asset.sov.ToString(), 'tracked', this.toJSON());
    },

    Load: function(id){
        console.log('load', id);
        var scope = this;
        this.asset.view.traverse(function(child){
            if(child instanceof THREE.Mesh){
                scope.LoadMesh(child, id);
                child.material.needsUpdate = true;
            }
        });

        console.log(this.asset.sov.ToString(), 'loaded', this.toJSON());

        V3d.Loop.GetActiveSceneRenderer().UpdateShadowMaps();
    },

    TrackMesh: function(mesh, id){
        var meshExtra = new Cik.Config(mesh);
        var meshExtraTrack = ['castShadow', 'receiveShadow'];
        meshExtra.Track(...meshExtraTrack);

        this.meshes[id][mesh.hid] = {
            smart: mesh.smart.config.Snapshot(meshExtraTrack.concat('InvertNormals', 'DebugGeometry')),
            extra: meshExtra.Snapshot()
        };


        var materialExtra = new Cik.Config(mesh.material);
        var materialExtraTrack = [];
        materialExtra.Track(...materialExtraTrack);

        this.materials[id][mesh.hid] = {
            materialConfig: mesh.material.materialConfig.config.Snapshot(materialExtraTrack.concat('SelectByMaterial')),
            extra: materialExtra.Snapshot()
        };
    },

    LoadMesh: function(mesh, id){
        var hid = mesh.hid;
        console.log('hid=', hid);

        Cik.Config.Load(mesh.smart, this.meshes[id][hid].smart);
        Cik.Config.Load(mesh, this.meshes[id][hid].extra);
        mesh.smart.UpdateGUI();

        Cik.Config.Load(mesh.material.materialConfig, this.materials[id][hid].materialConfig);
        Cik.Config.Load(mesh.material, this.materials[id][hid].extra);
        mesh.material.smart.UpdateGUI();    
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
        console.log('config loaded for', asset.sov.ToString());
        return config;
    }
});