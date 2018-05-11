
V3d.Library.CubeCameraController = function(resolution){

    this.resolution = resolution || 256;

    var near = .5;
    var far = 1000;
    var format = THREE.RGBAFormat;
    var minFilter = THREE.LinearMipMapLinearFilter;

    this.cubeCamera = new THREE.CubeCamera(near, far, this.resolution, format);
    this.id = this.cubeCamera.uuid;
    this.cubeCamera.renderTarget.texture.minFilter = minFilter;

    this.readBuffer = new Uint8Array(this.resolution * this.resolution * 4);
    
	this.offscreenCanvas = V3d.Library.CreateCanvas(this.resolution);
    this.context = V3d.Library.context2d[this.resolution.toString()];
    
    this.cubeTexture = new THREE.CubeTexture();

    this.onUpdate = [];

    this.renderer;
    this.scene;

    V3d.Library.CubeCameraController.Add(this);
};

Object.assign(V3d.Library.CubeCameraController.prototype, {

    UseRenderer: function(renderer){
        this.renderer = renderer;
    },

    UseScene: function(scene){
        this.scene = scene;
    },

    ReadRenderTarget: function(){
        var imgIndex = 0;
        var context = this.context;
        var offscreenCanvas = this.offscreenCanvas;
        var cubeTexture = this.cubeTexture;
        var resolution = this.resolution;

        this.renderer.readRenderTargetPixels(this.cubeCamera.renderTarget, 0, 0, resolution, resolution, this.readBuffer, function(buffer){

            var clampedBuffer = new Uint8ClampedArray(resolution * resolution * 4);
            for(var iy = 0; iy < resolution; iy++){
                for(var ix = 0; ix < resolution; ix++){
                    var ic = (iy * resolution + ix) * 4;
                    var ib = (iy * resolution + resolution - 1 - ix) * 4;
                    for(var irgba = 0; irgba < 4; irgba++){
                        clampedBuffer[ic + irgba] = buffer[ib + irgba];
                    }
                }
            }
            var image = new ImageData(clampedBuffer, resolution, resolution);
			cubeTexture.images[imgIndex] = image;
            imgIndex++;
        });

        var i0 = cubeTexture.images[0];
        cubeTexture.images[0] = cubeTexture.images[1];
        cubeTexture.images[1] = i0;
        cubeTexture.needsUpdate = true;

        for(var i = 0; i < this.onUpdate.length; i++){
            this.onUpdate[i]();
        }
    },

    Update: function(){
        this.cubeCamera.updateMatrixWorld();
        this.cubeCamera.update(this.renderer, this.scene);

        this.ReadRenderTarget();
    }
});

Object.assign(V3d.Library.CubeCameraController, {

    instances: [],

    Add: function(controller){
        this.instances.push(controller);
    },

    Get: function(id){
        for(var i = 0; i < this.instances.length; i++){
            if(this.instances[i].id === id) return this.instances[i];
        }
        return undefined;
    },

    UpdateAll: function(){
        for(var i = 0; i < this.instances.length; i++){
            var cubeCameraController = this.instances[i];
            cubeCameraController.Update();
        }
    },

    FromJSON: function(data){
        var transform = V3d.Scene.TRS.FromJSON(data.transform);
        var resolution = data.resolution;
        var cubeCameraController = new V3d.Library.CubeCameraController(resolution);
        cubeCameraController.id = data.id;
        cubeCameraController.cubeCamera.position.copy(transform.position);
        cubeCameraController.cubeCamera.rotation.copy(transform.rotation);

        return cubeCameraController;
    }
});