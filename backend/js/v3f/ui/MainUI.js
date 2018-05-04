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

    // Display images
    this.currentImageDisplay = 0;
    this.imagesDisplay = [];
    for(var iImage = 0; iImage < 11; iImage++){
        var imageDisplay = new V3f.UIElements.Image();
        //imageDisplay.SetSource('http://');
        //imageDisplay.SetLabel('Hello');
        this.sideBar.Add(imageDisplay.domElement);
        this.imagesDisplay.push(imageDisplay);
    }

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
            try{
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

                sceneDisplay.SetLabel(arg.name);
            }
            catch(error){
                console.log('error in display: ', error);
            }
        });
    },

    ShowImage: function(src, label){
        var imageDisplay;
        if(this.currentImageDisplay >= this.imagesDisplay.length){
            imageDisplay = new V3f.UIElements.Image();
            this.sideBar.Add(imageDisplay.domElement);
            this.imagesDisplay.push(imageDisplay);
        }

        imageDisplay = this.imagesDisplay[this.currentImageDisplay++];
        imageDisplay.SetSource(src);
        imageDisplay.SetLabel(label);

        return imageDisplay;
    },

    ClearImages: function(){
        while(this.currentImageDisplay > 0){
            var imageDisplay = this.imagesDisplay[--this.currentImageDisplay];
            imageDisplay.opacity = 1;
            imageDisplay.SetSource();
            imageDisplay.SetLabel();
        }
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