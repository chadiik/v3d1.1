
V3f.Smart.MaterialConfig = function(material){
    this.material = material;

    this.sides = {front: THREE.FrontSide, back: THREE.BackSide, double: THREE.DoubleSide};

    var c = Cik.Config.Controller;
    this.keys = ['material.visible', new c('material.side', this.sides)];
};

Object.assign(V3f.Smart.MaterialConfig.prototype, {

    OnGuiChanged: function(){
        this.material.side = Number(this.material.side);
    },

    Edit: function(gui, label){
        this.config = new Cik.Config(this);
        this.config.Track(...this.keys);
        this.config.Edit(this.OnGuiChanged.bind(this), label, gui, {
            save: false, debug: true
        });
    }
});