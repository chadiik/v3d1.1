if(typeof V3f === 'undefined') V3f = {};

V3f.Control3D = function(camera, domElement){
    this.control = new THREE.TransformControls(camera, domElement);
    this.control.addEventListener('change', this.Update.bind(this));

    this.control.traverse(function(child){
        child.renderOrder = 2;
    })
};

Object.assign(V3f.Control3D.prototype, {

    Attach: function(target){
        this.control.attach(target);
    },

    Detach: function(){
        this.control.detach();
    },

    Update: function(){
        this.control.update();
    }
});

Object.defineProperties(V3f.Control3D.prototype, {
    space: {
        get: function(){
            return this.control.space;
        },
    
        set: function(value){
            this.control.space = value;
        }
    },

    mode: {
        // translate || rotate || scale
        set: function(value){
            this.control.setMode(value);
        }
    }
    
});

Object.assign(V3f.Control3D, {

    active: undefined,

    controls: {},

    Create: function(id){
        var sceneController = V3d.app.sceneController, sceneRenderer = V3d.app.sceneRenderer, cameraController = V3d.app.cameraController;
        var scene = sceneController.scene, domElement = sceneRenderer.renderer.domElement, camera = cameraController.camera;
        
        var control = new V3f.Control3D(camera, domElement);
        this.active = this.controls[id] = control;
    },

    Get: function(id){
        return this.controls[id];
    },

    Attach: function(target){
        if(this.active === undefined) this.Create('default');
        this.active.Attach(target);
    }
});