
V3f.Smart.CubeCamera = function(cubeCamera, label){
    V3f.Smart.call(this, cubeCamera, label);

    var track = [
        'Update'
    ];

    this.folder = this.Config('Cube camera', this, this.OnGuiChanged.bind(this), ...track);
    this.folder.open();

    var cells = [];
    this.draggable.Add(crel('hr'));
    for(var i = 0; i < 12; i++){
        var cell = crel('div', {style:'display: inline-block; width: 25%; height: auto'});
        cells.push(cell);
        this.draggable.Add(cell);
    }
    this.imageDisplays = [];
    for(var i = 0; i < 6; i++){
        var display = new V3f.UIElements.Image();
        display.domElement.classList.remove('UIDisplay');
        this.imageDisplays.push(display);
    }

    cells[0].appendChild(this.imageDisplays[2].domElement);
    cells[4].appendChild(this.imageDisplays[4].domElement);
    cells[5].appendChild(this.imageDisplays[0].domElement);
    cells[6].appendChild(this.imageDisplays[5].domElement);
    cells[7].appendChild(this.imageDisplays[1].domElement);
    cells[8].appendChild(this.imageDisplays[3].domElement);

    this.canvas = document.createElement('canvas');
    this.contex2D = this.canvas.getContext('2d');
    this.canvas.width = cubeCamera.resolution;
    this.canvas.height = cubeCamera.resolution;
};

V3f.Smart.CubeCamera.prototype = Object.assign(Object.create(V3f.Smart.prototype), {

    OnGuiChanged: function(){

    },

    Show: function(){
        V3f.Smart.prototype.Show.call(this);

        V3f.Smart.CubeCamera.active = this;
    },

    Hide: function(){
        V3f.Smart.prototype.Hide.call(this);

        V3f.Smart.CubeCamera.active = undefined;
    },

    Update: function(){
        this.target.Update();

        var images = this.target.cubeTexture.images;
        for(var i = 0; i < 6; i++){
            this.contex2D.putImageData(images[i], 0, 0);
            this.imageDisplays[i].SetSource(this.canvas.toDataURL());
        }
    }
});

Object.assign(V3f.Smart.CubeCamera, {

    active: undefined
});