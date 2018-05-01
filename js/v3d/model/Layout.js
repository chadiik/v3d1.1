
V3d.Model.Layout = function(){

    this.sections = [];
};

Object.assign(V3d.Model.Layout.prototype, {

    Add: function(section){
        this.sections.push(section);
    }
});

Object.assign(V3d.Model.Layout, {

    FromJSON: function(data){
        var layout = new V3d.Model.Layout();
        data.sections.forEach(sectionData => {
            var section = V3d.Model.Section.FromJSON(sectionData);
            layout.Add(section);
        });
        return layout;
    }
});