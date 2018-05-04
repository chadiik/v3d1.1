
V3f.Smart.Asset = function(object, label){
    if(label === undefined) label = object.name;
    V3f.Smart.call(this, object, label);
    object.smart = this;

    var c = Cik.Config.Controller; //(property, min, max, step, onChange)
    var track = [
        'Revert',
        'ConfigView',
        'Log'
    ];
    this.Config('Asset', this, this.OnGuiChanged.bind(this), ...track);
};

V3f.Smart.Asset.prototype = Object.assign(Object.create(V3f.Smart.prototype), {
    constructor: V3f.Smart.Asset,

    OnGuiChanged: function(){

    },

    Revert: function(){
        if(this.target.config){
            this.target.config.Load();
        }
    },

    ConfigView: function(){
        if(this.target.view !== undefined && this.target.view.smart){
            this.target.view.smart.Show();
        }
    },

    Log: function(){
        var asset = this.target;
        console.log('Cached ************');
        console.log('Asset | {0}:\n\t view: {1},'.format(asset.sov.ToString(), asset.view.uuid), asset.view);
        console.log('\t Materials: ', asset.materials);
        console.log('\t Textures: ', asset.textures);
    },

    Show: function(){

        V3f.Smart.prototype.Show.call(this);
        
        var ui = V3f.MainUI.instance;
        ui.Preview3D(this.target.view);
    }

});