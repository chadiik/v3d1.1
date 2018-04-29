
dat.GUI.prototype.find = function(object, property){
    var gui = this, controller, i;
    for (i = 0; i < gui.__controllers.length; i++){
        controller = gui.__controllers[i];
        if (controller.object == object && controller.property == property)
            return controller;
    }

    var folders = Object.values(gui.__folders);
    for(i = 0; i < folders.length; i++){
        controller = folders[i].find(object, property);
        if(controller) return controller;
    }
    return undefined;
};

// Disabled
function blockEvent(event){
    event.stopPropagation();
}

Object.defineProperty(dat.controllers.Controller.prototype, "disabled", {
    get: function(){
        return this.domElement.hasAttribute("disabled");
    },

    set: function(value){
        if (value){
            this.domElement.setAttribute("disabled", "disabled");
            this.domElement.addEventListener("click", blockEvent, true);
            this.domElement.parentElement.parentElement.classList.add('datDisabled');
        }
        else{
            this.domElement.removeAttribute("disabled");
            this.domElement.removeEventListener("click", blockEvent, true);
            this.domElement.parentElement.parentElement.classList.remove('datDisabled');
        }
    },

    enumerable: true
});

dat.GUI.prototype.enable = function(object, property, value){
    var controller = this.find(object, property);
    controller.disabled = !value;
};

// Tooltip

Object.defineProperty(dat.controllers.Controller.prototype, "tooltip", {
    get: function(){
        return this._tooltip.innerHTML;
    },

    set: function(value){
        if (value){
            if(this._tooltip === undefined) {
                this._tooltip = crel('span', {class:'tooltiptext'});

                var container = this.domElement.parentElement.parentElement;
                container.classList.add('tooltip');
                container.appendChild(this._tooltip);
            }
            this._tooltip.innerHTML = value;
        }
    },

    enumerable: true
});

dat.GUI.prototype.setTooltip = function(object, property, value){
    var controller = this.find(object, property);
    controller.tooltip = value;
};