if(typeof V3f === 'undefined') V3f = {};

V3f.Smart = function(target, label){
    this.target = target;
    this.label = label;

    var scope = this;

    this.gui = new dat.GUI({autoPlace: false});
    this.draggable = new V3f.UIElements.Draggable(this.label, 250);
    this.draggable.Add(this.gui.domElement);
    this.draggable.closeBtn.onclick = function(){
        scope.Hide();
    };

    var ui = V3f.MainUI.instance;
    ui.Add(this.draggable);
    this.draggable.Hide();

    this.onFocus = [];
    this.onFocusLost = [];
};

Object.assign(V3f.Smart.prototype, {

    Delete: function(){
        this.Hide();
        this.draggable.Delete();
        this.gui.destroy();
        this.onFocus.length = this.onFocusLost.length = 0;
    },

    UpdateGUI: function(){
        V3f.Smart.UpdateGUI(this.gui);
    },

    Hide: function(){
        this.draggable.Hide();
        V3f.Smart.SetCurrent(undefined);
    },

    Show: function(){
        if(V3f.Smart.current !== undefined){
            if(V3f.Smart.current === this) return;

            var oldPos = V3f.Smart.current.draggable.GetPosition();
            this.draggable.SetPosition(oldPos.x, oldPos.y);

            V3f.Smart.current.Hide();
        }
        this.draggable.Show();
        this.draggable.domElement.classList.add('UIWiggleAnim');
        V3f.Smart.SetCurrent(this);

        this.UpdateGUI();
    },
    
    Config: function(folderName, target, guiChanged, ...args){
        this.config = new Cik.Config(target);
        this.config.Track(...args);
        this.config.Edit(guiChanged, folderName, this.gui, {save: false});
        return this.config.gui;
    }
});

Object.assign(V3f.Smart, {
    
    current: undefined,

    onFocus: [],

    onFocusLost: [],

    SetCurrent: function(current){
        var iFocus;
        if(this.current !== undefined){
            for(iFocus = 0; iFocus < this.onFocusLost.length; iFocus++){
                this.onFocusLost[iFocus](this.current);
            }
            for(iFocus = 0; iFocus < this.current.onFocusLost.length; iFocus++){
                this.current.onFocusLost[iFocus]();
            }
        }

        this.current = current;

        if(this.current !== undefined){
            for(iFocus = 0; iFocus < this.onFocus.length; iFocus++){
                this.onFocus[iFocus](this.current);
            }
            for(iFocus = 0; iFocus < this.current.onFocus.length; iFocus++){
                this.current.onFocus[iFocus]();
            }
        }
    },

    UpdateGUI: function(gui){
        if(gui === undefined) gui = this.gui;
        for (var i in gui.__controllers) {
            gui.__controllers[i].updateDisplay();
        }

        var folders = Object.values(gui.__folders);
        for(i = 0; i < folders.length; i++){
            this.UpdateGUI(folders[i]);
        }
    }
});