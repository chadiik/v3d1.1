if(typeof V3d === 'undefined') V3d = {};

V3d.Interface = function() {

};

Object.assign(V3d.Interface.prototype, {
    constructor: V3d.Interface,

    /******************************************************************************/
    // Backend -> Viewer functions
    // ---------------------------
    /******************************************************************************/

    /**
     * A callback function with status and info
     * @callback interfaceCallback
     * @param {string} result form: $OK[functionName]:info || $ERROR[functionName]:info
     */

    /**
     * Load house model
     * @param {string} v3fRelativePath .v3f filepath
     * @param {string} assetsRelativePath directory for environment maps and other future unpacked assets
     * @param {interfaceCallback} callback called when loading is complete or on error
     * @param {interfaceCallback} minCallback called when project file loading is complete but before textures are completely loaded
     */
    LoadModel: function(v3fRelativePath, assetsRelativePath, callback, minCallback){},

    /**
     * Setup model with initial options
     * @param {array} sovs array of full sov keys
     * @param {interfaceCallback} callback called when items are set or on error
     */
    SetupModel: function(sovs, callback){},

    /**
     * Camera will travel to predefined vantage point
     * @param {string} sov
     * @param {interfaceCallback} callback called when camera has finished a travel or on error
     */
    Focus: function(sov, callback){},

    /**
     * Switch a scene item
     * @param {string} oldSOV 
     * @param {string} newSOV change to
     * @param {interfaceCallback} callback called when the item is changed or on error
     */
    SetOption: function(oldSOV, newSOV, callback){},

    /**
     * Switch a collection of scene items
     * @param {array} oldSOVs
     * @param {array} newSOVs change to, array should match oldSOVs indexing
     * @param {interfaceCallback} callback called when the items are changed or on error
     */
    SetOptions: function(oldSOVs, newSOVs, callback){},

    /**
     * A function for exposing scene operations
     * @example var opID = Interface.SceneOp('hide', ['sov']);
     * @param {string} op valid op values are: 'hide'
     * @param {object} params parameters specific to each op
     * > op = 'hide', params is an array of sov keys ['sov', 'sov', ...]
     * > op = ...
     * @return {string} an ID to use with 'Interface.Undo', or undefined if op is invalid
     */
    SceneOp: function(op, params){/*returns*/},

    /**
     * Undo an 'Interface.SceneOp'
     * @example Interface.Undo( Interface.SceneOp('hide', ['sov']) );
     * @param {string} opID id returned from a call to 'Interface.SceneOp'
     * @param {interfaceCallback} callback called when undo is applied or on error
     */
    Undo: function(opID, callback){},

    /**
     * Enter or exist fullscreen, call after transforming container dom element
     * @param {boolean} value true/false -> enter/exit
     * @param {interfaceCallback} callback called when entered/exited fullscreen or on error
     */
    Fullscreen: function(value, callback){},
    

    /******************************************************************************/
    // Viewer -> Backend functions
    // ---------------------------
    /******************************************************************************/

    /**
     * Viewer is ready
     * @param {string} config currently a placeholder object, might be used for WebVR status, etc.
     */
    OnViewerReady: function(config){
        console.log('Interface.OnViewerReady(config) config >', config);
    },

    /**
     * Section change
     * undefined    ->  newSov      = a new item is created
     * oldSov       ->  undefined   = an existing item is removed
     * oldSov       ->  newSov      = an existing item is replaced
     * @param {string} oldSOV S_Section-O_Option-V_Variation
     * @param {string} newSOV S_Section-O_Option-V_Variation
     */
    NotifyChange: function(oldSOV, newSOV){
        CK.CLog.log('Interface.NotifyChange(' + oldSOV + ', ' + newSOV + ')');
    }

});

Object.assign(V3d.Interface, {

    SOVUtils: {
        
        /**
         * Returns an SOV object
         * @param {string} keyString 'S_Section-O_Option-V_Variation' with -O_... and -V_... optional, assigned 'Default' if omitted.
         */
        Resolve: function(keyString){
            keyString = CK.Helpers.TrimVariable(keyString);
            var vars = keyString.split(V3d.Lib.SOV.ResolveRegex);

            var s = V3d.Lib.SOV.ExtractKey(vars, 'S');
            if(!s){
                var unresolved = 'NOTsov(' + keyString + ')';
                CK.CLog.Log('Unresolved: ', 'warning', unresolved);
                return false;
            }

            var o = V3d.Lib.SOV.ExtractKey(vars, 'O') || 'Default';
            var v = V3d.Lib.SOV.ExtractKey(vars, 'V') || 'Default';
            var sov = V3d.Lib.SOV.Build(s, o, v);

            return sov;
        }

        // SOV object, functions of interest:
        
        /** : sov.Equal(sov, skipVariation)
         * Compare sov objects
         * @param {SOV} sov sov object to compare with
         * @param {boolean} skipVariation if true, comparison won't include variation key
         */

        /** : sov.GetValue(key)
         * Get a key value
         * @param {string} key lowercase 's', 'o' or 'v'
         */

        /** : sov.Match(match, against, useCase)
         * Find a string in any of the 'against' keys
         * @param {string} match String to test if it exists in keys (case sensitive)
         * @param {string} against One of 's', 'o', 'v' or a combination of those 'so', 'sov', etc.
         * @param {boolean} useCase Default is false: convert to lowercase before comparison
         */

        /** : sov.ToString(force)
         * To string
         * @param {boolean} force update cached string
         */
    }
});