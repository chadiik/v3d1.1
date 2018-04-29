if(typeof V3d === 'undefined') V3d = {};

V3d.SOV = function(){
    
};

Object.assign(V3d.SOV.prototype, {
    
    Clone: function(sov){
        return V3d.SOV.Build(sov.s, sov.o, sov.v);
    },

    /**
     * To string
     * @param {boolean} force update cached string
     */
    ToString: function(force){
        if(this._toString === undefined || force){
            this._toString = 'S_' + this.s + '-O_' + this.o + '-V_' + this.v;
        }
        return this._toString;
    },

    Register: function(){
        V3d.SOV.Records.Register(this);
    }
});

Object.assign(V3d.SOV, {
    
    ResolveRegex: new RegExp(/(?:-+|^|_)(M|L|S|O|V)(?:_)/, 'g'),
    Resolve: function(name){
        name = Cik.Utils.TrimVariable(name);
        var vars = name.split(this.ResolveRegex);

        var s = this.ExtractKey(vars, 'S');
        if(!s){
            if(this.error === undefined) this.error = {};
            this.error.s = 'SOV.Resolve - Section key not found in: ' + name;
            return false;
        }

        var o = this.ExtractKey(vars, 'O');
        if(!o){
            o = 'Default';
            if(this.log === undefined) this.log = {};
            this.log.o = 'SOV.Resolve - Option key missing for: ' + name + ', set to: ' + o;
        }

        var v = this.ExtractKey(vars, 'V');
        if(!v){
            v = 'Default';
            if(this.log === undefined) this.log = {};
            this.log.v = 'SOV.Resolve - Variation key missing for: ' + name + ', set to: ' + v;
        }

        var sov = this.Build(s, o, v);
        return sov;
    },

    ExtractKey: function(vars, key){
        var index = vars.indexOf(key);
        if(index === -1) index = vars.indexOf(key.toLowerCase());
        if(index !== -1 && index + 1 < vars.length) return vars[index + 1];
        return false;
    },

    Build: function(s, o, v){
        var sov = new V3d.SOV();
        sov.s = s;
        sov.o = o;
        sov.v = v;
        return sov;
    },

    FromJSON: function(data){
        var sov = this.Resolve(data);
        return sov;
    }
});