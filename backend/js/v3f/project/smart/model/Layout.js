
V3f.Smart.Layout = function(layout){
    V3f.Smart.call(this, layout);

    var numSections = layout.sections.length;
    var sectionsNames = {};
    sectionsNames['(' + numSections + ')'] = -1;
    for(var i = 0; i < numSections; i++){
        var section = layout.sections[i];
        sectionsNames[section.sov.ToString()] = i;
    };

    var c = Cik.Config.Controller; //(property, min, max, step, onChange)
    var track = [
        new c('ConfigSection', sectionsNames)
    ];
    var folder = this.Config('Section', this, this.OnGuiChanged.bind(this), ...track);
    folder.open();
};

V3f.Smart.Layout.prototype = Object.assign(Object.create(V3f.Smart.prototype), {
    constructor: V3f.Smart.Layout,

    OnGuiChanged: function(){
        
    }
});

Object.defineProperties(V3f.Smart.Layout.prototype, {
    ConfigSection: {
        get: function(){
            return -1;
        },

        set: function(section){
            section = parseInt(section);
            if(section >= 0){
                section = this.target.sections[section];
                var smartSection = new V3f.Smart.Section(section);
                smartSection.Show();
            }
        }
    }
});