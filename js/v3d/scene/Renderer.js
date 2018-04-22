
V3d.Scene.Renderer = function(params){

    this.params = params;
    console.log(this.params);
    this.renderer = new THREE.WebGLRenderer({antialias: this.params.antialias});

    if(this.params.shadows){
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.shadowMap.autoUpdate = false;
    }

    this.renderer.physicallyCorrectLights = true;
    this.renderer.gammaInput = true;
    this.renderer.gammaOutput = true;
    this.renderer.toneMapping = THREE.Uncharted2ToneMapping;
    this.renderer.toneMappingExposure = 1.4;

    this.maxTextureSize = this.renderer.context.getParameter(this.renderer.context.MAX_TEXTURE_SIZE);
    this.pixelRatio = window.devicePixelRatio !== undefined ? window.devicePixelRatio : 1;
    this.renderer.setPixelRatio(this.pixelRatio);
    this.renderer.setClearColor(new THREE.Color(this.params.clearColor), 1);

    this.renderNode = this.renderer;
};

Object.assign(V3d.Scene.Renderer.prototype, {

    UseCamera: function(camera){
        this.camera = camera;
    },

    UpdateShadowMaps: function(){
        this.renderer.shadowMap.needsUpdate = true;
    },

    ResizeRenderer: function(screen){
        var newWidth = screen.width * this.params.renderSizeMul;
        var newHeight = screen.height * this.params.renderSizeMul;
        this.renderer.setSize(newWidth, newHeight);
    },

    ResizeDomElement: function(screen){
        this.renderer.domElement.style.width = screen.width + 'px';
		this.renderer.domElement.style.height = screen.height + 'px';
    },

    ReconfigureViewport: function(screen){
        this.camera.aspect = screen.width / screen.height;
        this.camera.updateProjectionMatrix();

        this.ResizeRenderer(screen);
        this.ResizeDomElement(screen);
    },

    Render: function(scene){
        if(this.renderNode === this.renderer) this.renderer.render(scene, this.camera);
    }
});