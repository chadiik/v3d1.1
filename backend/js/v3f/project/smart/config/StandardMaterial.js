
V3f.Smart.StandardMaterialConfig = function(material, mesh){
    
    V3f.Smart.MaterialConfig.call(this, material, mesh);

    this.vertexColor = new THREE.Color(0, 0, 0);
    this.color = this.material.color.clone();
    var c = Cik.Config.Controller;
    var p = V3f.Smart.StandardMaterialConfig.materialProperties;
    var scope = this;
    this.keys.push(
        new c('color', undefined, undefined, undefined, function(){
            scope.material.color.r = this.color.r / 255;
            scope.material.color.g = this.color.g / 255;
            scope.material.color.b = this.color.b / 255;
        }),
        p.bumpScale,
        p.metalness,
        p.roughness,
        p.wireframe,
        'SetCubeCamEnv',
        new c('vertexColor', undefined, undefined, undefined, function(){
            this.UseVertexColor(this.vertexColor.r / 255, this.vertexColor.g / 255, this.vertexColor.b / 255);
        })
    );

    this.disabledTextures = {};
    this.displayedMapsEvents = [];
    this.capaUI = new V3f.UIElements.Capabilities();
};

V3f.Smart.StandardMaterialConfig.prototype = Object.assign(Object.create(V3f.Smart.MaterialConfig.prototype), {
    constructor: V3f.Smart.StandardMaterialConfig,

    OnGuiChanged: function(){
        V3f.Smart.MaterialConfig.prototype.OnGuiChanged.call(this);
    },

    Edit: function(gui, label){
        V3f.Smart.MaterialConfig.prototype.Edit.call(this, gui, label);
        
        var gui = this.config.gui;
        gui.onGUIEvent.push(this.OnGUIEvent.bind(this));
    },

    Enter: function(){
        V3f.Smart.MaterialConfig.prototype.Enter.call(this);

        var gui = this.config.gui;
        if(gui.opening) this.DisplayMaps();
    },

    Exit: function(){
        V3f.Smart.MaterialConfig.prototype.Exit.call(this);

        if(this.selectingCubeCamera){
            var scope = this;
            Cik.Input.DelayedAction(function(){
                console.log(V3f.Smart.CubeCamera);
                var smartCubeCamera = V3f.Smart.CubeCamera.active;
                if(smartCubeCamera){
                    scope.SetCubeCamEnv(smartCubeCamera.target);
                }
                scope.selectingCubeCamera = false;
            }, 500);
        }

        this.HideMaps();
    },

    DisplayMaps: function(){
        var keys = Object.keys(this.material);
        //keys.push(...Object.keys(this.disabledTextures));
        //keys.sort();

        var scope = this;
        this.displayedMapsEvents.length = 0;
        keys.forEach(key => {
            var property = this.material[key] || this.disabledTextures[key];
            var textureExists = false;
            if(V3f.Smart.StandardMaterialConfig.IsMapKey(key)){
                var src = 'ressources/NullImage.jpg';
                var label = key;
                textureExists = (property instanceof THREE.Texture) && !property.isCubeTexture;
                if(textureExists){
                    var image = property.image;
                    if(image){
                        src = image.src;
                        var filenameLength = src.length - src.lastIndexOf('/') - 1;
                        var trimmedSrc = Cik.Utils.LimitString(src, Math.max(32, filenameLength));
                        var dotURL = trimmedSrc.length < src.length;
                        label = key + ': ' + (dotURL ? '...' : '') + decodeURI(trimmedSrc);
                    }
                }
                        
                var imageDisplay = V3f.MainUI.instance.ShowImage(src, label);
                if(this.disabledTextures[key]) imageDisplay.opacity = .5;

                var dbc = 0;
                var eDescriptor = {owner: imageDisplay.domElement};
                imageDisplay.domElement.addEventListener(eDescriptor.type = 'mouseup', eDescriptor.handler = function(e){
                    var t = window.performance.now();
                    if(t - dbc < 500){
                        if(textureExists){
                            var smartTexture = new V3f.Smart.Texture(property, scope.material);
                            smartTexture.Show();
                        }
                        else{
                            V3f.Smart.Texture.CreateTexture(function(texture){
                                scope.material[key] = texture;
                                var smartTexture = new V3f.Smart.Texture(texture, scope.material);
                                smartTexture.Show();
                            });
                        }
                    }
                    dbc = t;
                });
                scope.displayedMapsEvents.push(eDescriptor);

                if(textureExists){
                    this.capaUI.hook = imageDisplay.domElement;
                    var deleteBtn = this.capaUI.CreateButton('delete');
                    eDescriptor = {owner: deleteBtn};
                    deleteBtn.addEventListener(eDescriptor.type = 'mouseup', eDescriptor.handler = function(e){
                        e.preventDefault();
                        var state = scope.ToggleTexture(key);
                        imageDisplay.opacity = state ? 1 : .5;
                    });
                    scope.displayedMapsEvents.push(eDescriptor);

                    var copyBtn = this.capaUI.CreateButton('copy', {top: '22px'});
                    eDescriptor = {owner: copyBtn};
                    copyBtn.addEventListener(eDescriptor.type = 'mouseup', eDescriptor.handler = function(e){
                        e.preventDefault();
                        scope.CopyTexture(key);
                    });
                    scope.displayedMapsEvents.push(eDescriptor);
                }
            }
        });
    },

    ToggleTexture: function(key){

        var texture = this.material[key];

        if(texture === null){
            if(this.disabledTextures !== undefined){
                texture = this.disabledTextures[key];
                this.material[key] = texture;
                delete this.disabledTextures[key];
            }
        }
        else{
            this.disabledTextures[key] = texture;
            this.material[key] = null;
        }

        this.material.needsUpdate = true;
        return this.material[key] !== null;
    },

    CopyTexture: function(key){
        console.log(key);
    },

    SetCubeCamEnv: function(cubeCameraController){
        if(cubeCameraController === undefined){ // gui call
            this.selectingCubeCamera = true;
            return;
        }

        this.material.userData.cubeCameraID = cubeCameraController.id;
        this.material.envMap = cubeCameraController.cubeTexture;
        this.material.needsUpdate = true;
    },

    UseVertexColor: function(r, g, b){

        var geometry = this.mesh.geometry;
        var colorAttribute = geometry.attributes.color;
        if(colorAttribute === undefined){
            var positionAttribute = geometry.attributes.position;
            var size = positionAttribute.count * 3;
            geometry.addAttribute('color', new THREE.Float32BufferAttribute(size, 3));
            colorAttribute = geometry.attributes.color;
        }

        var disableCeil = .9;
        if(r > disableCeil && g > disableCeil && b > disableCeil){
            geometry.removeAttribute('color');
            this.material.vertexColors = THREE.NoColors;
            return;
        }
        
        colorAttribute.needsUpdate = true;
        var colors = colorAttribute.array;

        for(var i = 0, numColors = colorAttribute.count; i < numColors; i++){
            colors[i * 3] = r;
            colors[i * 3 + 1] = g;
            colors[i * 3 + 2] = b;
        }

        this.material.vertexColors = THREE.VertexColors;
    },

    HideMaps: function(){
        this.displayedMapsEvents.forEach(eDescriptor => {
            eDescriptor.owner.removeEventListener(eDescriptor.type, eDescriptor.handler);
        });
        V3f.MainUI.instance.ClearImages();
    },

    OnGUIEvent: function(type){
        switch(type){
            case 'open':
            this.DisplayMaps();
            break;

            case 'close':
            this.HideMaps();
            break;
        }
    }
});

Object.assign(V3f.Smart.StandardMaterialConfig, {

    ignoredMapKeys: 'alphaMap/aoMap/emissiveMap/lightMap'.split('/'),

    mapKeys: 'bumpMap/displacementMap/envMap/map/metalnessMap/normalMap/roughnessMap'.split('/'),

    IsMapKey: function(key){
        for(var i = 0; i < this.mapKeys.length; i++){
            if(key === this.mapKeys[i]) return true;
        };
        return false;
    },

    materialProperties: (function(){
        var c = Cik.Config.Controller;
        return {

            bumpScale: new c('material.bumpScale', -10, 10, .05),
            metalness: new c('material.metalness', -1, 1, .05),
            roughness: new c('material.roughness', -1, 2, .05),
            wireframe: 'material.wireframe',
            displacementScale: new c('material.displacementScale', -10, 10, .05),
            normalX: new c('material.normalScale.x', -1, 1, .05),
            normalY: new c('material.normalScale.y', -1, 1, .05),
        };
    })()
});