
V3f.Project.Imported = function(scene){
    console.log(scene);
    this.scene = scene;

    this.log = {
        optimization: {
            originalCallsNum: 0,
            newCallsNum: 0
        }
    };

    this.parse = {
        sequence: []
    };

    this.items;
};

Object.assign(V3f.Project.Imported.prototype, {

    Parse: function(onCompleted){

        var parse = this.parse;
        
        var scope = this;
        parse.sequence.push(
            function(){
                scope.Collect();
            },

            function(){
                scope.Optimize();
            },

            function(){
                scope.Convert();
            },

            function(){
                scope.Rename();
            },

            function(){
                onCompleted(scope.items);
            }
        );

        this.Execute();
    },

    Execute: function(){
        var functions = this.parse.sequence;
        for(var i = 0; i < functions.length; i++){
            var fn = functions[i];
            fn();
        }
    },

    SmartDisplay: function(){
        var objects = [];
        this.items.forEach(function(item){
            objects.push(item.obj);
        });
        
        V3d.Auto.SmartDisplay(objects);
    },

    Collect: function(){
        console.log('Collect');
        this.items = V3f.Project.Imported.Collect(this.scene);
    },

    Optimize: function(){
        console.log('Optimize');
        V3f.Project.Imported.Optimize(...this.items);

        this.items.forEach(item => {
            this.log.optimization.originalCallsNum += item.creationLog.originalCallsNum;
            this.log.optimization.newCallsNum += item.creationLog.newCallsNum;
        });

        console.log(this.log.optimization);
    },

    Convert: function(){
        console.log('Convert');
        this.items.forEach(item => {
            var obj = item.obj;
            V3f.Project.Imported.Convert(obj);
        });
    },

    Rename: function(){
        console.log('Rename');
        this.items.forEach(item => {
            var sovStr = item.sov.ToString();
            var obj = item.obj;

            // add extra identifier by sorted attribute length
            var extraIDArray = [];
            Cik.Utils3D.Traverse(obj, function(child, level){
                if(child instanceof THREE.Mesh){
                    var attrLength = child.geometry.attributes.position.count;

                    extraIDArray.push({uuid: child.uuid, attrLength: attrLength});
                }
            });
            extraIDArray.sort((a, b) => {
                return a.attrLength > b.attrLength;
            });
            var extraID = {};
            for(var i = 0; i < extraIDArray.length; i++){
                var ex = extraIDArray[i];
                extraID[ex.uuid] = i.toString();
            }
            
            // set name and hid
            Cik.Utils3D.Traverse(obj, function(child, level){
                var add = '-' + extraID[child.uuid] + '_';
                if(child instanceof THREE.Mesh) add += child.material.name;
                if(child.children.length > 0) add += 'c' + child.children.length + '_';
                add += level;
                child.name = sovStr + add;
                child.hid = child.name;
            });

            obj.name = sovStr;
            obj.hid = obj.name;
        });

        // Validate
        var collisions = 0;
        for(var i = 0, numItems = this.items.length; i < numItems; i++){
            var obj = this.items[i].obj;
            for(var j = 0; j < numItems; j++){
                var obj2 = this.items[j].obj;
                obj.traverse(function(child){
                    var hidc = child.hid;
                    obj2.traverse(function(child2){
                        if(child.uuid !== child2.uuid){
                            var hidc2 = child2.hid;
                            if(hidc === hidc2) collisions++;
                        }
                    });
                });
            };
        };

        if(collisions === 0) console.log('Items hid validated');
        else console.warn('Found', collisions, 'collision in hid');
    }

});

Object.assign(V3f.Project.Imported, {

    propRegex: new RegExp(/(?:Prop_)(.+)/),

    Collect: function(root){
        var propRegex = this.propRegex;

        var items = [];
        root.traverse(function(child){

            var nodeName = child.name;

            var propInfo = propRegex.exec(nodeName);
            if(propInfo !== null){
                var propName = propInfo[1];
                nodeName = 'S_$$' + propName;
            }

            var sov = V3d.SOV.Resolve(nodeName);
            if(sov && !sov.error){
                var item = new V3f.Project.Imported.Item(child, sov);
                items.push(item);
            }
        });

        return items;
    },

    Optimize: function(...items){

        items.forEach(item => {
            var obj = item.target;

            obj.position.set(0, 0, 0);
            obj.rotation.set(0, 0, 0);
            obj.updateMatrixWorld(true);

            obj.traverse(function(child){
                if(child instanceof THREE.Mesh){
                    // It's the 3D model of that SOV, save it
                    if(child.geometry.attributes.position.count >= 3) {
                        var snapshot = child.geometry.clone();
                        snapshot.applyMatrix(child.matrixWorld);

                        var sovMesh = new THREE.Mesh(snapshot, child.material);
                        try{
                            item.AppendMesh(sovMesh);
                        }
                        catch(error){
                            console.log('*** AppendMesh error on', child, 'child of', obj);
                            console.log('\t', item.sov.ToString());
                        }
                    }
                }
            });
            if(item.creationLog === undefined){
                console.log(item);
            }
        });
    },

    Convert: function(view){

        view.traverse(function(child){
            if(child instanceof THREE.Mesh){
                //child.castShadow = child.receiveShadow = true;

                var material = child.material;
                V3f.Project.Imported.ConvertMaterial(material);
                material.needsUpdate = true;
            }
        });
    },

    ConvertMaterial: function(material){

        var normalMap = material.normalMap;
        if(normalMap && material.bumpMap === null) {
            material.bumpMap = normalMap;
            material.normalMap = null;
        }

        material.fog = false;

        var properties = Object.values(material);
        properties.forEach(property => {
            if(property instanceof THREE.Texture){
                var texture = property;

                // Try THREE.NearestFilter on wall textures
                texture.minFilter = THREE.LinearMipMapLinearFilter;
                texture.magFilter = THREE.LinearFilter;
            }
        });
    }

});