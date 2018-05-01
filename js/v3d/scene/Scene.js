if(typeof V3d === 'undefined') V3d = {};

V3d.Scene = {

};

// Constructor
// Position is a THREE.Vector3 and rotation is a THREE.Euler
V3d.Scene.TRS = function(position, rotation){
    this.position = position !== undefined ? position : new THREE.Vector3();
    this.rotation = rotation !== undefined ? rotation : new THREE.Euler();
};

Object.assign(V3d.Scene.TRS.prototype, {

    FromObject: function(object){
        this.position.copy(object.position);
        this.rotation.copy(object.rotation);
        return this;
    },

    // Deep clone of TRS
    Clone: function(){
        return new V3d.Scene.TRS(this.position.clone(), this.rotation.clone());
    }
});

Object.assign(V3d.Scene.TRS, {
    
    FromJSON: function(data){
        var p = data.position,
            r = data.rotation;
        return new V3d.Scene.TRS(new THREE.Vector3(p.x, p.y, p.z), new THREE.Euler(r.x, r.y, r.z));
    }
});