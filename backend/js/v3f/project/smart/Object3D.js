
V3f.Smart.Object3D = function(object, label){
    if(label === undefined) label = object.name;
    V3f.Smart.call(this, object, label);
    object.smart = this;

    if(object.asset){
        var assetConfig = object.asset.GetSmartParams();
        var assetFolder = this.Config(...assetConfig);
        assetFolder.open();
    }

    function onShadowChange(){
        V3d.Loop.GetActiveSceneRenderer().UpdateShadowMaps();
    }

    var numChildren = object.children.length;
    var childrenNames = {};
    childrenNames['(' + numChildren + ')'] = -1;
    for(var i = 0; i < numChildren; i++){
        var child = object.children[i];
        childrenNames[i + ': ' + child.name] = i;
    };

    var c = Cik.Config.Controller; //(property, min, max, step, onChange)
    this.object3DFolder = this.Config('Object3D', this, this.OnGuiChanged.bind(this), 
        'Back', 
        'ConfigParent', 
        new c('ConfigChild', childrenNames),
        'target.visible',
        new c('castShadow', undefined, undefined, undefined, onShadowChange), 
        new c('receiveShadow', undefined, undefined, undefined, onShadowChange)
    );
    this.object3DFolder.open();
};

V3f.Smart.Object3D.prototype = Object.assign(Object.create(V3f.Smart.prototype), {
    constructor: V3f.Smart.Object3D,

    OnGuiChanged: function(){
        this.UpdateGUI();
    },

    Show: function(){
        this.gui.__folders.Object3D.enable(this, 'Back', this.backtrack !== undefined);
        
        if(this.target.asset){
            this.target.asset.SaveDefaults();
        }
        
        V3f.Smart.prototype.Show.call(this);
    },

    ConfigParent: function(){
        var ui = V3f.MainUI.instance;
        var parent = this.target.parent;
        if(parent){
            if(parent.smart === undefined) parent.smart = new V3f.Smart.Object3D(parent);
            parent.smart.backtrack = this;
            parent.smart.Show();
        }
    },

    Back: function(){
        var ui = V3f.MainUI.instance;
        this.backtrack.Show();
    },

    ForceUpdate: function(){
        this.target.traverse(function(child){
            if(child instanceof THREE.Mesh){
                child.material.needsUpdate = true;
            }
        });
    }
});

Object.defineProperties(V3f.Smart.Object3D.prototype, {
    ConfigChild: {
        get: function(){
            return -1;
        },

        set: function(child){
            child = parseInt(child);
            if(child >= 0){
                child = this.target.children[child];
                if(child.smart === undefined){
                    console.log(child);
                    child.smart = child instanceof THREE.Mesh ? new V3f.Smart.Mesh(child) : new V3f.Smart.Object3D(child);
                    child.smart.backtrack = this;
                }
                child.smart.Show();
            }
        }
    },

    castShadow: {
        get: function(){
            if(this.cachedCastShadow === undefined){
                var cachedCastShadow = true;
                this.target.traverse(function(child){
                    if(child instanceof THREE.Mesh){
                        cachedCastShadow = cachedCastShadow && child.castShadow;
                    }
                });
                this.cachedCastShadow = cachedCastShadow;
            }
            return this.cachedCastShadow;
        },

        set: function(value){
            if(this.cachedCastShadow === undefined || this.cachedCastShadow !== value){
                this.target.traverse(function(child){
                    if(child instanceof THREE.Mesh){
                        child.castShadow = value;
                    }
                });
                this.cachedCastShadow = value;
                this.ForceUpdate();
            }
        }
    },

    receiveShadow: {
        get: function(){
            if(this.cachedReceiveShadow === undefined){
                var cachedReceiveShadow = true;
                this.target.traverse(function(child){
                    if(child instanceof THREE.Mesh){
                        cachedReceiveShadow = cachedReceiveShadow && child.receiveShadow;
                    }
                });
                this.cachedReceiveShadow = cachedReceiveShadow;
            }
            return this.cachedReceiveShadow;
        },

        set: function(value){
            if(this.cachedReceiveShadow === undefined || this.cachedReceiveShadow !== value){
                this.target.traverse(function(child){
                    if(child instanceof THREE.Mesh){
                        child.receiveShadow = value;
                    }
                });
                this.cachedReceiveShadow = value;
                this.ForceUpdate();
            }
        }
    }
});