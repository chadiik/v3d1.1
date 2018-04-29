
V3d.SOV.Records = {
    
    flat: {},

    tree: {},

    Register: function(sov){

        var s = sov.s, o = sov.o, v = sov.v;
        if(this.tree[s] === undefined) this.tree[s] = new V3d.SOV.Records.Section(s);

        s = this.tree[s];
        if(s.Get(o) === undefined) s.Add(o);

        o = s.Get(o);
        if(o.Get(v) === undefined) o.Add(sov);

        v = o.Get(v);
        if(this.flat[v.sov] === undefined) this.flat[v.sov] = v;
    },

    Get: function(sov){
        return this.flat[sov];
    }
};

/*                                                        Section */
V3d.SOV.Records.Section = function(name){
    this.value = name;
    this.options = {};
};

Object.assign(V3d.SOV.Records.Section.prototype, {
    
    Get: function(option){
        return this.options[option];
    },

    Add: function(option){
        this.options[option] = new V3d.SOV.Records.Option(option, this);
        this.needsUpdate = true;
    },

    GetOptions: function(){
        if(this.needsUpdate){
            this.optionsCache = [];
            Object.keys(this.options).forEach(optionKey => {
                this.optionsCache.push(this.options[optionKey].value);
            });
        }

        return this.optionsCache;
    }
});

/*                                                        Option */
V3d.SOV.Records.Option = function(name, section){
    this.value = name;
    this.section = section;
    this.variations = {};
};

Object.assign(V3d.SOV.Records.Option.prototype, {
    
    Get: function(variation){
        return this.variations[variation];
    },

    Add: function(sov){
        this.variations[sov.v] = new V3d.SOV.Records.Variation(sov, this);
        this.needsUpdate = true;
    },

    GetOptions: function(){
        return this.section.GetOptions();
    },

    GetVariations: function(){
        if(this.needsUpdate){
            this.variationsCache = [];
            Object.keys(this.variations).forEach(variationKey => {
                this.variationsCache.push(this.variations[variationKey].value);
            });
        }

        return this.variationsCache;
    }
});

/*                                                        Variation */
V3d.SOV.Records.Variation = function(sov, option){
    this.value = sov.v;
    this.sov = sov.ToString();
    this.option = option;
};

Object.assign(V3d.SOV.Records.Variation.prototype, {
    
    GetOptions: function(){
        return this.option.GetOptions();
    },

    GetVariations: function(){
        return this.option.GetVariations();
    }
});