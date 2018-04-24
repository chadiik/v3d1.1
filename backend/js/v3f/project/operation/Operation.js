if(typeof V3f === 'undefined') V3f = {};

V3f.Operation = function(opObject, functionName, params){

    if(typeof opObject === 'string') opObject = new V3f.Operation.Object(opObject);
    this.opObject = opObject;
    this.functionName = functionName;
    this.params = params;

    this.hash = objectHash.MD5(JSON.stringify(this));
};

Object.assign(V3f.Operation.prototype, {

    Equal: function(op){
        return this.hash === op.hash;
    },

    FixedParams: function(){
        var fixedParams = [];
        for(var i = 0; i < this.params.length; i++){
            fixedParams[i] = this.params[i];
            if(fixedParams[i] instanceof V3f.Operation.Object) {
                fixedParams[i] = this.params[i].value;
            }
        }
        return fixedParams;
    },

    Execute: function(){
        var params = this.FixedParams();
        this.opObject.value[this.functionName](...params);
    },

    toJSON: function(){
        return this;
    }
});

Object.assign(V3f.Operation, {

    FromJSON: function(data){
        var opObject = V3f.Operation.Object.FromJSON(data.opObject);
        var params = data.params;
        for(var i = 0; i < params.length; i++){
            if(params[i].opObject) params[i] = V3f.Operation.Object.FromJSON(params[i]);
        }
        var op = new V3f.Operation(opObject, data.functionName, params);
        return op;
    }
});