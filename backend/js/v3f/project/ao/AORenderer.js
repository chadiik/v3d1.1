if(typeof V3f === 'undefined') V3f = {};

V3f.AORenderer = function(renderer, scene, size){

    this.scene;

    var sizeSq = size * size,
	    COLOR_POW = 2,
	    COLOR_MUL = .5;

    var camera = new THREE.PerspectiveCamera( 90, 1, 0.01, 100 );

    scene.updateMatrixWorld( true );

	var clone = V3f.AORenderer.SceneClone(scene);
	clone.autoUpdate = false;

	var rt = new THREE.WebGLRenderTarget( size, size, {
		wrapS: THREE.ClampToEdgeWrapping,
		wrapT: THREE.ClampToEdgeWrapping,
		stencilBuffer: false,
		depthBuffer: true
	} );

	var normalMatrix = new THREE.Matrix3();

	var position = new THREE.Vector3();
	var normal = new THREE.Vector3();

    var currentVertex = 0;

    var currentChild = 0;
    var currentMesh = 0;

	var color = new Float32Array( 3 );
    var buffer = new Uint8Array( sizeSq * 4 );
    
    this.compute = function() {

        var object = this.objects[ currentChild ];
        var mesh = object instanceof THREE.Mesh ? object : object.children[ currentMesh ];
        var geometry = mesh.geometry;

        var attributes = geometry.attributes;
        var positions = attributes.position.array;
        var normals = attributes.normal.array;

        if ( attributes.color === undefined ) {

            var colors = new Float32Array( positions.length );
            geometry.addAttribute( 'color', new THREE.BufferAttribute( colors, 3 ).setDynamic( true ) );

        }

        var colors = attributes.color.array;

        var startVertex = currentVertex;
        var totalVertex = mesh.userData.endVertex || positions.length / 3;

        for ( var i = 0; i < 256; i ++ ) {

            if ( currentVertex >= totalVertex ) break;

            position.fromArray( positions, currentVertex * 3 );
            position.applyMatrix4( mesh.matrixWorld );

            normal.fromArray( normals, currentVertex * 3 );
            normal.applyMatrix3( normalMatrix.getNormalMatrix( mesh.matrixWorld ) ).normalize();

            camera.position.copy( position );
            camera.lookAt( position.add( normal ) );

            renderer.render( clone, camera, rt );

            renderer.readRenderTargetPixels( rt, 0, 0, size, size, buffer );

            color[ 0 ] = 0;
            color[ 1 ] = 0;
            color[ 2 ] = 0;

            for ( var k = 0, kl = buffer.length; k < kl; k += 4 ) {

                color[ 0 ] += buffer[ k + 0 ];
                color[ 1 ] += buffer[ k + 1 ];
                color[ 2 ] += buffer[ k + 2 ];

            }

            colors[ currentVertex * 3 + 0 ] += Math.pow(color[ 0 ] / ( sizeSq * 255 ), COLOR_POW) * COLOR_MUL;
            colors[ currentVertex * 3 + 1 ] += Math.pow(color[ 1 ] / ( sizeSq * 255 ), COLOR_POW) * COLOR_MUL;
            colors[ currentVertex * 3 + 2 ] += Math.pow(color[ 2 ] / ( sizeSq * 255 ), COLOR_POW) * COLOR_MUL;

            currentVertex ++;

        }

        attributes.color.updateRange.offset = startVertex * 3;
        attributes.color.updateRange.count = ( currentVertex - startVertex ) * 3;
        attributes.color.needsUpdate = true;

        if ( currentVertex >= totalVertex ) {

            var updateRange = totalVertex * 3;

            attributes.color.updateRange.offset = 0;
            attributes.color.updateRange.count = updateRange;
            attributes.color.needsUpdate = true;

            if(this.isWebWorker){
                self.postMessage({
                    meshID: mesh.uuid,
                    colors: colors,
                    updateRange: updateRange
                });
            }

            //currentVertex = 0; below
            currentMesh++;

            var numMeshes = object instanceof THREE.Mesh ? 1 : object.children.length;
            if(currentMesh >= numMeshes) {
                currentMesh = 0;

                currentChild++;

                var numChildren = this.objects.length;
                if(currentChild >= numChildren){

                    clone = V3f.AORenderer.SceneClone(scene);
                    clone.autoUpdate = false;

                    currentChild = 0;
                    if(this.isWebWorker){
                        self.postMessage({
                            bounceComplete: true
                        });
                        return;
                    }
                }
            }

            var object = this.objects[ currentChild ];
            var mesh = object instanceof THREE.Mesh ? object : object.children[ currentMesh ];
            currentVertex = mesh.userData.startVertex || 0;
        }

        setTimeout( this.compute, 10 );

    }.bind(this);

    this.updateSceneObjects = function(newObjectsData){
        clone.traverse(function(child){
            for(var i = 0; i < newObjectsData.length; i++){
                var nod = newObjectsData[i];
                if(child.userData.uuid === nod.meshID){
                    
                    newObjectsData.splice(i, 1);

                    var attributes = child.geometry.attributes;
                    attributes.color.setDynamic(true);
                    var colorsArray = attributes.color.array;
                    for(var i = 0, il = colorsArray.length; i < il; i++){
                        colorsArray[i] = nod.colors[i];
                    }
                    attributes.color.updateRange.offset = 0;
                    attributes.color.updateRange.count = nod.updateRange;
                    attributes.color.needsUpdate = true;
                }
            }
        });
    };
};

Object.assign(V3f.AORenderer, {
    
    SceneClone: function(scene){
        scene.traverse(function(child){
            if(child.userData.uuid === undefined){
                child.userData.uuid = child.uuid;
            }
        });

        var clone = scene.clone();
        clone.traverse(function(child){
            if(child instanceof THREE.Mesh){
                child.geometry = child.geometry.clone();
                child.material = ( child.material.isMaterial ) ? child.material.clone() : child.material.slice();
            }
        });
        return clone;
    }
});