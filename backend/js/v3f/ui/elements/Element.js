
V3f.UIElements.Element = function(){
    this.domElement;
};

Object.assign(V3f.UIElements.Element.prototype, {

    Hide: function(){
        this.domElement.classList.add('UIHideMenu');
    },
    
    Show: function(){
        this.domElement.classList.remove('UIHideMenu');
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