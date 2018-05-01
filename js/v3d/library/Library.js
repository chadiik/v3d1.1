
V3d.Library = function(){
    V3d.Library.instances.push(this);

    this.items = {};
};

Object.assign(V3d.Library.prototype, {

    Add: function(sov, object){
        var asset = new V3d.Library.Asset(sov, object);
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
        var view = item.asset.view;
        return view;
    }
});

Object.assign(V3d.Library, {

    instances: [],

    loader: new THREE.ObjectLoader(),
    
    FromJSON: function(data){
        var library = new V3d.Library();
        data.items.forEach(itemData => {
            var sov = V3d.SOV.FromJSON(itemData.sov);
            var view = V3d.Library.Asset.ViewFromJSON(itemData.asset.view);

            var item = library.Add(sov, view);
        });
        return library;
    },

    RequestView: function(sov){

        for(var i = 0; i < this.instances.length; i++){
            var view = this.instances[i].RequestView(sov);
            if(view) return view;
        };
        return undefined;
    }
    
});