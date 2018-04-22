if(typeof Cik === 'undefined') Cik = {};

Cik.Utils = {
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
    }
};