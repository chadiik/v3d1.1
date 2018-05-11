
V3d.Project = {

    PreLoadSetup: function(){

    },

    PostLoadSetup: function(){

        this.PostLoadElements();
        this.PostLoadAssets();
    },

    PostLoadElements: function(){
        V3d.Library.Light.UpdateAll();
        V3d.Loop.GetActiveSceneRenderer().UpdateShadowMaps();
        V3d.Library.CubeCameraController.UpdateAll();
    },

    PostLoadAssets: function(){

        var libItems = V3d.Library.instance.items;
        for(var key in libItems){
            var libItem = libItems[key];

            var asset = libItem.asset;
            this.PostLoadAsset(asset);
        };
    },

    PostLoadAsset: function(asset){

        asset.view.traverse(function(child){
            if(child instanceof THREE.Mesh){
                var material = child.material;

                V3d.Project.Elements.PostLoadMaterial(material);
            }
        });
    }
    
};

V3d.Project.Elements = {

    PostLoadMaterial: function(material){

        if(material instanceof THREE.MeshStandardMaterial){
            var cubeCameraID = material.userData.cubeCameraID;
            if(cubeCameraID){
                if(material.envMap !== null) console.warn(material, 'envMap is being overwritten');

                var cubeCameraController = V3d.Library.CubeCameraController.Get(cubeCameraID);
                if(cubeCameraController === undefined) console.warn('CubeCameraController ' + cubeCameraID + ' not fount in', V3d.Library.CubeCameraController.instances);
                material.envMap = cubeCameraController.cubeTexture;
            }
        }
    }

};