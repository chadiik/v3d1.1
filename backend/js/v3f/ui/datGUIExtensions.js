
dat.GUI.prototype.find = function(object, property){
    var gui = this;
    for (var i = 0; i < gui.__controllers.length; i++){
        var controller = gui.__controllers[i];
        if (controller.object == object && controller.property == property)
            return controller;
    }
    return undefined;
};

// Disabled
function blockEvent(event){
    event.stopPropagation();
}

Object.defineProperty(dat.controllers.FunctionController.prototype, "disabled", {
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