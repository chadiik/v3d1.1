

V3f.UIElements.Image = function(params){
    V3f.UIElements.Display.call(this, params);

    this.image = crel('img', {class: 'UIImageDisplay'});
    this.domElement.appendChild(this.image);

    this.InitLabel();

    this.SetSource();
};

V3f.UIElements.Image.prototype = Object.assign(Object.create(V3f.UIElements.Display.prototype), {
    constructor: V3f.UIElements.Image,

    SetSource: function(src){
        var clear = src === undefined;
        this.image.setAttribute('src', clear ? '' : src);

        this.domElement.style.display = clear ? 'none' : 'block';
    }

});