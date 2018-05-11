console.log('TODO: Runtime lightmap generation (+AO merge). Light baking, mix/matching on change.');
console.log('TODO: Dxt3 compression on publish, https://github.com/Makio64/img2dds', 'more https://www.fsdeveloper.com/wiki/index.php?title=DXT_compression_explained');

V3d.Library.Asset = Cik.Utils.Redefine(V3d.Library.Asset, function(instanceProperties){
    return function(sov, object){
        instanceProperties.constructor.call(this, sov, object);
        this.Parse();

        this.alternates = {'default': object};
    }
});

Object.assign(V3d.Library.Asset.prototype, {

    UseAlternateView: function(key, view){
        if(!key) key = 'default';
        if(view !== undefined) this.alternates[key] = view;
        this.view = this.alternates[key];
    },

    Smart: function(){
        if(V3d.Library.Asset.controlGroup === undefined) V3d.Library.Asset.controlGroup = new V3f.ControlGroup();

        var scope = this;
        if(this.smart === undefined) {
            this.smart = new V3f.Smart.Asset(this, this.sov.ToString());
            this.smart.onFocusLost.push(function(){
                V3d.Library.Asset.controlGroup.Detach();
            });
            this.smart.onFocus.push(function(){
                V3d.Library.Asset.controlGroup.Attach(scope.view);
            });
        }
        this.smart.Show();
    },

    FindSection: function(){ // for Smart dialog
        V3d.Model.FindSection(this.view);
    },

    GetSmartParams: function(){
        // (folderName, target, guiChanged, ...args)

        var folderName = 'Asset';
        var target = this;
        var guiChanged = this.OnGuiChanged;
        var track = ['Smart', 'FindSection'];

        return [folderName, target, guiChanged].concat(track);
    },

    SaveDefaults: function(){
        if(this.config === undefined){
            this.config = new V3d.Library.Asset.Config(this);
            this.config.Save('0');
        }
    },

    Parse: function(){
        
        var scope = this;

        this.view.traverse(function(child){
            child.asset = scope;

            if(child instanceof THREE.Mesh){
                var material = child.material;
                scope.ParseMaterial(material);
            }
        });
    },

    ParseMaterial: function(material){

        this.materials = [];
        this.textures = [];
        
        if(V3d.Library.Asset.materials[material.uuid] === undefined)
            V3d.Library.Asset.materials[material.uuid] = material;
        
        this.materials.push(material);

        material.shadowSide = THREE.FrontSide;

        var properties = Object.values(material);
        properties.forEach(property => {
            if(property instanceof THREE.Texture){
                var texture = property;
                this.textures.push(texture);
            }
        });
    },

    BackupGeom: function(){
        if(this.backedupGeom === undefined){
            var scale = Math.pow(10, 5);
            var backedupGeom = {_scale: scale};

            var hidCheck = {};
            this.view.traverse(function(child){
                if(child instanceof THREE.Mesh){
                    if(hidCheck[child.hid] === undefined) hidCheck[child.hid] = 0;
                    hidCheck[child.hid]++;

                    if(backedupGeom[child.hid] === undefined){
                        var geometry = child.geometry.clone();
                        V3d.Library.Asset.TransformGeometryAttributes(geometry, function(n){
                            return Math.round(n * scale);
                        });
                        backedupGeom[child.hid] = geometry;
                    }
                    else{
                        console.warn(child.hid, 'was being backedup again');
                    }
                }
            });

            this.backedupGeom = backedupGeom;
        }
    },

    toJSON: function(){

        this.BackupGeom();
        var backedupGeom = this.backedupGeom;
        var cleanView = this.view.clone(true);
        cleanView.traverse(function(child){
            if(child instanceof THREE.Mesh){
                if(backedupGeom !== undefined) child.geometry = backedupGeom[child.name];
                child.material = child.material.clone();
                var keys = Object.keys(child.material);
                keys.forEach(key => {
                    var property = child.material[key];
                    if(property instanceof THREE.Texture){
                        if(property.isCubeTexture){
                            child.material[key] = null;
                        }
                        else{
                            child.material[key] = property.clone();
                        }
                    }
                });
            }
        });
        
        var scale = backedupGeom !== undefined ? backedupGeom._scale : 0;

        V3d.Library.Asset.StripTextures(cleanView);
        return {
            sov: this.sov,
            view: cleanView.toJSON(),
            config: this.config,
            scale: scale
        };
    }
});

