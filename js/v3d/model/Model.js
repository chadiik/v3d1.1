
V3d.Model = function(){

    this.layouts = [];
    this.current = -1;
};

Object.defineProperties(V3d.Model.prototype, {
    activeLayout: {
        get: function(){
            return this.layouts[this.current];
        }
    }
});

Object.assign(V3d.Model.prototype, {

    AddLayout: function(layout){
        if(layout === undefined) layout = new V3d.Model.Layout();
        this.layouts.push(layout);
        if(this.current === -1) this.current = this.layouts.length - 1;
    },

    SwitchLayout: function(id){
        if(typeof id === 'string'){
            if(id === 'last'){
                id = this.layouts.length - 1;
            }
        }

        this.current = id;
    }
});

Object.assign(V3d.Model, {

    FromJSON: function(data){
        var model = new V3d.Model();

        var layoutsData = data.layouts;
        layoutsData.forEach(layoutData => {
            var layout = V3d.Model.Layout.FromJSON(layoutData);
            model.AddLayout(layout);
        });

        model.SwitchLayout(data.current);

        return model;
    }
});