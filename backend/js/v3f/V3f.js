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

        var cameraParams = {fov: 65, aspect: 1, near: 1 * units, far: 10000 * units, id: 'app'};
        var cameraController = new V3d.User.Camera(cameraParams);
        var fpsParams = {speedX: .0021, speedY: .0021, damping: .2, momentum: .9, limitPhi: 87 * Math.PI / 180, moveSpeed: 1};
        cameraController.FirstPersonControls(container, fpsParams);
        cameraController.OrbitControls(container);
        this.cameraController = cameraController;

        var guiChanged = function(){
            cameraController.camera.updateProjectionMatrix();
        };
        Cik.Config.TrackLoadEdit('camera', cameraController.camera, guiChanged, 'fov');

        var setupParams = {input: true, stats: true, sky: true, config: true};
        V3d.Scene.DefaultSetup(container, sceneController, sceneRenderer, cameraController, setupParams);

        var loop = new V3d.Loop('main');
        loop.Switch('app', this.sceneController, this.sceneRenderer, this.cameraController, {updateInput: true, updateStats: true});

        var scope = this;
        this.Update = (function(){
			return function(timestamp){
				scope.animationFrameID = requestAnimationFrame(scope.Update);

                loop.Update();
			}
		})();

		this.Update();
    },

    ProjectSetup: function(){
        this.project = new V3f.Project();
        this.project.GUI(this.container.parentElement);

        window.sceneController = this.sceneController;
        window.sceneRenderer = this.sceneController;

        var auto = true;
        if(auto){
            this.project.New();
            V3f.Auto.LoadLibrary('Complete1');
            Cik.Input.DelayedAction(function(){
                V3f.Auto.LoadLayout('Complete1');
            }, 1000);
            V3d.Scene.DefaultLights(this.sceneController);

            //cameraController.ToggleControls();
        }
        //V3f.Auto.LoadProject('../assets/Project/Project.v3f');

        //this.project.projectElements.AddLight();

        Cik.Input.ListenKeys(['ctrl', 'space']);
    }
});