Object.assign(V3d.Library.Asset, {

    materials: {},

    controlGroup: undefined,

    DUMMY_TEX: (function(){
        return new THREE.TextureLoader().load("data:image/jpeg;base64,/9j/4QAYRXhpZgAASUkqAAgAAAAAAAAAAAAAAP/sABFEdWNreQABAAQAAABkAAD/7gAOQWRvYmUAZMAAAAAB/9sAhAABAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAgICAgICAgICAgIDAwMDAwMDAwMDAQEBAQEBAQIBAQICAgECAgMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwP/wAARCAACAAIDAREAAhEBAxEB/8QASgABAAAAAAAAAAAAAAAAAAAACwEBAAAAAAAAAAAAAAAAAAAAABABAAAAAAAAAAAAAAAAAAAAABEBAAAAAAAAAAAAAAAAAAAAAP/aAAwDAQACEQMRAD8AP/B//9k=");
    })(),

    ImageCheck: function(str){
        str = str.toLowerCase();
        return str.indexOf('png') !== -1 || str.indexOf('jpg') !== -1 || str.indexOf('jpeg') !== -1;
    },

    StripTextures: function(object3d){
        if(this.texImages === undefined){
            this.texImages = {};
        }
        var texImages = this.texImages;
        var dummyImage = this.DUMMY_TEX.image;
        var dummyPrefix = this.DUMMY_PREFIX;

        object3d.traverse(function(child){
            if(child instanceof THREE.Mesh){
                var material = child.material;
                var properties = Object.values(material);
                properties.forEach(property => {
                    if(property instanceof THREE.Texture){
                        var texture = property;
                        if(texture.image){
                            var dummify = (texture.uuid.toString().indexOf(dummyPrefix) === -1) && V3d.Library.Asset.ImageCheck(texture.name);
                            if(dummify){
                                var id = texture.name;
                                if(texImages[id] === undefined){
                                    texImages[id] = texture.image;
                                }

                                texture.image = dummyImage;
                                texture.uuid = dummyPrefix + texture.uuid;
                            }
                        }
                    }
                });
            }
        });
    },

    FromJSON: (function(){
        var originalFunction = V3d.Library.Asset.FromJSON;
        return function(data){
            var asset = originalFunction.call(V3d.Library.Asset, data);

            var scale = data.scale || Math.pow(10, 5);
            if(scale !== undefined && scale > 0){
                scale = 1 / scale;
                var backedupGeom = {};
                asset.view.traverse(function(child){
                    if(child instanceof THREE.Mesh){
                        var geometry = child.geometry;
                        backedupGeom[child.name] = geometry.clone();
                        V3d.Library.Asset.TransformGeometryAttributes(geometry, function(n){
                            return n * scale;
                        });
                    }
                });
                asset.backedupGeom = backedupGeom;
            }

            var configData = data.config;
            if(configData !== undefined){
                var config = V3d.Library.Asset.Config.FromJSON(configData, asset);
                asset.config = config;
            }
            return asset;
        };
    })(),

    TransformGeometryAttributes: function(geometry, transform){
        if(geometry instanceof THREE.BufferGeometry){
            var attributes = geometry.attributes;
			for (var key in attributes){
                if (geometry.attributes[ key ] === undefined) continue;
				var attribute = attributes[ key ];
                var attributeArray = attribute.array;

                for (var i = 0, arrayLen = attributeArray.length; i < arrayLen; i++) {
                    attributeArray[ i ] = transform(attributeArray[ i ]);
                }
            }
        }
        else{
            console.warn('Not implemented for geometry type of', geometry);
        }
    },

    UseAlternateView: function(key, viewTemplate){
        V3d.Library.IterateItems(function(libItem){
            var asset = libItem.asset;
            asset.UseAlternateView(key, viewTemplate !== undefined ? viewTemplate.clone() : undefined);
        });
    }
});