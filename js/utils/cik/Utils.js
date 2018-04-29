if(typeof Cik === 'undefined') Cik = {};

Cik.Utils = {

    Redefine: function(object, constructor){
        var classProperties = object;
        var instanceProperties = object.prototype;
    
        var def = constructor(instanceProperties);
    
        Object.assign(def, classProperties);
        Object.assign(def.prototype, instanceProperties);

        return def;
    },

    AssignUndefined: function(target, source){
        if(target === undefined){
            target = {};
            Object.assign(target, source);
            return target;
        }

        var keys = Object.keys(source);
        keys.forEach(key => {
            if(target[key] === undefined) target[key] = source[key];
        });
        return target;
    },

    GetRectOffset: function(element){
        var style = window.getComputedStyle(element),
            marginLeft = parseFloat(style.marginLeft),
            marginTop = parseFloat(style.marginTop),
            paddingLeft = parseFloat(style.paddingLeft),
            paddingTop = parseFloat(style.paddingTop);
        return {x: marginLeft + paddingLeft, y: marginTop + paddingTop};
    },

    TrimVariableRegex: new RegExp(/(?:\d|_|-)+$/),
    TrimVariable: function(input){
        return input.replace(this.TrimVariableRegex, "");
    }
};