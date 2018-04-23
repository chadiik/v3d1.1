

V3f.UIElements.Display = function(params){
    V3f.UIElements.Element.call(this);

    this.domElement = crel('div', {class:'UIDisplay'});
};

V3f.UIElements.Display.prototype = Object.assign(Object.create(V3f.UIElements.Element.prototype), {
    constructor: V3f.UIElements.Display
});