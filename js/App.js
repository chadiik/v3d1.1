App = {
    Loader: {
        OnDocumentReady: function(fn) {
            if (document.attachEvent ? document.readyState === 'complete' : document.readyState !== 'loading'){
                fn();
            } 
            else {
                document.addEventListener('DOMContentLoaded', fn);
            }
        },

        LoadScript: function(url, callback){
            var script = document.createElement('script');
            var ext = url.slice(url.lastIndexOf('.') + 1);
        
            if(ext !== 'js'){
                script.type = ext === 'glsl' ? 'x-shader' : 'text';
        
                var request = new XMLHttpRequest();
                request.responseType = 'text';
                request.open('GET', url, true);
                
                request.onload = function() {
                    if (request.status >= 200 && request.status < 400) {
                        script.textContent = request.responseText;
                        callback(true);
                    } else {
                        callback(false);
                        console.log('Get error', script.id);
                    }
                };
                
                request.onerror = function() {
                    console.log('Get error', script.id);
                    callback(false);
                };
                
                request.send();
            }
            else {
                script.type = 'text/javascript';
        
                if (script.readyState){  //IE
                    script.onreadystatechange = function(){
                        if (script.readyState == 'loaded' || script.readyState == 'complete'){
                            script.onreadystatechange = null;
                            callback(true);
                        }
                    };
                } else { 
                    script.onload = function(){
                        callback(true);
                    };
                }

                script.onerror = function() {
                    console.log('JS script loading error', script.id);
                    callback(false);
                };
        
                script.src = url;
            }
            
            script.id = url.slice(url.lastIndexOf('/') + 1);
            document.getElementsByTagName('head')[0].appendChild(script);
            return script.id;
        },

        ParseLST: function(content){
            var scripts = content.split(/\r|\n/);
            for(var i = 0; i < scripts.length; i++){
                var script = scripts[i];
                if(script.length < 3 || script.slice(0, 2) === '//'){
                    scripts.splice(i, 1);
                    i--;
                }
            }
            return scripts;
        },

        Load: function(scripts, callback){
            var numScriptsToLoad = scripts.length;
            var current = 0;
            var OnScriptLoaded = function(){
                if(current === numScriptsToLoad){
                    console.log(scripts.length , ' scripts loaded...');
                    callback();
                }
                else{
                    App.Loader.LoadScript(scripts[current++], OnScriptLoaded);
                }
            }
            
            OnScriptLoaded();
        }

    }
};