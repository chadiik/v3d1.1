
Object.assign(V3d.Scene.TRS.prototype, {

    toJSON: function(){
        return {
            position: this.position,
            rotation: this.rotation.toVector3()
        };
    }
});