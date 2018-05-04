if(typeof V3f === 'undefined') V3f = {};
if(V3f.UIElements === undefined) V3f.UIElements = {};

V3f.UIElements.SideBar = function(){

    V3f.UIElements.Element.call(this);

    this.domElement = crel('div', {id:'sidebar', class:'UISidebar'});

    this.elements = [];
};

V3f.UIElements.SideBar.prototype = Object.assign(Object.create(V3f.UIElements.Element.prototype), {
    constructor: V3f.UIElements.SideBar,
    
    Add: function(elt, styling){
        if(styling || styling === undefined) elt.classList.add('UISidebarItem');
        this.domElement.appendChild(elt);
    },

    AddTitle: function(title){
        var titleElement = V3f.UIElements.Element.Span(title, 'UISidebarTitle');
        this.domElement.appendChild(titleElement);
    }
});

Object.assign(V3f.UIElements.SideBar, {
    
});