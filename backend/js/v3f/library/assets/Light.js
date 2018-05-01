
V3d.Library.Light = Cik.Utils.Redefine(V3d.Library.Light, function(instanceProperties){
    return function(lightObject){

        V3d.Library.Light.Init();

        this.bulb = new THREE.Object3D();
        this.bulb.name = 'bulb';
        var helperSize = 6;
        this.bulb.add(new THREE.Mesh(
            new THREE.BoxBufferGeometry(helperSize, helperSize, helperSize),
            new THREE.MeshBasicMaterial({
                color: 0x00ffff,
                wireframe: true,
            })
        ));

        this.lightConstructor = instanceProperties.constructor;
        if(lightObject) this.SetObject(lightObject);
    }
});

Object.assign(V3d.Library.Light.prototype, {

    SetObject: function(lightObject){
        this.lightConstructor.call(this, lightObject);

        this.lightObject.add(this.bulb);

        if(this.lightObject instanceof THREE.PointLight){
            this.lightObject.castShadow = true;
            this.smart = new V3f.Smart.PointLight(this, 'PointLight');
        }
        else if(this.lightObject instanceof THREE.AmbientLight){
            this.smart = new V3f.Smart.Light(this, 'AmbientLight');
        }

        if(this.lightObject.castShadow){
            this.lightObject.shadow.bias = -0.002;

            this.shadowCameraHelper = new THREE.CameraHelper(this.lightObject.shadow.camera);
            V3d.app.sceneController.Add(this.shadowCameraHelper);
            this.debug = false;
        }

        var scope = this;
        if(this.smart){
            this.smart.onFocus.push(function(){
                scope.debug = true;
            });
            this.smart.onFocusLost.push(function(){
                scope.debug = false;
                V3d.Library.Light.Focus(undefined);
            });
        }

        var raycastGroup = V3d.Library.Light.raycastGroup;
        raycastGroup.items.push(this);
        raycastGroup.UpdateItems(raycastGroup.items);
    },

    Update: function(){
        if(this.shadowCameraHelper !== undefined){
            this.lightObject.shadow.camera.updateProjectionMatrix();
            this.shadowCameraHelper.update();
        }
    },

    toJSON: function(){
        this.lightObject.remove(this.bulb);
        var lightObject = this.lightObject.clone();
        this.lightObject.add(this.bulb);
        return {
            lightObject: lightObject
        };
    }
});

Object.defineProperties(V3d.Library.Light.prototype, {
    debug: {
        set: function(value){
            if(this.shadowCameraHelper !== undefined){
                this.shadowCameraHelper.visible = value;
            }
        }
    }
});

Object.assign(V3d.Library.Light, {

    Init: function(){
        if(this.initiated) return;
        this.initiated = true;

        this.controlGroup = new V3f.ControlGroup();
        this.controlGroup.control.addEventListener('change', function(){
            V3d.app.sceneRenderer.UpdateShadowMaps();
        });

        this.raycastGroup = new Cik.Input.RaycastGroup(
            [], //items
            function(light){ //callback
                V3d.Library.Light.Focus(light);
            },
            
            function(light){ //collectionQuery
                return light.bulb;
            },
            
            false, //updateProperty
            true, //recursive
            false //continuous
        );

        Cik.Input.AddRaycastGroup('OnClick', '0.Smart.Lights', this.raycastGroup);
    },

    Focus: function(light){

        if(light === undefined){
            this.controlGroup.Detach();
            return;
        }

        light.smart.Show();
        this.controlGroup.Attach(light.lightObject);
    }

});