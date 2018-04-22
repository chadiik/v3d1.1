if(typeof V3d === 'undefined') V3d = {};

V3d.Result = {
    _NOINFO: '_',

    _ERROR: '$ERROR',
    Error: function(target, info){
        var msg = V3d.Result._ERROR + '[' + target + ']:' + (info !== undefined ? info : V3d.Result._NOINFO);
        return msg;
    },

    _OK: '$OK',
    OK: function(target, info){
        var msg = V3d.Result._OK + '[' + target + ']:' + (info !== undefined ? info : V3d.Result._NOINFO);
        return msg;
	},
	
	Check: function(msg){
		return msg.indexOf(V3d.Result._ERROR) === -1;
	},

	Trim: function(msg){
		return msg.slice(msg.indexOf('['));
	}
};

V3d.App = function(_interface, options) {
    V3d.app = this;
	this.interface = _interface;

	if(options === undefined) options = {
		selection: false,
		debug: !!window.debug
	};
	V3d.options = options;
	
    this.OnViewerReady();
};

Object.assign(V3d.App.prototype, {
	
	OnViewerReady: function(){

        // Override interface functions
        var iFunctions = ['LoadModel'];
		for(var iF = 0; iF < iFunctions.length; iF++){
            var functionName = iFunctions[iF];
            this['I' + functionName] = this.interface[functionName].bind(this.interface);
            this.interface[functionName] = this[functionName].bind(this);
        };

		// Notify
        this.interface.OnViewerReady();
        
        // Initial scene setup
        this.PerformanceTest();
    },

    PerformanceTest: function(){
        var qualityCheck = new Cik.Quality(this.OnPerformanceTestComplete.bind(this));
        qualityCheck.PerformanceTest1();
    },

    OnPerformanceTestComplete: function(quality){
        var container = document.getElementById('viewerGL');
        this.container = container;

        var units = 1;
        var controllerParams = {units: units};
        var sceneController = new V3d.Scene.Controller(controllerParams);
        this.sceneController = sceneController;
        window.scene = sceneController.scene;

        var rendererParams = {clearColor: 0xafafaf, renderSizeMul: 1};
        Object.assign(rendererParams, quality);
        var sceneRenderer = new V3d.Scene.Renderer(rendererParams);
        this.sceneRenderer = sceneRenderer;

        var cameraParams = {fov: 65, aspect: 1, near: 1 * units, far: 10000 * units};
        var cameraController = new V3d.User.Camera(cameraParams);
        var fpsParams = {speedX: .0021, speedY: .0021, damping: .2, momentum: .9, limitPhi: 87 * Math.PI / 180};
        //cameraController.FirstPersonControls(container, fpsParams);
        cameraController.OrbitControls(container);
        this.cameraController = cameraController;

        var guiChanged = function(){
            cameraController.camera.updateProjectionMatrix();
        };
        Cik.Config.TrackLoadEdit('camera', cameraController.camera, guiChanged, 'fov');

        var setupParams = {stats: true};
        V3d.Scene.DefaultSetup(container, sceneController, sceneRenderer, cameraController, setupParams);

        var scope = this;
        this.Update = (function(){
			return function(timestamp){
				scope.animationFrameID = requestAnimationFrame(scope.Update);

                Cik.Input.Update();
                cameraController.Update();
                sceneRenderer.Render(sceneController.scene);
	
				if(V3d.Scene.stats !== undefined){
					V3d.Scene.stats.update();
				}
			}
		})();

		this.Update();
    },

    LoadModel: function(v3fRelativePath, assetsRelativePath, callback, minCallback){
        this.ILoadModel(v3fRelativePath, assetsRelativePath, callback, minCallback);

    }
    
});