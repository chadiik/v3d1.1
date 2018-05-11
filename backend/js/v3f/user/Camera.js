
Object.assign(V3d.Camera.prototype, {

    vec3: new THREE.Vector3(),

    SpawnPositionAhead: function(){
        var distance = 90;

        this.camera.getWorldDirection(this.vec3);
        var position = new THREE.Vector3();
        this.camera.getWorldPosition(position);
        return position.add(this.vec3.multiplyScalar(distance));
    }

});