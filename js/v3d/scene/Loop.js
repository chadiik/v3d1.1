if(typeof V3d === 'undefined') V3d = {};

V3d.Loop = function(label){
    V3d.Loop.instances[label] = V3d.Loop.activeLoop = this;

    this.activeState;
    this.previousStateLabel;
    this.states = {};
};

Object.assign(V3d.Loop.prototype, {

    //Switch(label, sceneController, sceneRenderer, cameraController, {updateInput: true, updateStats: true})
    Switch: function(label, sceneController, sceneRenderer, cameraController, params){
        
        var existing = this.states[label];

        if(this.activeState !== undefined){
            if(this.activeState === existing) return;
            this.previousStateLabel = this.activeState.label;
            this.activeState.cameraController.Hold();
        }

        var state;
        if(existing !== undefined){
            state = existing;
        }
        else{
            if(label === undefined) label = Object.keys(this.states).length;
            if(sceneRenderer === undefined) sceneRenderer = V3d.Loop.values.sceneRenderer;
            if(cameraController === undefined) cameraController = V3d.Loop.values.cameraController;
            if(sceneController === undefined) console.warn(label, ': sceneController not defined');

            state = new V3d.Loop.State(label, sceneController, sceneRenderer, cameraController, params);
            this.states[label] = state;
        }
        
        // Switch
        this.activeState = state;

        state.cameraController.Release();

        if(state.params.updateInput){
            Cik.Input.OnResize();
            Cik.Input.camera = state.cameraController.camera;
        }

        state.sceneRenderer.UseCamera(state.cameraController.camera);
    },

    Exit: function(){
        this.Switch(this.previousStateLabel);
    },

    Update: function(){
        var state = this.activeState;
        if(state !== undefined){
            var params = state.params;

            if(params.preUpdate) params.preUpdate();

            if(params.updateInput) Cik.Input.Update();

            state.cameraController.Update();
            state.sceneRenderer.Render(state.sceneController.scene);

            if(params.postUpdate) params.postUpdate();
	
			if(params.updateStats && V3d.Scene.stats !== undefined){
				V3d.Scene.stats.update();
			}
        }
    }
});

Object.assign(V3d.Loop, {

    defaultParams: {
        updateInput: true, updateStats: true, preUpdate: undefined, postUpdate: undefined
    },

    instances: {},

    activeLoop: undefined,

    values: {},
    UpdateValues(sceneController, sceneRenderer, cameraController){
        if(sceneController !== undefined) this.values.sceneController = sceneController;
        if(sceneRenderer !== undefined) this.values.sceneRenderer = sceneRenderer;
        if(cameraController !== undefined) this.values.cameraController = cameraController;
    },

    GetActiveSceneController: function(){
        var state = V3d.Loop.activeLoop.activeState;
        return state.sceneController;
    },

    GetActiveScene: function(){
        var sceneController = this.GetActiveSceneController();
        return sceneController.scene;
    },

    GetActiveCameraController: function(){
        var state = V3d.Loop.activeLoop.activeState;
        return state.cameraController;
    },

    GetActiveCamera: function(){
        var cameraController = this.GetActiveCameraController();
        return cameraController.camera;
    },

    GetActiveSceneRenderer: function(){
        var state = V3d.Loop.activeLoop.activeState;
        return state.sceneRenderer;
    },

    GetActiveRenderer: function(){
        var sceneRenderer = this.GetActiveSceneRenderer();
        return sceneRenderer.renderer;
    }

});


V3d.Loop.State = function(label, sceneController, sceneRenderer, cameraController, params){

    V3d.Loop.UpdateValues(sceneController, sceneRenderer, cameraController);

    this.label = label;
    this.sceneController = sceneController;
    this.sceneRenderer = sceneRenderer;
    this.cameraController = cameraController;

    this.params = Cik.Utils.AssignUndefined(params, V3d.Loop.defaultParams);
};