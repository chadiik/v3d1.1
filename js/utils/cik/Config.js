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
    },

    Save: function(){
        var data = {};
        var obj = this.target;
        this.keys.forEach(key => {
            if(key instanceof Cik.Config.Controller) key = key.property;
            data[key] = Cik.Config.getKey(obj,  key);
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
        }
        else {
            gui = gui.addFolder(label);
        }

        this.keys.forEach(key => {
            var keyInfo;
            if(key instanceof Cik.Config.Controller){
                keyInfo = Cik.Config.KeyInfo(target, key.property);
                controllers.push(
                    gui.add(
                        keyInfo.owner, keyInfo.key, key.min, key.max, key.step
                    ).onChange(guiChanged)
                );
            }
            else {
                keyInfo = Cik.Config.KeyInfo(target, key);
                controllers.push(
                    gui.add(
                        keyInfo.owner, keyInfo.key
                    ).onChange(guiChanged)
                );
            }
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

    Bundle: function(id){
        if(id === undefined) id = 'default';
        if(Cik.Config.bundles[id] === undefined) Cik.Config.bundles[id] = [];

        var bundle = Cik.Config.bundles[id];
        if(bundle.indexOf(this) === -1) bundle.push(this);
    },

    toJSON: function(){
        if(this.data === undefined) console.warn(this.target, 'is being saved with undefined data.');
        return this.data;
    }
});

Object.assign(Cik.Config, {

    bundles: {},

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

    KeyInfo: function(obj, key){
        key = key.split('.');
        while (key.length > 1) obj = obj[key.shift()];
        return {
            owner: obj,
            key: key[0]
        };
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

Cik.Config.Controller = function(property, min, max, step){
    this.property = property;
    this.min = min;
    this.max = max;
    this.step = step;
};