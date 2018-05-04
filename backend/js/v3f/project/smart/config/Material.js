
V3f.Smart.MaterialConfig = function(material, mesh){
    this.material = material;
    this.mesh = mesh;

    this.sides = {front: THREE.FrontSide, back: THREE.BackSide, double: THREE.DoubleSide};

    var c = Cik.Config.Controller;
    this.keys = ['SelectByMaterial', 'material.visible', new c('material.side', this.sides)];
};

Object.assign(V3f.Smart.MaterialConfig.prototype, {

    OnGuiChanged: function(){
        this.material.side = Number(this.material.side);
        this.material.needsUpdate = true;
    },

    Edit: function(gui, label){
        this.config = new Cik.Config(this);
        this.material.materialConfig = this;
        this.config.Track(...this.keys);
        this.config.Edit(this.OnGuiChanged.bind(this), label, gui, {
            save: false, debug: true
        });
    },

    Enter: function(){
        this.material.needsUpdate = true;
    },

    Exit: function(){
        this.material.needsUpdate = true;
    },

    SelectByMaterial: function(){
        var scene = V3d.Loop.GetActiveScene();
        var uuid = this.material.uuid;
        var meshUUID = this.mesh !== undefined ? this.mesh.uuid : 0;
        var thisIndex = -1;
        var usage = [];
        scene.traverse(function(child){
            if(child instanceof THREE.Mesh){
                if(uuid === child.material.uuid){
                    usage.push(child.smart);
                }
                if(meshUUID === child.uuid) thisIndex = usage.length - 1;
            }
        });

        var nextIndex = Cik.Utils.LoopIndex(thisIndex + 1, usage.length);
        var smart = usage[nextIndex];
        smart.Show();
    }
});