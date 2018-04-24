
V3f.Operation.Sequence = function(id){

    V3f.Operation.Sequence.instances[id] = this;

    this.id = id;
    this.operations = [];
};

Object.assign(V3f.Operation.Sequence.prototype, {

    Add: function(...args){
        args.forEach(op => {
            var pass = true;
            for(var i = 0; i < this.operations.length; i++){
                pass = pass && !op.Equal(this.operations[i]);
                if(!pass) break;
            }
            if(pass) this.operations.push(op);
        });
    },

    Execute: function(){
        for(var i = 0; i < this.operations.length; i++){
            this.operations[i].Execute();
        }
    },

    toJSON: function(){
        return this;
    },

    AutoLoad: function(){

        var loadedInstance = V3f.Operation.Sequence.jsonInstances[this.id];
        if(loadedInstance){
            this.operations = this.operations.concat(loadedInstance.operations);
            this.Execute();
        }

        return this;
    }
});

Object.assign(V3f.Operation.Sequence, {

    instances: {},

    jsonInstances: {},

    FromJSON: function(data){
        var operations = data.operations;
        var sequence = new V3f.Operation.Sequence(data.id);
        for(var i = 0; i < operations.length; i++){
            var op = V3f.Operation.FromJSON(operations[i]);
            sequence.Add(op);
        }
        V3f.Operation.Sequence.jsonInstances[sequence.id] = sequence;
        return sequence;
    }
});