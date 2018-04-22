if(typeof V3f === 'undefined') V3f = {};

V3f.MainUI = function(container){
    this.folders = {};
    
    this.dom = new V3f.UIElements.Dom();
    this.dom.element = container;

    this.infoBar = new V3f.UIElements.InfoBar(160);
    this.dom.AddElement(this.infoBar);
    
    this.sideBar = new V3f.UIElements.SideBar();
    this.dom.AddElement(this.sideBar);

    this.datGUI = new dat.GUI({
        autoPlace: false
    });
    this.sideBar.AddTitle('V3f');
    this.sideBar.Add(this.datGUI.domElement);
};

Object.assign(V3f.MainUI.prototype, {

    AddFolder: function(label){
        var gui = this.datGUI.addFolder(label);
        this.folders[label] = gui;
        return gui;
    }
});