if(typeof V3f === 'undefined') V3f = {};

V3f.MainUI = function(container){
    V3f.MainUI.instance = this;

    this.folders = {};
    
    this.dom = new V3f.UIElements.Dom();
    this.dom.element = container;

    this.infoBar = new V3f.UIElements.InfoBar(160);
    this.dom.Add(this.infoBar);
    
    this.sideBar = new V3f.UIElements.SideBar();
    this.dom.Add(this.sideBar);

    this.datGUI = new dat.GUI({
        autoPlace: false
    });
    
    // Title
    this.sideBar.AddTitle('V3f');

    // Display
    this.sceneDisplay = new V3f.UIElements.Scene();
    this.sideBar.Add(this.sceneDisplay.domElement);

    // GUI 1
    this.sideBar.Add(this.datGUI.domElement);
};

Object.assign(V3f.MainUI.prototype, {

    Add: function(elt){
        this.dom.Add(elt);
    },

    AddFolder: function(label){
        var gui = this.datGUI.addFolder(label);
        this.folders[label] = gui;
        return gui;
    },

    Preview3D: function(...args){
        var sceneDisplay = this.sceneDisplay;
        sceneDisplay.Reset();
        sceneDisplay.Show();
        var box3 = new THREE.Box3(), vec3 = new THREE.Vector3();
        args.forEach(arg => {
            var object = arg.clone();
            object.applyMatrix(arg.matrixWorld);

            box3.setFromObject(object);
            box3.getSize(vec3);
            object.position.set(0, vec3.y * .5, 0);
            sceneDisplay.Add(object);

            object.updateMatrixWorld(true);
            var frame = Cik.Utils3D.FrameCamera(sceneDisplay.cameraController.camera, object);
            sceneDisplay.cameraController.position.copy(frame.position);
            sceneDisplay.cameraController.SetTarget(frame.target);
        });
    },

    HidePreview3D: function(){
        this.sceneDisplay.Hide();
    }
});

Object.defineProperty(V3f, 'InfoBar', {
    get: function(){
        return V3f.MainUI.instance.infoBar;
    }
});