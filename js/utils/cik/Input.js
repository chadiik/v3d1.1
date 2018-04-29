if(typeof Cik === 'undefined') Cik = {};

Cik.Input = {

    onInit: [],

    Init: function(domContainer){
        this.enabled = true;
        
        var scope = this;
        Object.defineProperty(this, 'camera', {
            get: function(){
                return scope._camera;
            },
            set: function(camera){
                scope._camera = camera;
                scope.fov = {min: 40, max: camera.fov, target: camera.fov};
            }
        });

        this.domContainer = domContainer;

        this._mouse = {x:0, y:0};
        this.mouseScreen = new THREE.Vector2();
        this.mouseViewport = new THREE.Vector2();
        this.mouseDelta = new THREE.Vector2();
        this.lastMouseDownTime = 0;
        this.screen;
        this.ComputeScreen();

        this.raycaster = new THREE.Raycaster();

        this.clock = new THREE.Clock();
        this.clock.start();

        this._raycastGroups = {Update:{}, Update25:{}, Update10:{}, OnMouseDown:{}, OnDoubleClick:{}, OnMouseUp:{}, OnRightClick:{}, OnClick:{}};
        this.update = [
            {interval:(1/25), last:0, callback: this.Update25.bind(this)},
            {interval:(1/10), last:0, callback: this.Update10.bind(this)}
        ];

        this.fireOnce = [];

        this.onMouseDown = [];
        this.onMouseUp = [];
        this.onRightClick = [];
        this.onDoubleClick = [];
        this.onClick = [];

        this.doubleClickTime = .2;
        
        this.domContainer.addEventListener('mousedown', this.OnMouseDown.bind(this));
        this.domContainer.addEventListener('mouseup', this.OnMouseUp.bind(this));
        this.domContainer.addEventListener('contextmenu', this.OnRightClick.bind(this));
        this.domContainer.addEventListener('mousemove', this.OnMouseMove.bind(this), false);

        var thisOnMouseWheel = this.OnMouseWheel.bind(this);
        if (this.domContainer.addEventListener) {
            this.domContainer.addEventListener("mousewheel", thisOnMouseWheel, false);
            this.domContainer.addEventListener("DOMMouseScroll", thisOnMouseWheel, false);
        }
        else
            this.domContainer.attachEvent("onmousewheel", thisOnMouseWheel);

        this.screenNeedsUpdate = true;
        window.addEventListener('scroll', this.OnScroll.bind(this));

        this.cameraNeedsUpdate = true;
        this.onResize = [];
        window.addEventListener('resize', this.OnResize.bind(this));

        this.keyboard = new window.keypress.Listener();
        this.keyboard.on = this.keyboard.simple_combo;
        this.keys = {};

        for(var i = 0; i < this.onInit.length; i++){
            this.onInit[i](this);
        }
    },

    defaultKeysListen: 'abcdefghijklmnopqrtsuvwxyz'.split('').concat(['ctlr', 'shift', 'alt']),

    ListenKeys: function(keys){
        if(keys === undefined) {
            keys = this.defaultKeysListen;
        }
        else{
            this.defaultKeysListen.forEach(key => {
                if(keys.indexOf(key) === -1) keys.push(key);
            });
        }

        var scope = this;
        keys.forEach(key => {
            scope.keys[key] = false;
            scope.keyboard.register_combo({
                keys: key,
                prevent_repeat: true,
                on_keydown: function(){
                    scope.keys[key] = true;
                },
                on_keyup: function(){
                    scope.keys[key] = false;
                }
            });
        });
    },

    ComputeScreen: function(){
        this.screen = this.domContainer.getBoundingClientRect();
        var rectOffset = Cik.Utils.GetRectOffset(this.domContainer);
        this.screen.x += rectOffset.x;
        this.screen.left += rectOffset.x;
        this.screen.y += rectOffset.y;
        this.screen.top += rectOffset.y;
    },

    OnMouseDown: function(mouseEvent){
        if(mouseEvent.button === 0){
            this.UpdateScreenAndMouse(mouseEvent);
            var now = this.clock.getElapsedTime();
            if(now - this.lastMouseDownTime < this.doubleClickTime){
                if(this._dridMouseDown !== undefined){
                    this.AbortDelayedAction(this._dridMouseDown);
                    this._dridMouseDown = undefined;
                }
                this.OnDoubleClick(mouseEvent);
                return;
            }

            this.lastMouseDownTime = now;

            var scope = this;
            this._dridMouseDown = this.DelayedAction(
                this._mouseDownDelayed = function(){
                    scope._dridMouseDown = undefined;
                    for(var i = 0; i < scope.onMouseDown.length; i++){
                        scope.onMouseDown[i](mouseEvent);
                    }
                    scope.UpdateRaycast('OnMouseDown');
                    scope.mouseDelta.copy(this.mouseScreen);
                }, 
                this.doubleClickTime * 1000
            );
        }
    },

    OnDoubleClick: function(mouseEvent){
        for(var i = 0; i < this.onDoubleClick.length; i++){
            this.onDoubleClick[i](mouseEvent);
        }

        this.UpdateRaycast('OnDoubleClick');
    },

    ExecuteDelayedMD: function(mouseEvent){
        if(this._dridMouseDown !== undefined){
            this.AbortDelayedAction(this._dridMouseDown);
            this._dridMouseDown = undefined;
            this._mouseDownDelayed();
        }
    },

    OnMouseUp: function(mouseEvent){
        if(mouseEvent.button === 0){
            var now = this.clock.getElapsedTime();
            if(now - this.lastMouseDownTime < this.doubleClickTime){
                this.ExecuteDelayedMD(mouseEvent);
            }
            
            this.UpdateScreenAndMouse(mouseEvent);
            for(var i = 0; i < this.onMouseUp.length; i++){
                this.onMouseUp[i](mouseEvent);
            }

            this.UpdateRaycast('OnMouseUp');
            var d = this.mouseDelta.distanceToSquared(this.mouseScreen);
            var noMouseDrag = d < 10; // pixels squared
            if(noMouseDrag){
                this.OnClick(mouseEvent);
            }
        }
    },

    OnClick: function(mouseEvent){
        for(var i = 0; i < this.onClick.length; i++){
            this.onClick[i](mouseEvent);
        }

        this.UpdateRaycast('OnClick');
    },

    OnRightClick: function(mouseEvent){
        //mouseEvent.preventDefault();
        this.UpdateScreenAndMouse(mouseEvent);
        for(var i = 0; i < this.onRightClick.length; i++){
            this.onRightClick[i](mouseEvent);
        }

        this.UpdateRaycast('OnRightClick');
    },

    OnMouseMove: function(mouseEvent){
        this._mouse.x = THREE.Math.clamp(mouseEvent.clientX - this.screen.left, 0, this.screen.width);
        this._mouse.y = THREE.Math.clamp(mouseEvent.clientY - this.screen.top, 0, this.screen.height);
        this.ExecuteDelayedMD(mouseEvent);
    },

    OnScroll: function(event){
        this.screenNeedsUpdate = true;
    },

    OnMouseWheel: function(mouseEvent){
        mouseEvent.preventDefault();
        var delta = THREE.Math.clamp(mouseEvent.wheelDelta || -mouseEvent.detail, -1, 1);
        this.fov.target = THREE.Math.clamp(this.fov.target - delta * 2., this.fov.min, this.fov.max);
        this.fov.lerp = 0;
    },

    LerpZoom: function(){
        this.fov.lerp += .1;
        if(this.fov.lerp >= 1 || Number.isNaN(this.fov.lerp)){
            return;
        }
        this.camera.fov += (this.fov.target - this.camera.fov) * this.fov.lerp;
        this.camera.updateProjectionMatrix();
    },

    OnResize: function(event) {
        this.screenNeedsUpdate = true;
        this.cameraNeedsUpdate = true;
    },

    RemoveEventCallback: function(eventType, callback){
        var callbacks = this[eventType];
        for(var iCallback = 0; iCallback < callbacks.length; iCallback++){
            if(callbacks[iCallback] === callback){
                callbacks.splice(iCallback, 1);
            }
        }
    },

    Update: function(){
        this.UpdateScreenAndMouse();

        this.FireOnce();

        // Raycasts
        this.UpdateRaycaster();
        this.UpdateRaycast('Update');

        var now = this.clock.getElapsedTime();
        for(var iUpdate = 0; iUpdate < this.update.length; iUpdate++){
            var update = this.update[iUpdate];
            if(update.callback === undefined){
                update();
            }
            else if(now - update.last > update.interval){
                update.callback();
                update.last = now;
            }
        }
    },

    Update25: function(){
        this.LerpZoom();
        this.UpdateRaycast('Update25');
    },

    Update10: function(){
        this.UpdateRaycast('Update10');
    },

    FireOnce: function(){
        for(var iCallback = this.fireOnce.length; iCallback-- > 0;){
            this.fireOnce[iCallback]();
        }
        this.fireOnce.length = 0;
    },

    DelayedAction: function(action, delay){
        var drid = window.setTimeout(function(){
            action();
        }, delay);
        return drid;
    },

    AbortDelayedAction(drid){
        window.clearTimeout(drid);
        return;
    },

    Repeat: function(action, interval){
        if(this._repeats === undefined) this._repeats = [];
        var drid = window.setInterval(function(){
            action();
        }, interval);
        this._repeats.push({action:action, drid:drid});
        return drid;
    },

    StopRepeat: function(action){
        if(this._repeats === undefined) return;
        if(typeof action === 'number'){
            window.clearInterval(action);
            return;
        }
        for(var i = 0; i < this._repeats.length; i++){
            if(this._repeats[i].action === action){
                window.clearInterval(this._repeats[i].drid);
                this._repeats.splice(i, 1);
                return;
            }
        }
    },

    UpdateScreenAndMouse: function(mouseEvent){
        if(this.screenNeedsUpdate) {
            this.ComputeScreen();
            this.screenNeedsUpdate = false;
        }
        if(this.cameraNeedsUpdate) {
            for(var i = 0; i < this.onResize.length; i++){
                this.onResize[i](this.screen);
            }
            this.cameraNeedsUpdate = false;
        }

        if(mouseEvent !== undefined){
            this._mouse.x = THREE.Math.clamp(mouseEvent.clientX - this.screen.left, 0, this.screen.width);
            this._mouse.y = THREE.Math.clamp(mouseEvent.clientY - this.screen.top, 0, this.screen.height);
        }

        this.mouseScreen.x = this._mouse.x;
        this.mouseScreen.y = this._mouse.y;

        this.mouseViewport.x = this._mouse.x / this.screen.width * 2 - 1;
        this.mouseViewport.y = -this._mouse.y / this.screen.height * 2 + 1;
    },

    RaycastTest: function(objects, recursive){
        this.UpdateRaycaster();
        recursive = recursive !== undefined ? recursive : false;
        var intersects = objects instanceof Array ? this.raycaster.intersectObjects(objects, recursive) : this.raycaster.intersectObject(objects, recursive);
        if (intersects.length > 0) {
            return intersects[0];
        }
        return undefined;
    },

    AddRaycastGroup: function(event, groupID, group){
        if(this._raycastGroups[event][groupID] !== undefined) console.log('RaycastGroup ' + groupID + ' is being overwritten.');
        this._raycastGroups[event][groupID] = group;
    },

    RemoveRaycastGroup: function(event, groupID){
        delete this._raycastGroups[event][groupID];
    },

    UpdateRaycaster: function(){
        this.camera.updateMatrixWorld();
        this.raycaster.setFromCamera(this.mouseViewport, this.camera);
    },

    UpdateRaycast: function(event){
        var raycastGroupsKeys = Object.keys(this._raycastGroups[event]);
        var numRaycastGroups = raycastGroupsKeys.length;
        if(numRaycastGroups > 0){
            for(var iGroup = 0; iGroup < numRaycastGroups; iGroup++){
                var key = raycastGroupsKeys[iGroup];
                this._raycastGroups[event][key].Raycast(this.raycaster);
            }
        }
    }
};

