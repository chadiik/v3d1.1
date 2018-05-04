V3f.UIElements.Capabilities = function(hook){

    V3f.UIElements.Element.call(this);

    this.hook = hook;
    this.elements = [];
};

V3f.UIElements.Capabilities.prototype = Object.assign(Object.create(V3f.UIElements.Element.prototype), {
    constructor: V3f.UIElements.Capabilities,

    CreateButton: function(type, params){

        params = Cik.Utils.AssignUndefined(params, V3f.UIElements.Capabilities.defaults.common);

        var button;
        switch(type){
            case 'delete':
            button = this.CreateDeleteButton(params);
            break;

            case 'copy':
            button = this.CreateCopyButton(params);
            break;
        }

        return button;
    },


});

Object.assign(V3f.UIElements.Capabilities.prototype, {

    ButtonCommons: function(params){
        var button = crel('div', {class: 'UIcon'});
        this.hook.appendChild(button);

        if(params.right) button.style.right = params.right;
        if(params.top) button.style.top = params.top;

        this.elements.push(button);
        return button;
    },

    CreateDeleteButton: function(params){
        var button = this.ButtonCommons(params);
        button.style.background = 'url(ressources/Icons.png) 0px 0px';
        button.style.backgroundColor = 'rgb(255, 255, 255, .5)';

        return button;
    },

    CreateCopyButton: function(params){
        var button = this.ButtonCommons(params);
        button.style.background = 'url(ressources/Icons.png) -18px -1px';
        button.style.backgroundColor = 'rgb(255, 255, 255, .5)';
        
        return button;
    }

});

Object.assign(V3f.UIElements.Capabilities, {

    defaults: {
        common: {
            right: '2px', top: '2px'
        }
    }

});