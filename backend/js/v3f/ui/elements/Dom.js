if(typeof V3f === 'undefined') V3f = {};
if(V3f.UIElements === undefined) V3f.UIElements = {};

V3f.UIElements.Dom = function(){
    this.element = crel('div', {id:'UIDom', class:'UIOrigin UIExpand'});
};

Object.assign(V3f.UIElements.Dom.prototype, {

    AddElement: function(element){
        this.element.appendChild(element.domElement);
    }
});