// Cik.Input.RaycastGroup(items, callback, collectionQuery, updateProperty, recursive, continuous)
Cik.Input.RaycastGroup = function(items, callback, collectionQuery, updateProperty, recursive, continuous){
    this.enabled = true;

    this.items = items;
    this.callback = callback;
    this.updateProperty = updateProperty !== undefined ? updateProperty : false;
    this.recursive = recursive !== undefined ? recursive : false;
    this.continuous = continuous !== undefined ? continuous : false;

    if(collectionQuery === undefined){
        this.raycastItems = this.items;
    }
    else{
        this.raycastItems = [];
        this.collectionQuery = collectionQuery;
        this.GetRaycastItems(this.collectionQuery);
    }
}

Object.assign(Cik.Input.RaycastGroup.prototype, {
    constructor: Cik.Input.RaycastGroup,

    GetRaycastItems: function(collectionQuery){
        for(var iItem = 0; iItem < this.items.length; iItem++){
            var rItem = collectionQuery(this.items[iItem]);
            if(rItem !== undefined){
                this.raycastItems.push(rItem);
            }
            else{
                this.items.splice(iItem, 1);
                Cik.Log('raycastItem is undefined, entry removed from .items array');
            }
        }
    },

    UpdateItems: function(items, collectionQuery){
        this.items = items;
        if(collectionQuery === undefined) collectionQuery = this.collectionQuery;

        if(collectionQuery === undefined){
            this.raycastItems = this.items;
        }
        else{
            this.raycastItems.length = 0;
            this.collectionQuery = collectionQuery;
            this.GetRaycastItems(this.collectionQuery);
        }
    },

    Raycast: function(raycaster){
        if(this.enabled === false) return;

        var raycastItems;
        if(this.updateProperty){
            raycastItems = [];
            for(var i = 0; i < this.raycastItems.length; i++) raycastItems[i] = this.collectionQuery(this.items[i]);
        }
        else{
            raycastItems = this.raycastItems;
        }
        // if ( object.visible === false || object.parent === null) return; in THREE.Raycaster.intersectObject()
        var intersects = raycaster.intersectObjects(raycastItems, this.recursive);
        if (intersects.length > 0) {
            var raycastItemIndex = this.BubbleUpForIndex(intersects[0].object, raycastItems);
            if(raycastItemIndex !== -1) this.callback(this.items[raycastItemIndex], intersects[0]);
        }
        else if(this.continuous) {
            this.callback(false);
        }
    },

    BubbleUpForIndex: function(child, collection){
        var nestLimit = 100;
        var numCollection = collection.length;
        while(child !== null && nestLimit-- > 0){
            for(var i = 0; i < numCollection; i++) if(collection[i] === child) return i;
            child = child.parent;
        }
        return -1;
    }
});