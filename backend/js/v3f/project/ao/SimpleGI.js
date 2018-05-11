
V3f.Project.AOEditor.SimpleGI = function(renderer, scene){
    var SIZE = 16, SIZE2 = SIZE * SIZE;

    var COLOR_POW = 2;
    var COLOR_MUL = .5;

    var camera = new THREE.PerspectiveCamera( 90, 1, 0.01, 10000 );

    scene.updateMatrixWorld( true );

    var clone = scene.clone();
    clone.autoUpdate = false;

    var rt = new THREE.WebGLRenderTarget( SIZE, SIZE, {
        wrapS: THREE.ClampToEdgeWrapping,
        wrapT: THREE.ClampToEdgeWrapping,
        stencilBuffer: false,
        depthBuffer: true
    } );

    var normalMatrix = new THREE.Matrix3();

    var position = new THREE.Vector3();
    var normal = new THREE.Vector3();

    var bounces = 0;
    var currentVertex = 0;

    var currentChild = 0;
    var currentMesh = 0;

    var color = new Float32Array( 3 );
    var buffer = new Uint8Array( SIZE2 * 4 );

    THREE.Mesh.prototype.clone = function () {

        var newMaterial = ( this.material.isMaterial ) ? this.material.clone() : this.material.slice();

        return new this.constructor( this.geometry.clone(), newMaterial ).copy( this );

    };

    this.compute = function() {

        if ( bounces === 2 ) return;

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
        var totalVertex = positions.length / 3;

        for ( var i = 0; i < 256; i ++ ) {

            if ( currentVertex >= totalVertex ) break;

            position.fromArray( positions, currentVertex * 3 );
            position.applyMatrix4( mesh.matrixWorld );

            normal.fromArray( normals, currentVertex * 3 );
            normal.applyMatrix3( normalMatrix.getNormalMatrix( mesh.matrixWorld ) ).normalize();

            camera.position.copy( position );
            camera.lookAt( position.add( normal ) );

            renderer.render( clone, camera, rt );

            renderer.readRenderTargetPixels( rt, 0, 0, SIZE, SIZE, buffer );

            color[ 0 ] = 0;
            color[ 1 ] = 0;
            color[ 2 ] = 0;

            for ( var k = 0, kl = buffer.length; k < kl; k += 4 ) {

                color[ 0 ] += buffer[ k + 0 ];
                color[ 1 ] += buffer[ k + 1 ];
                color[ 2 ] += buffer[ k + 2 ];

            }

            colors[ currentVertex * 3 + 0 ] += Math.pow(color[ 0 ] / ( SIZE2 * 255 ), COLOR_POW) * COLOR_MUL;
            colors[ currentVertex * 3 + 1 ] += Math.pow(color[ 1 ] / ( SIZE2 * 255 ), COLOR_POW) * COLOR_MUL;
            colors[ currentVertex * 3 + 2 ] += Math.pow(color[ 2 ] / ( SIZE2 * 255 ), COLOR_POW) * COLOR_MUL;

            currentVertex ++;

        }

        attributes.color.updateRange.offset = startVertex * 3;
        attributes.color.updateRange.count = ( currentVertex - startVertex ) * 3;
        attributes.color.needsUpdate = true;

        if ( currentVertex >= totalVertex ) {

            attributes.color.updateRange.offset = 0;
            attributes.color.updateRange.count = totalVertex * 3;
            attributes.color.needsUpdate = true;

            currentVertex = 0;
            currentMesh++;

            var numMeshes = object instanceof THREE.Mesh ? 1 : object.children.length;
            if(currentMesh >= numMeshes) {
                console.log(mesh.name);
                currentMesh = 0;

                currentChild++;

                var numChildren = this.objects.length;
                if(currentChild >= numChildren){

                    clone = scene.clone();
                    clone.autoUpdate = false;

                    currentChild = 0;
                    bounces++;
                }
            }
        }

        requestAnimationFrame( this.compute );

    }.bind(this);
};

/*Object.assign(V3f.Project.AOEditor.SimpleGI.prototype, {

});*/