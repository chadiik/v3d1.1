

V3f.UIElements.Display = function(params){
    V3f.UIElements.Element.call(this);

    this.domElement = crel('div', {class:'UIDisplay', tabindex:'-1'});
    this.domElement.addEventListener('mousedown', this.OnMouseDown.bind(this));

    this._fullscreen = false;
};

V3f.UIElements.Display.prototype = Object.assign(Object.create(V3f.UIElements.Element.prototype), {
    constructor: V3f.UIElements.Display,

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