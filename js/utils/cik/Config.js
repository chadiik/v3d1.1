if(typeof Cik === 'undefined') Cik = {};

// require Cik.IO
Cik.Config = function(target){
    this.target = target;
    this.keys = [];
};

Object.assign(Cik.Config.prototype, {

    Track: function(...args){
        var keys = this.keys;
        args.forEach(key => {
            keys.push(key);
        });
        console.log('tracking', keys);
    },

    Save: function(){
        var data = {};
        var obj = this.target;
        this.keys.forEach(key => {
            data[key] = Cik.Config.getKey(obj, key);
        });
        this.data = data;
    },

    Edit: function(guiChanged, label, gui, params){

        params = Cik.Utils.AssignUndefined(params, {
            save: true, debug: true
        });

        var controllers = [];
        var target = this.target;
        if(gui === undefined) {
            gui = new dat.GUI({
                autoPlace: true
            });
        }
        else if(typeof gui === 'string'){
            if(Cik.Config.mainGui === undefined) Cik.Config.mainGui = new dat.GUI({autoPlace: false});
            gui = Cik.Config.mainGui.addFolder(gui);
            //Cik.Config.mainGui.close();
        }

        this.keys.forEach(key => {
            controllers.push(
                gui.add(
                    Cik.Config.getOwner(target, key), key
                ).onChange(guiChanged)
            );
        });

        var scope = this;
        var editor = {
            Save: function(){
                scope.Save();
                var filename = label !== undefined ? (label + (label.indexOf('.json') === -1 ? '.json' : '')) : 'config.json';
                Cik.IO.JSON(scope.data, filename);
            },

            Debug: function(){
                console.log(scope);
            }
        }
        if(params.save) gui.add(editor, 'Save');
        if(params.debug) gui.add(editor, 'Debug');

        return gui;
    },

    Bundle: function(){
        if(Cik.Config.bundle.indexOf(this) === -1) Cik.Config.bundle.push(this);
    },

    toJSON: function(){
        if(this.data === undefined) console.warn(this.target, 'is being saved with undefined data.');
        return this.data;
    }
});

Object.assign(Cik.Config, {

    bundle: [],

    SerializeMultiple: function(labelConfigPairs){
        var data = {multiple: true};
        var labels = Object.keys(labelConfigPairs);
        labels.forEach(label => {
            data[label] = labelConfigPairs[label];
        });
        return data;
    },

    LoadMultiple: function(data, labelTargetPairs){
        var labels = Object.keys(labelTargetPairs);
        labels.forEach(label => {
            Cik.Config.Load(
                labelTargetPairs[label],
                data[label]
            );
        });
    },

    Load: function(target, data){
        var keys = Object.keys(data);
        keys.forEach(key => {
            Cik.Config.setKey(target, key, data[key]);
        });
    },

    getOwner: function(obj, key){
        key = key.split('.');
        while (key.length > 1) obj = obj[key.shift()];
        return obj;
    },

    getKey: function(obj, key){
        return key.split('.').reduce(function(a, b){
            return a && a[b];
        }, obj);
    },

    setKey: function(obj, key, val){
        key = key.split('.');
        while (key.length > 1) obj = obj[key.shift()];
        return obj[key.shift()] = val;
    }
});