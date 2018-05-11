if(typeof Cik === 'undefined') Cik = {};

Cik.Utils3D = {

    FrameCamera: function(camera, object, distanceMultiplier){
        if(distanceMultiplier === undefined) distanceMultiplier = .75;

        var fov = camera.fov * (Math.PI / 180);
        var box3 = new THREE.Box3().setFromObject(object);
        var bbSize = new THREE.Vector3();
        box3.getSize(bbSize);
        var frameSize = Math.max(bbSize.x, bbSize.y, bbSize.z);
        var distance = Math.abs(frameSize / Math.sin(fov / 2)) * distanceMultiplier;

        var frameCenter = new THREE.Vector3();
        box3.getCenter(frameCenter);
        var position = new THREE.Vector3().subVectors(camera.position, frameCenter).normalize().multiplyScalar(distance).add(frameCenter);

        return {
            position: position,
            target: frameCenter
        };
    },

    Traverse: function(object3d, callback, level){
        if(level === undefined) level = 0;
        callback(object3d, level);
        var children = object3d.children;
        for(var i = 0, l = children.length; i < l; i ++) {
            this.Traverse(children[i], callback, level + 1);
        }
    }
    
};
