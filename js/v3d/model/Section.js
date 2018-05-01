
V3d.Model.Section = function(sov){

    this.sov = sov;
    this._view;
    this._transform;
};

Object.defineProperties(V3d.Model.Section.prototype, {

    sov: {
        set: function(value){
            if(this._sov === undefined || this._sov.ToString() !== value.ToString()){
                this._sov = value;
                if(this.view === undefined){
                    this.view = V3d.Library.RequestView(this._sov);
                }
            }
        },

        get: function(){
            return this._sov;
        }
    },

    transform: {
        set: function(value){
            this._transform = value;
            if(this._view !== undefined){
                this.ApplyTransform();
            }
        }
    },

    view: {
        set: function(value){
            this._view = value;
            if(this._transform !== undefined){
                this.ApplyTransform();
            }
        },

        get: function(){
            return this._view;
        }
    }
});

Object.assign(V3d.Model.Section.prototype, {
    
    ApplyTransform: function(){
        this._view.position.copy(this._transform.position);
        this._view.rotation.copy(this._transform.rotation);
    }
});

Object.assign(V3d.Model.Section, {

    FromJSON: function(data){
        var sov = V3d.SOV.FromJSON(data.sov);
        var transform = V3d.Scene.TRS.FromJSON(data.transform);

        var section = new V3d.Model.Section(sov);
        section.transform = transform;

        return section;
    }
});