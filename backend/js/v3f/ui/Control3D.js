if(typeof V3f === 'undefined') V3f = {};

V3f.Control3D = function(camera, domElement){
    this.camera = camera;
    this.control = new THREE.TransformControls(this.camera, domElement);
    this.control.addEventListener('change', this.Update.bind(this));

    this.control.traverse(function(child){
        child.renderOrder = 2;
    })
};

Object.assign(V3f.Control3D.prototype, {

    Attach: function(target){
        var camera = V3d.Loop.GetActiveCamera();
        if(camera !== this.camera){
            this.control.camera = camera;
            this.camera = camera;
        }
        
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
        var camera = V3d.Loop.GetActiveCamera(), domElement = V3d.Loop.GetActiveSceneRenderer().renderer.domElement;
        
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