if(typeof V3f === 'undefined') V3f = {};

V3f.App = function() {
    V3d.app = this;

	V3f.options = {
		debug: true
	};

	var quality = new Cik.Quality().Common(2);
    this.Init(quality);
    this.ProjectSetup();
};

Object.assign(V3f.App.prototype, {
    Init: function(quality){
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

        var setupParams = {input: true, stats: true, sky: true, config: true};
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

    ProjectSetup: function(){
        this.project = new V3f.Project();
        this.project.GUI(this.container.parentElement);
        
        V3f.Auto.LoadGLTF('First');
    }
});