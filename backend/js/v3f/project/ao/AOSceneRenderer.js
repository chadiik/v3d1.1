if(typeof V3f === 'undefined') V3f = {};

V3f.AOSceneRenderer = function(scene){

    var workers = [];
    function checkWorkersStatus(){
        var allComplete = true;
        workers.forEach( worker => {
            allComplete = allComplete && (worker.bounce === currentBounce);
        });

        if(allComplete){
            currentBounce++;
            workers.forEach( worker => {
                worker.postMessage({
                    resume: true,
                    sceneObjectsData: worker.sceneObjectsData
                });

                worker.sceneObjectsData = [];
            });
        }
    }

    var currentBounce = 1;
    function createMessageHandler(worker){

        worker.bounce = 0;
        worker.sceneObjectsData = [];

        return function(e){
            var data = e.data;
            if (!data) return;

            if(data.bounceComplete){
                worker.bounce++;
                console.log('worker ' + worker.id + ' completed bounce #' + worker.bounce);
                checkWorkersStatus();
            }
            
            worker.sceneObjectsData.push(data);

            var meshID = data.meshID;
            var colors = data.colors;
            var updateRange = data.updateRange;
            
            scene.traverse(function(child){
                if(child instanceof THREE.Mesh){
                    if(child.uuid === meshID){
                        var attributes = child.geometry.attributes;
                        attributes.color.setDynamic(true);
                        var colorsArray = attributes.color.array;
                        var length = colorsArray.length;
                        for(var i = 0; i < length; i++){
                            colorsArray[i] = 1 - colors[i];
                        }
                        attributes.color.updateRange.offset = 0;
                        attributes.color.updateRange.count = length / 3;
                        attributes.color.needsUpdate = true;
                    }
                }
            });
        };
    }

    this.Render = function(objects, numWorkers, size){
        if(window.Worker){
            var sceneJSON = scene.toJSON();

            numWorkers = Math.min(navigator.hardwareConcurrency, numWorkers || 4);
            var objectSlices = V3f.AOSceneRenderer.Slice(objects, numWorkers);

            for(var iWorker = 0; iWorker < objectSlices.length; iWorker++){

                var workerObjects = objectSlices[iWorker];
                console.log(iWorker, workerObjects);

                if(workerObjects.length > 0){

                    var worker = new Worker('js/v3f/project/ao/AOWorker.js');
                    worker.id = iWorker;
                    workers.push(worker);
                    worker.onmessage = createMessageHandler(worker);

                    var canvas = document.createElement('canvas');
                    canvas.width = canvas.height = size;
                    var offscreen = canvas.transferControlToOffscreen();
                    
                    worker.postMessage({
                        canvas: offscreen,
                        workerID: iWorker,
                        scene: sceneJSON,
                        objects: workerObjects,
                        size: size
                    }, [offscreen]);
                }
            }
        }
        else{
            console.warn('Web Workers not supported');
        }
    };
};

Object.assign(V3f.AOSceneRenderer, {

    Slice(objects, numSlices){

        var slices = [];
        var totalVertices = 0;
        var verticesCount = [];
        var numObjects = objects.length;

        var iObject;
        for(iObject = 0; iObject < numObjects; iObject++){
            var object = objects[iObject];
            var objectVertexCount = 0;

            object.traverse(function(child){
                if(child instanceof THREE.Mesh){
                    var geometry = child.geometry;
                    var numVertices = geometry.attributes.position.count;

                    objectVertexCount += numVertices;
                }
            });

            verticesCount[iObject] = objectVertexCount;
            totalVertices += objectVertexCount;
        }

        var verticesPerSlice = Math.ceil(totalVertices / numSlices);
        console.log('verticesPerSlice: ' + verticesPerSlice + ', numSlices: ' + numSlices);

        var sliceVertexCount = verticesPerSlice;
        var sliceIndex = -1;
        var lastObject;
        var startVertex = 0;

        for(iObject = 0; iObject < numObjects; iObject++){

            var objectVertexCount = verticesCount[iObject];
            if(sliceVertexCount >= verticesPerSlice || objectVertexCount > verticesPerSlice) {
                if(sliceIndex > -1) console.log('sliceVertexCount (' + sliceIndex + '): ' + sliceVertexCount);
                
                if(lastObject){
                    var surplus = sliceVertexCount - verticesPerSlice;
                    console.log(surplus);
                    if(surplus > 100){
                        var endVertex = objectVertexCount - surplus;

                        lastObject.endVertex = endVertex;
                        startVertex = endVertex;
                    }
                }

                sliceIndex++;
                slices[sliceIndex] = [];
                sliceVertexCount = 0;
            }

            if(sliceIndex >= numSlices){
                sliceIndex = 0;
            }

            lastObject = {
                uuid: objects[iObject].uuid,
                startVertex: startVertex,
                endVertex: objectVertexCount
            };
            if(startVertex !== 0) iObject--;
            startVertex = 0;
            slices[sliceIndex].push(lastObject);
            sliceVertexCount += objectVertexCount;
        }

        console.log('sliceVertexCount (' + sliceIndex + '): ' + sliceVertexCount);

        return slices;
    }
});