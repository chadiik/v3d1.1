
V3f.Smart.Asset = function(object, label){
    if(label === undefined) label = object.name;
    V3f.Smart.call(this, object, label);
    object.smart = this;

    var c = Cik.Config.Controller; //(property, min, max, step, onChange)
    var track = [
        'ToggleChanges',
        'ConfigView',
        'Log'
    ];
    var folder = this.Config('Asset', this, this.OnGuiChanged.bind(this), ...track);
    folder.open();

    this.toggleOriginal = true;
};

V3f.Smart.Asset.prototype = Object.assign(Object.create(V3f.Smart.prototype), {
    constructor: V3f.Smart.Asset,

    OnGuiChanged: function(){

    },

    ToggleChanges: function(){
        if(this.target.config){
            if(this.toggleOriginal){
                this.target.config.Save('1');
            }
            this.target.config.Load(this.toggleOriginal ? '0' : '1');

            this.toggleOriginal = !this.toggleOriginal;
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