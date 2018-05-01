
V3f.Project.Imported = function(scene){
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
                onCompleted(scope.items);
            }
        );

        this.Execute();
    },

    Execute: function(){
        var functions = this.parse.sequence;
        for(var i = 0; i < functions.length; i++){
            var fn = functions[i];
            console.log('parse.sequence', i);
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
        this.items = V3f.Project.Imported.Collect(this.scene);
    },

    Optimize: function(){
        V3f.Project.Imported.Optimize(...this.items);

        this.items.forEach(item => {
            this.log.optimization.originalCallsNum += item.creationLog.originalCallsNum;
            this.log.optimization.newCallsNum += item.creationLog.newCallsNum;
        });
    },

    Convert: function(){

        this.items.forEach(item => {
            var obj = item.target;
            V3f.Project.Imported.Convert(obj);
        });
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
                        sovMesh.name += '_' + item.target.name;
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
        });
    },

    Convert: function(view){

        view.traverse(function(child){
            if(child instanceof THREE.Mesh){
                child.castShadow = child.receiveShadow = true;

                var material = child.material;
                V3f.Project.Imported.ConvertMaterial(material);
            }
        });
    },

    ConvertMaterial: function(material){

        var normalMap = material.normalMap;
        if(normalMap && material.bumpMap === null) {
            material.bumpMap = normalMap;
            material.normalMap = null;
        }

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