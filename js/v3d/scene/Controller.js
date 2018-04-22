
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
        
    },

    AddDefault: function(object){
        this.defaults.add(object);
    },

    Remove: function(object){
        
    }
});