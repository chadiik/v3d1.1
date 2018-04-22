if(typeof V3f === 'undefined') V3f = {};
if(V3f.UIElements === undefined) V3f.UIElements = {};

V3f.UIElements.InfoBar = function(maxHeight){

    V3f.UIElements.Element.call(this);

    this.maxHeight = maxHeight || 250;
    this.domElement = crel('div', {class:'UIInfoBar'});
    this.on = true;

    this.toggleBtn = crel('a', {class: 'closebtn'});
    this.toggleBtn.onclick = this.Toggle.bind(this);
    this.domElement.appendChild(this.toggleBtn);
    this.Toggle();

    this.body = crel('div', {style:'margin-left: 10px; margin-top: -30px;'});
    this.domElement.appendChild(this.body);

    this.elements = [];
};

V3f.UIElements.InfoBar.prototype = Object.assign(Object.create(V3f.UIElements.Element.prototype), {
    constructor: V3f.UIElements.InfoBar,
    
    Toggle: function(){
        this.on = !this.on;
        this.domElement.style.height = this.on ? this.maxHeight + 'px' : '0';
        this.toggleBtn.innerHTML = ['&#9660;', '&#9650;'][this.on ? 0 : 1];
    },

    Add: function(elt, last){
        if(elt === undefined) elt = crel('br');
        if(typeof elt === 'string') elt = crel('div', undefined, elt);
        if(last) this.body.appendChild(elt);
        else this.body.insertAdjacentElement('afterbegin', elt);
        this.elements.push(elt);
    },

    Clear: function(elt){
        for(var i = 0; i < this.elements.length; i++){
            if(elt === undefined || this.elements[i] === elt){
                this.body.removeChild(this.elements[i]);
                this.elements.splice(i, 1);
                i--;
            }
        }
    }
});

Object.assign(V3f.UIElements.InfoBar, {
    char: ['&#9660;', '&#9650;']
});