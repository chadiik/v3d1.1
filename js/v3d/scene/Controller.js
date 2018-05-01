
V3d.Scene.Controller = function(params){

    this.params = params;

    // Containers
    this.itemsContainer = new THREE.Object3D();
    this.itemsContainer.name = "itemsContainer";
    this.miscContainer = new THREE.Object3D();
    this.miscContainer.name = "miscContainer";
    this.ambientContainer = new THREE.Object3D();
    this.ambientContainer.name = "ambientContainer";
    this.defaults = new THREE.Object3D();
    this.defaults.name = "defaults";

    // Scene
    this.scene = new THREE.Scene();

    // Setup rest
    this.scene.add(this.itemsContainer);
    this.scene.add(this.miscContainer);
    this.scene.add(this.ambientContainer);
    this.scene.add(this.defaults);
};

Object.assign(V3d.Scene.Controller.prototype, {
    Add: function(object){
        if(object instanceof V3d.Scene.Item){
            this.itemsContainer.add(object.view);
        }
        else if(object instanceof V3d.Library.Light){
            this.ambientContainer.add(object.lightObject);
        }
        else {
            this.miscContainer.add(object);
        }
    },

    AddDefault: function(object){
        this.defaults.add(object);
    },

    Remove: function(object){
        if(typeof object === 'string'){
            var objName = object;
            object = this.itemsContainer.getObjectByName(objName);
            if(object === undefined) object = this.miscContainer.getObjectByName(objName);
            if(object === undefined) return;
        }
        this.itemsContainer.remove(object);
        this.miscContainer.remove(object);
    }
});