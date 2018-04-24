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
};

Object.assign(V3f.Smart.prototype, {

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
    },
    
    Config: function(folderName, target, guiChanged, ...args){
        this.config = new Cik.Config(target);
        this.config.Track(...args);
        this.config.Edit(guiChanged, folderName, this.gui, {save: false});
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
        }

        this.current = current;

        if(this.current !== undefined){
            for(iFocus = 0; iFocus < this.onFocus.length; iFocus++){
                this.onFocus[iFocus](this.current);
            }
        }
    }
});