
V3d.Library.Light = Cik.Utils.Redefine(V3d.Library.Light, function(instanceProperties){
    return function(lightObject){

        V3d.Library.Light.Init();

        this.bulb = new THREE.Object3D();
        this.bulb.name = 'bulb';
        var helperSize = 3;
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
            this.smart = new V3f.Smart.PointLight(this, 'PointLight');
            this.smart.onFocusLost.push(function(){
                V3d.Library.Light.Focus(undefined);
            });
        }

        var raycastGroup = V3d.Library.Light.raycastGroup;
        raycastGroup.items.push(this);
        raycastGroup.UpdateItems(raycastGroup.items);
    }
});

Object.assign(V3d.Library.Light, {

    Init: function(){
        if(this.initiated) return;
        this.initiated = true;

        this.controlGroup = new V3f.ControlGroup();
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

        Cik.Input.AddRaycastGroup('OnClick', 'Smart.Lights', this.raycastGroup);
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