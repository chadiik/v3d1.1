
importScripts( '../../../../../js/lib/three/three-91.js' );
importScripts( '../../../../js/v3f/project/ao/AORenderer.js' );

var loader = new THREE.ObjectLoader();
var scene, workerID, objectsData, rtSize;

var aoRenderer;

self.onmessage = function( e ) {

	var data = e.data;
    if ( ! data ) return;

    this.console.log('worker', data);
    if(!data.resume){
    
        workerID = data.workerID;
        objectsData = data.objects;
        rtSize = data.size;
        
        var sceneData = data.scene;
        var scene = loader.parse(sceneData);

        var canvas = data.canvas;
        var renderer = new THREE.WebGLRenderer({
            canvas: canvas
        });
        renderer.setPixelRatio(self.devicePixelRatio);
        renderer.setSize(rtSize, rtSize);

        aoRenderer = new V3f.AORenderer(renderer, scene, rtSize);
        aoRenderer.isWebWorker = true;
        aoRenderer.objects = collect(objectsData, scene);
    }
    else{
        aoRenderer.updateSceneObjects(data.sceneObjectsData);
    }

    aoRenderer.compute();
};

function collect(objectsData, scene){
    var objects = [];
    scene.traverse(function(child){
        for(var i = 0; i < objectsData.length; i++){
            var data = objectsData[i];
            var uuid = data.uuid;
            if(child.uuid === uuid){
                child.userData.startVertex = data.startVertex;
                child.userData.endVertex = data.endVertex;
                objects.push(child);
                objectsData.splice(i, 1);
            }
        }
    });

    return objects;
}