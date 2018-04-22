if(typeof Cik === 'undefined') Cik = {};

Cik.Log = (function(){
    
    var Types = {
        log: '>',
        warning: 'WARNING:'
    };

    return function(message, ...args){
        var type, objects, objectsStart = 0;
        if(args != undefined && args.length > 0 && (args[0] !== undefined && typeof this.Types[args[0]] !== 'undefined')){
            type = args[0];
            objectsStart++;
        }
        if(args.length > objectsStart){
            objects = args.slice(objectsStart);
        }
        var out = '';
        if(type !== undefined){
            out = this.Types[type] + ' ';
        }
        out += message;
        switch(type){
            case 'warning':
                if(objects !== undefined) console.trace(out, objects);
                else console.trace(out);
                break;
            default:
                if(objects !== undefined) console.log(out, objects);
                else console.log(out);
                break;
        }
    };
})();