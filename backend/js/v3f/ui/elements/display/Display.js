

V3f.UIElements.Display = function(params){
    V3f.UIElements.Element.call(this);

    this.domElement = crel('div', {class:'UIDisplay', tabindex:'-1'});
    this.domElement.addEventListener('mousedown', this.OnMouseDown.bind(this));

    this._fullscreen = false;
};

V3f.UIElements.Display.prototype = Object.assign(Object.create(V3f.UIElements.Element.prototype), {
    constructor: V3f.UIElements.Display,

    InitLabel: function(){
        if(this.label === undefined){
            this.label = crel('div', {class: 'UILabelDisplay'});
            this.domElement.appendChild(this.label);
        }
    },

    SetLabel: function(label){
        this.label.innerHTML = label;

        this.label.style.display = label === undefined ? 'none' : 'block';
    },

    OnMouseDown: function(mouseEvent){
        if(mouseEvent.ctrlKey){
            this._fullscreen = !this._fullscreen;
            this.fullscreen = this._fullscreen;
        }
    },

    OnKeyDown: function(keyEvent){
        console.log(keyEvent.key);
    }
});

Object.defineProperties(V3f.UIElements.Display.prototype, {
    fullscreen: {
        set: function(value){
            if(value){
                this.domParent = this.domElement.parentNode;
                this.domIndex = Array.prototype.slice.call(this.domParent.children).indexOf(this.domElement);

                this.domElement.classList.add('UIDisplayFull');
                document.body.appendChild(this.domElement);
            }
            else{
                this.domElement.classList.remove('UIDisplayFull');
                this.domParent.children[this.domIndex].insertAdjacentElement('beforebegin', this.domElement);
            }
        }
    }
});