

V3f.UIElements.Scene = function(params){
    V3f.UIElements.Display.call(this, params);

    var scope = this;

    var units = 1;
    var controllerParams = {units: units};
    var sceneController = new V3d.Scene.Controller(controllerParams);
    this.sceneController = sceneController;

    var rendererParams = {clearColor: 0xafafaf, renderSizeMul: 1};
    var quality = new Cik.Quality().Common(2);
    Object.assign(rendererParams, quality);
    var sceneRenderer = new V3d.Scene.Renderer(rendererParams);
    this.sceneRenderer = sceneRenderer;

    var cameraParams = {fov: 45, aspect: 1, near: 1 * units, far: 20000 * units};
    var cameraController = new V3d.User.Camera(cameraParams);
    var fpsParams = {speedX: .0021, speedY: .0021, damping: .2, momentum: .9, limitPhi: 87 * Math.PI / 180};
    //cameraController.FirstPersonControls(this.domElement, fpsParams);
    cameraController.OrbitControls(this.domElement);
    this.cameraController = cameraController;

    var setupParams = {input: false, stats: false, sky: false, config: false};
    V3d.Scene.DefaultSetup(this.domElement, sceneController, sceneRenderer, cameraController, setupParams);

    sceneRenderer.renderer.domElement.classList.add('UISceneDisplay');
    var setHeight = function(){
        var style = window.getComputedStyle(sceneRenderer.renderer.domElement),
            width = parseFloat(style.width);
            
        var screen = {width: width, height: (width * .8)};
        sceneRenderer.ReconfigureViewport(screen);

        scope.Hide();
    };
    var setHeightOnResize = function(){
        setHeight();
        Cik.Input.RemoveEventCallback('onResize', setHeightOnResize);
    }
    Cik.Input.onResize.push(setHeightOnResize);
    Cik.Input.DelayedAction(setHeight, 500);

    this.Update = (function(){
		return function(timestamp){
			scope.animationFrameID = requestAnimationFrame(scope.Update);

            cameraController.Update();
            sceneRenderer.Render(sceneController.scene);
		}
	})();

	this.Update();
};

V3f.UIElements.Scene.prototype = Object.assign(Object.create(V3f.UIElements.Display.prototype), {
    constructor: V3f.UIElements.Scene,

    Reset: function(){
        var parent = this.sceneController.miscContainer;
        parent.children.forEach(child => {
            parent.remove(child);
        });
    },

    Add: function(object){
        this.sceneController.Add(object);
    }
});

Object.defineProperties(V3f.UIElements.Display.prototype, {
    fullscreen: {
        set: function(value){
            if(value){
                this.domParent = this.domElement.parentNode;
                this.domIndex = Array.prototype.slice.call(this.domParent.children).indexOf(this.domElement);

                this.domElement.classList.add('UIDisplayFull');
                document.body.appendChild(this.domElement);
            }
            else{
                this.domElement.classList.remove('UIDisplayFull');
                this.domParent.children[this.domIndex].insertAdjacentElement('beforebegin', this.domElement);
            }

            var style = window.getComputedStyle(this.domElement),
                width = parseFloat(style.width);
            var screen = {
                width: width,
                height: width * .8
            };
            this.sceneRenderer.ReconfigureViewport(screen);
        }
    }
});