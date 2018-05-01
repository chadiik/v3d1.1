if(typeof Cik === 'undefined') Cik = {};

Cik.Factory = function(){
    this.objects = [];
};

Object.assign(Cik.Factory.prototype, {

    New: function(){
        // return object;
    },

    Renew: function(){
        // reset object
        // return object;
    },

    Request: function(){
        var numObjects = this.objects.length;
        if(numObjects === 0){
            return this.New();
        }
        else{
            return this.objects[--this.objects.length];
        }
    },

    Recycle: function(object){
        this.objects[this.objects.length] = this.Renew(object);
    }
});