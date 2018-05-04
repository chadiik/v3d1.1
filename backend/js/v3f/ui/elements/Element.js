
V3f.UIElements.Element = function(){
    this.domElement;
};

Object.assign(V3f.UIElements.Element.prototype, {

    Hide: function(){
        this.domElement.classList.add('UIHideMenu');
    },
    
    Show: function(){
        this.domElement.classList.remove('UIHideMenu');
    },

    Delete: function(){
        this.domElement.remove();
        delete this.domElement;
    }
});

Object.assign(V3f.UIElements.Element, {
    _Span: function(text, attributes){
        return {
            type: 'span',
            label: text, 
            attributes: typeof(attributes) === 'string' ? {
                class: attributes
            } : attributes
        };
    },

    Span: function(text, attributes){
        var _span = this._Span(text, attributes);
        return crel(_span.type, _span.attributes, _span.label);
    }
});

Object.defineProperties(V3f.UIElements.Element.prototype, {

    opacity: {
        get: function(){
            return parseFloat(this.domElement.style.opacity);
        },

        set: function(value){
            this.domElement.style.opacity = value;
        }
    }
});