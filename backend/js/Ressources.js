
// require Cik.Config

V3d.Ressources = {
    
    cache: {},

    Config: function(filename){
        return V3d.Ressources.config + filename;
    },

    Temp: function(subFolder){
        return V3d.Ressources.temp + (subFolder !== undefined ? subFolder + '/' : '/');
    },

    ClearTemp: function(){
        Cik.IO.Clear(V3d.Ressources.temp);
    },

    LoadJSON: function(url, onLoad){
        var id = App.Loader.LoadScript(url, function(success){
            if(onLoad !== undefined){
                var content = document.getElementById(id).textContent;
                if(success && content !== undefined) onLoad(JSON.parse(content));
                else onLoad(false);
            }
        });
    }
};

Object.defineProperty(V3d.Ressources, 'config', {
    get: function(){
        return location.href.indexOf('backend') != -1 ? 'ressources/config/' : 'backend/ressources/config/';
    }
});

Object.defineProperty(V3d.Ressources, 'temp', {
    get: function(){
        return 'temp/';
    }
});

// extend Cik.Config

// Cik.Config.TrackLoadEdit(label, target, guiChanged, ...keys)
Cik.Config.TrackLoadEdit = function(label, target, guiChanged, ...args){
    var config = new Cik.Config(target);
    config.Track(...args);
    var gui = config.Edit(guiChanged, label, label);
    V3d.Ressources.LoadJSON(V3d.Ressources.Config(label + (label.indexOf('.json') === -1 ? '.json' : '')), function(result){
        if(result !== false) Cik.Config.Load(target, result);
        for (var i in gui.__controllers) {
            gui.__controllers[i].updateDisplay();
        }
        guiChanged();
    });
};