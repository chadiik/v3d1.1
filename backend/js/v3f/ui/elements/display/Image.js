

V3f.UIElements.Image = function(params){
    V3f.UIElements.Display.call(this, params);

    var originalFullscreen = Object.getOwnPropertyDescriptor(V3f.UIElements.Display.prototype, 'fullscreen');
    Object.defineProperty(V3f.UIElements.Image.prototype, 'originalFullscreen', {
        set : originalFullscreen.set
    });

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

Object.defineProperties(V3f.UIElements.Image.prototype, {
    fullscreen: {
        set: function(value){
            this.originalFullscreen = value;

            var style = window.getComputedStyle(this.domElement),
                width = parseFloat(style.width);
            var screen = {
                width: width,
                height: width * .8
            };
            this.sceneRenderer.ReconfigureViewport(screen);
        }
    }
});