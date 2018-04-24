
V3f.Operation.Object = function(objectPath){

    this.objectPath = objectPath;
    this.value = V3f.Operation.Object.Resolve(this.objectPath);
};

Object.assign(V3f.Operation.Object.prototype, {

    toJSON: function(){
        return {
            opObject: true,
            path: this.objectPath
        };
    }
});

Object.assign(V3f.Operation.Object, {

    Resolve: function(path){
        var obj = window;
        path = path.split('.');
        while (path.length > 1) obj = obj[path.shift()];
        return obj[path.shift()];
    },

    FromJSON: function(data){
        var objectPath = data.path;
        var object = new V3f.Operation.Object(objectPath);
        return object;
    }
});