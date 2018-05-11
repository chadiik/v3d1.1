if(typeof V3f === 'undefined') V3f = {};

V3f.ObjectHelper = function(type, size){

    this.view = new THREE.Object3D();

    var geometry;
    switch(type){
        case 'box':
        case 'cube':
        geometry = new THREE.BoxBufferGeometry(size, size, size);
        break;

        case 'sphere':
        geometry = new THREE.SphereBufferGeometry(size, 16, 16);
        break;
    }

    this.material = new THREE.MeshBasicMaterial({
        color: 0x00ffff,
        wireframe: true,
    });

    this.mesh = new THREE.Mesh(geometry, this.material);

    this.view.add(this.mesh);

    V3f.ObjectHelper.Add(this);

    this.onChange = [];
    this.onFocus = [];

    this.object;
};

Object.assign(V3f.ObjectHelper.prototype, {

    Hide: function(){
        this.view.visible = false;
    },

    Show: function(){
        this.view.visible = true;
    },

    Attach: function(object){
        this.object = object;

        this.view.position.copy(object.position);
        this.view.quaternion.copy(object.quaternion);
    },

    OnChange: function(){
        if(this.object !== undefined){
            this.object.position.copy(this.view.position);
            this.object.quaternion.copy(this.view.quaternion);
        }

        for(var i = 0; i < this.onChange.length; i++){
            this.onChange[i]();
        }
    },

    Focus: function(){
        for(var i = 0; i < this.onFocus.length; i++){
            this.onFocus[i]();
        }
    },

    Defocus: function(){
        V3f.ObjectHelper.Focus(undefined);
    }
});

Object.defineProperties(V3f.ObjectHelper.prototype, {

    position: {
        get: function(){
            return this.view.position;
        }
    },

    rotation: {
        get: function(){
            return this.view.rotation;
        }
    },

    quaternion: {
        get: function(){
            return this.view.quaternion;
        }
    }
});

Object.assign(V3f.ObjectHelper, {

    objects: [],

    Init: function(){
        if(this.initiated) return;
        this.initiated = true;

        var objects = this.objects;
        this.controlGroup = new V3f.ControlGroup();
        this.controlGroup.control.addEventListener('change', function(){
            for(var i = 0; i < objects.length; i++) objects[i].OnChange.call(objects[i]);
        });

        this.raycastGroup = new Cik.Input.RaycastGroup(
            [], //items
            function(objectHelper){ //callback
                V3f.ObjectHelper.Focus(objectHelper);
            },
            
            function(objectHelper){ //collectionQuery
                return objectHelper.view;
            },
            
            false, //updateProperty
            true, //recursive
            false //continuous
        );

        Cik.Input.AddRaycastGroup('OnClick', '0.ObjectHelpers', this.raycastGroup);
    },

    Add: function(objectHelper){
        this.Init();

        this.raycastGroup.items.push(objectHelper);
        this.raycastGroup.UpdateItems(this.raycastGroup.items);

        this.objects.push(objectHelper);
    },

    Focus: function(objectHelper){

        if(objectHelper === undefined){
            this.controlGroup.Detach();
            return;
        }

        this.controlGroup.Attach(objectHelper.view);
        objectHelper.Focus();
    }

});