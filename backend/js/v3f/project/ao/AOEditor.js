
V3f.Project.AOEditor = function(model){

    this.model = model;

    this.InitSceneController();

    var geometry = new THREE.SphereBufferGeometry( 800, 32, 32 );
    geometry.index.array.reverse();
    geometry.index.needsUpdate = true;
    var material = new THREE.MeshBasicMaterial( {color: 0x050505} );
    var sphere = new THREE.Mesh( geometry, material );

    this.sceneController.Add(sphere);

    this.modelScene = new V3d.Model.Scene(this.model, this.sceneController.itemsContainer);
    this.aoViews = {};
    //this.tessellateModifier = new THREE.TessellateModifier(6);
    this.tessellateModifier = new THREE.TessellateModifier(16);
    this.subdivideModifier = new THREE.SubdivisionModifier(1);

    this.aoSceneRenderer = new V3f.AOSceneRenderer(this.sceneController.scene);
};

Object.assign(V3f.Project.AOEditor.prototype, {

    InitSceneController: function(){
        var container = document.getElementById('viewerGL');

        var units = 1;
        var controllerParams = {units: units};
        var sceneController = new V3d.Scene.Controller(controllerParams);
        this.sceneController = sceneController;

        var cameraParams = {fov: 65, aspect: 1, near: 1 * units, far: 10000 * units, id: 'AOEditor'};
        var cameraController = new V3d.User.Camera(cameraParams);
        var fpsParams = {speedX: .0021, speedY: .0021, damping: .2, momentum: .9, limitPhi: 87 * Math.PI / 180};
        //cameraController.FirstPersonControls(container, fpsParams);
        cameraController.OrbitControls(container);
        this.cameraController = cameraController;

        var setupParams = {input: false, stats: false, sky: false, config: false, fillLights: false};
        V3d.Scene.DefaultSetup(container, sceneController, undefined, cameraController, setupParams);
    },

    ToggleAOEditor: function(){
        var scope = this;
        var loop = V3d.Loop.instances['main'];
        if(loop.activeState.label !== 'AOEditor'){  
            loop.Switch('AOEditor', this.sceneController, undefined, this.cameraController, {updateInput: true, updateStats: true});
            scope.SwitchIn();
        }
        else{
            loop.Exit();
            scope.SwitchOut();
        }
    },

    SwitchIn: function(){
        this.UseAlternateViews();
        this.Update();
    },

    UseAlternateViews: function(){
        var scope = this;
        V3d.Library.IterateItems(function(libItem){
            var asset = libItem.asset;
            asset.UseAlternateView('ao', scope.GetAlternateView(asset));
        });
    },

    GetAlternateView: function(asset){
        var aoMaterial = V3f.Project.AOEditor.aoMaterial;
        var tessellateModifier = this.tessellateModifier;
        var subdivideModifier = this.subdivideModifier;
        var sovStr = asset.sov.ToString();
        if(this.aoViews[sovStr] === undefined){
            var aoView = new THREE.Object3D();
            aoView.name = asset.view.name;
            var aoMeshes = [];
            asset.view.traverse(function(child){
                if(child instanceof THREE.Mesh){
                    var aoGeom = child.geometry;
                    var aoGeom = new THREE.Geometry().fromBufferGeometry(aoGeom);

                    aoGeom.mergeVertices();
                    V3f.Project.AOEditor.AssertFaceUV( aoGeom );
                    for ( var i = 0; i < 16; i ++ ) tessellateModifier.modify( aoGeom );
                    
                    /*aoGeom.mergeVertices();
                    subdivideModifier.modify( aoGeom );*/

                    aoGeom = new THREE.BufferGeometry().fromGeometry( aoGeom );
                    V3f.Project.AOEditor.BlackVC(aoGeom);
                    var aoMesh = new THREE.Mesh(aoGeom, aoMaterial.clone());
                    aoMesh.name = child.name;
                    aoMeshes.push(aoMesh);
                    aoView.add(aoMesh);
                }
            });

            V3f.Auto.MakeSmart(aoMeshes, 'AOEditor');
            this.aoViews[sovStr] = aoView;
        }

        return this.aoViews[sovStr];
    },

    SwitchOut: function(){
        V3d.Library.Asset.UseAlternateView(false);
        this.RefreshSections();
    },

    RefreshSections: function(){
        var sections = this.model.activeLayout.sections;
        sections.forEach(section => {
            section.Refresh();
        });
    },

    Update: function(){
        this.RefreshSections();
        this.modelScene.Update();

        var objects = this.sceneController.itemsContainer.children;
        //objects = objects.slice(0, objects.length / 2);
        var threads = 8;
        var rtSize = 32;
        this.aoSceneRenderer.Render(objects, threads, rtSize);
    }
});

Object.assign(V3f.Project.AOEditor, {

    aoMaterial: (function(){
        var debugMaterial = new THREE.MeshLambertMaterial({
            color: 0xffffff
        });
        var material = new THREE.MeshBasicMaterial({
            vertexColors: THREE.VertexColors
            //,wireframe: true
        });
        return material;
    })(),

    BlackVC: function(geometry){
        var attributes = geometry.attributes;
        if ( attributes.color === undefined ) {
            var colors = new Float32Array( positions.length );
            geometry.addAttribute( 'color', new THREE.BufferAttribute( colors, 3 ).setDynamic( true ) );
        }
        else {
            var colors = attributes.color.array;
            for(var i = 0, len = colors.length; i < len; i++){
                colors[i] = 0;
            }
            attributes.color.needsUpdate = true;
        }
    },

    AssertFaceUV: function(geometry){
        var v0 = new THREE.Vector2();
        for ( var i = 0, il = geometry.faces.length; i < il; i ++ ) {
            for ( var j = 0, jl = geometry.faceVertexUvs.length; j < jl; j ++ ) {
                var uvs = geometry.faceVertexUvs[ j ][ i ];
                if(uvs === undefined){
                    geometry.faceVertexUvs[ j ][ i ] = [v0, v0, v0];
                }
            }
        }
    }
});