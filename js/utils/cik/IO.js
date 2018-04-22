if(typeof Cik === 'undefined') Cik = {};

// require FileSaver.js

Cik.IO = {

    FileInfo: function(file){
        return this.Filename(file.name);
    },

    Filename: function(name){
        var trailStartIndex = name.lastIndexOf('/');
        var trail = name.slice(trailStartIndex + 1);

        var extStartIndex = trail.lastIndexOf('.');
        var nameOnly = trail.slice(0, extStartIndex);
        var extension = trail.slice(extStartIndex + 1);

        return {
            name: nameOnly,
            extension: extension
        }
    },
    
    JSON: function(object, filename){
        var blob = new Blob([JSON.stringify(object)], {type: 'text/plain;charset=utf-8'});
        if(filename === undefined && object.hasOwnProperty('name')) filename = object.name + '.json';
        saveAs(blob, filename);
    },

    FileInput: crel('input', {type:'file', style:'display: none'}),

    GetFile: function(callback){
        var onFileChange = function(){
            var file = this.files.length > 0 ? this.files[0] : undefined;
            if(file !== undefined){
                callback(file);
            }
            Cik.IO.FileInput.removeEventListener('change', onFileChange);
            Cik.IO.FileInput = crel('input', {type:'file', style:'display: none'});
        };
        Cik.IO.FileInput.addEventListener('change', onFileChange, false);
        Cik.IO.FileInput.click();
    },

    XHRequest: function(success, failure){
        var req = false;
        try
        {
            // most browsers
            req = new XMLHttpRequest();
        }
        catch (e)
        {
            // IE
            try
            {
                req = new ActiveXObject('Msxml2.XMLHTTP');
            }
            catch(e)
            {
                // try an older version
                try
                {
                    req = new ActiveXObject('Microsoft.XMLHTTP');
                }
                catch(e)
                {
                    return false;
                }
            }
        }
        if (!req) return false;
        if (typeof success != 'function') success = function () {};
        if (typeof failure != 'function') failure = function () {};
        req.onreadystatechange = function()
        {
            if(req.readyState == 4)
            {
                return req.status === 200 ?
                    success(req.responseText) : failure(req.status);
            }
        };
        return req;
    },

    PHPClear: function(dir){
        var vars = 'dir=' + encodeURIComponent(dir);

        var req = this.XHRequest();
        req.open('POST', 'php/Clear.php', true);
        req.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
        req.send(vars);
        return req;
    },

    PHPZipExtract: function(file, path, success, failure){
        var formData = new FormData();
        formData.append('path', path);
        formData.append('zip_file', file);

        var req = this.XHRequest(success, failure);
        req.open('POST', 'php/Zipper.php', true);
        req.send(formData);
        return req;
    }
};