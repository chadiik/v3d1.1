
V3d.Library.CubeCameraController = Cik.Utils.Redefine(V3d.Library.CubeCameraController, function(instanceProperties){
    return function(resolution){
        instanceProperties.constructor.call(this, resolution);

        this.UseRenderer(V3d.Loop.GetActiveRenderer());
        this.UseScene(V3d.Loop.GetActiveScene())

        this.InitControl();
    }
});

Object.assign(V3d.Library.CubeCameraController.prototype, {

    InitControl: function(){
        this.helper = new V3f.ObjectHelper('sphere', 8);
        this.helper.Attach(this.cubeCamera);
        this.helper.onChange.push(this.OnMove.bind(this));

        this.helper.onFocus.push(this.OnHelperSelect.bind(this));

        this.smart = new V3f.Smart.CubeCamera(this, 'Cube camera');
        var scope = this;
        this.smart.onFocusLost.push(function(){
            scope.helper.Defocus();
        });
    },

    OnHelperSelect: function(){
        this.smart.Show();
    },

    OnMove: function(){
        this.cubeCamera.position.copy(this.helper.position);
        this.cubeCamera.rotation.copy(this.helper.rotation);
    },

    Update: (function(){
        var originalUpdate = V3d.Library.CubeCameraController.prototype.Update;
        return function(){
            this.OnMove();
            this.helper.Hide();
            V3f.ObjectHelper.controlGroup.Hide();
            originalUpdate.call(this);
            this.helper.Show();
            V3f.ObjectHelper.controlGroup.Show();
        };
    })(),

    toJSON: function(){
        var resolution = this.resolution;
        var id = this.id;
        var transform = new V3d.Scene.TRS(this.cubeCamera.position, this.cubeCamera.rotation);

        return {
            resolution: resolution,
            id: id,
            transform: transform
        };
    }
});

Object.assign(V3d.Library.CubeCameraController, {

    FromJSON: (function(){

        var originalFromJSON = V3d.Library.CubeCameraController.FromJSON;
        
        return function(data){
            var cubeCameraController = originalFromJSON.call(V3d.Library.CubeCameraController, data);
            cubeCameraController.helper.position.copy(cubeCameraController.cubeCamera.position);
            cubeCameraController.helper.rotation.copy(cubeCameraController.cubeCamera.rotation);

            cubeCameraController.helper.Defocus();

            return cubeCameraController;
        };
        
    })()
});