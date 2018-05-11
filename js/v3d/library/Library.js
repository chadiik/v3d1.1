
V3d.Library = function(){
    V3d.Library.instance = this;

    this.items = {};
};

Object.assign(V3d.Library.prototype, {

    Add: function(sov, object){

        V3d.SOV.Records.Register(sov);

        var asset = object instanceof V3d.Library.Asset ? object : new V3d.Library.Asset(sov, object);
        var item = new V3d.Library.Item(sov, asset);

        var id = asset.sov.ToString();
        if(this.items[id] !== undefined)
            console.log('Asset ' + id + ' is being overriten by', asset);
        
        this.items[id] = item;

        return item;
    },

    Request: function(sov){
        if(sov instanceof V3d.SOV)
            sov = sov.ToString();
        
        var item = this.items[sov];
        return item;
    },

    RequestView: function(sov){
        var item = this.Request(sov);
        if(item === undefined){
            console.warn('Failed to get library item', sov.ToString())
        }
        var view = item.asset.view;
        return view;
    }
});

Object.defineProperties(V3d.Library, {

    instance: {
        set: function(value){
            this._currentInstance = value;
            this.instances.push(value);
        },

        get: function(){
            return this._currentInstance;
        }
    }
});

Object.assign(V3d.Library, {

    instances: [],

    canvas: {},

    context2d: {},

    CreateCanvas: function(size){
        var value = size.toString();

        if(this.canvas[value] === undefined){
            this.canvas[value] = document.createElement('canvas');
            this.canvas[value].width = size;
            this.canvas[value].height = size;

            this.context2d[value] = this.canvas[value].getContext('2d');
        }

        return this.canvas[value];
    },

    loader: new THREE.ObjectLoader(),
    
    FromJSON: function(data){
        var library = new V3d.Library();
        data.items.forEach(itemData => {
            var asset = V3d.Library.Asset.FromJSON(itemData.asset);
            var sov = asset.sov;
            var item = library.Add(sov, asset);
        });
        return library;
    },

    RequestView: function(sov){

        for(var i = 0; i < this.instances.length; i++){
            var view = this.instances[i].RequestView(sov);
            if(view) return view;
        };
        return undefined;
    },

    IterateItems: function(callback){
        for(var i = 0; i < this.instances.length; i++){
            var items = this.instances[i].items;
            for(var itemKey in items){
                var item = items[itemKey];
                callback(item);
            };
        };
    }
    
});