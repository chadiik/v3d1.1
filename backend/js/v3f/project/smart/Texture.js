
V3f.Smart.Texture = function(texture, material){
    V3f.Smart.call(this, texture);

    this.material = material;

    var minFilters = {
        NearestFilter: THREE.NearestFilter,
        NearestMipMapNearestFilter: THREE.NearestMipMapNearestFilter,
        NearestMipMapLinearFilter: THREE.NearestMipMapLinearFilter,
        LinearFilter: THREE.LinearFilter,
        LinearMipMapNearestFilter: THREE.LinearMipMapNearestFilter,
        LinearMipMapLinearFilter: THREE.LinearMipMapLinearFilter
    };

    var magFilters = {
        NearestFilter: THREE.NearestFilter,
        LinearFilter: THREE.LinearFilter
    };

    var anisotropy = { '1': 1, '2': 2, '4': 4};

    var c = Cik.Config.Controller;
    var track = [
        'BackToMaterial',
        new c('target.minFilter', minFilters),
        new c('target.magFilter', magFilters),
        new c('target.anisotropy', anisotropy),
        'LoadNewImage'
    ];

    var folder = this.Config('Texture', this, this.OnGuiChanged.bind(this), ...track);
    folder.open();
};

V3f.Smart.Texture.prototype = Object.assign(Object.create(V3f.Smart.prototype), {
    constructor: V3f.Smart.Texture,

    OnGuiChanged: function(){

        this.target.minFilter = parseInt(this.target.minFilter);
        this.target.magFilter = parseInt(this.target.magFilter);
        this.target.anisotropy = parseInt(this.target.anisotropy);

        this.material.needsUpdate = true;
    },

    UpdateTexture: function(){
        if(this.target.image) this.target.needsUpdate = true;
    },

    BackToMaterial: function(){
        if(this.material.smart){
            this.material.smart.Show();
        }
    },

    LoadNewImage: function(){
        V3f.Feedback.Notify('The selected image will be copied to the temp/assets folder');
        
        var scope = this;
        V3f.Smart.Texture.CreateTexture(function(texture){
            scope.target.image = texture.image;
            scope.target.mipmaps = [];
			scope.target.format = texture.format;
            scope.UpdateTexture();
            scope.material.needsUpdate = true;
        });
    }
});

Object.assign(V3f.Smart.Texture, {

    CreateTexture: function(callback){
        var mapsURL = V3d.Ressources.Temp('assets');
        Cik.IO.UploadFile(mapsURL, function(filename){
            var url = mapsURL + filename;
            var loader = new THREE.TextureLoader();
            loader.load(url,
                // onLoad callback
                function(texture){
                    texture.magFilter = THREE.LinearFilter;
                    texture.minFilter = THREE.LinearMipMapLinearFilter;
                    texture.wrapS = THREE.RepeatWrapping;
                    texture.wrapT = THREE.RepeatWrapping;

                    callback(texture);
                },
                // onProgress callback currently not supported
                undefined,
                // onError callback
                function(){
                    console.error('An error happened.');
                }
            );
        });
    }
});