if(typeof V3f === 'undefined') V3f = {};

V3f.Feedback = {

    log: '',

    Clear: function(){
        V3f.Feedback.log = '';
    },

    AddLine: function(line, isList){
        var prepend = isList ? ' - ' : '';
        V3f.Feedback.log += prepend + line + '\n';
    },

    Notify: function(message){
        if(message === undefined){
            message = V3f.Feedback.log;
            V3f.Feedback.log = '';
        }

        V3f.InfoBar.Add(message);
        window.alert(message);
    },

    Prompt: function(message, defaultValue, confirmed, cancelled){
        var result = window.prompt(message, defaultValue ? defaultValue : '');
        if (result == null || result == '') {
            if(cancelled) cancelled();
        } else {
            if(confirmed) confirmed(result);
        }
    },

    Confirm: function(message, confirmed, cancelled){
        if (window.confirm(message)) {
            if(confirmed) confirmed();
        } else {
            if(cancelled) cancelled();
        }
    },

    Reload: function(){
        window.location.reload(false);
    }
};