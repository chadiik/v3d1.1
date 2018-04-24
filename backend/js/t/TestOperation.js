
var obj = {
    Foo: function(a, b){
        console.log('Foo', a, b);
    },

    Fa: function(child, a){
        child.Fa(a);
    },

    child: {
        Fa: function(a){
            console.log('Fa', a);
        }
    }
}

var op = new V3f.Operation('obj', 'Foo', ['p1', 'p2']);
var opChild = new V3f.Operation('obj.child', 'Fa', ['p3']);
var op2 = new V3f.Operation('obj', 'Fa', [new V3f.Operation.Object('obj.child'), 'nested p5']);

var sequence = new V3f.Operation.Sequence('test');
sequence.Add(op, opChild, op2, opChild);

var json = JSON.stringify(sequence);

var data = JSON.parse(json);
V3f.Operation.Sequence.FromJSON(data);

//

var two = {
    sequence: function(){
        var op = new V3f.Operation('obj', 'Foo', ['p1', 'p2']);
        var opChild = new V3f.Operation('obj.child', 'Fa', ['p3']);
        var op2 = new V3f.Operation('obj', 'Fa', [new V3f.Operation.Object('obj.child'), 'nested p5']);

        var sequence = new V3f.Operation.Sequence('test').AutoLoad();
        sequence.Add(op, opChild, op2, opChild);

        return sequence;
    }()
}

//two.sequence.Execute();