
V3d.Navigation.FirstPerson = function(camera, domElement){
    this.camera = camera;
    this.domElement = domElement;
    this.drag = {state:false, x:0, y:0, deltaX:0, deltaY:0, mx:0, my:0};
    this.rotation = {matrixX:new THREE.Matrix4(), matrixY:new THREE.Matrix4(), theta:0, phi:0, targetTheta:0, targetPhi:0};
    this.override = {quaternion:null, value:0};

    // parameters
    this.enabled = true;
    this.speed = new THREE.Vector2(1, 1);
    this.damping = 1;
    this.momentum = 0;
    this.limitPhi = Number.MAX_VALUE - 10;

    this.keyControlsEnabled = false;
    this.keys = { LEFT: 37, UP: 38, RIGHT: 39, DOWN: 40, A: 65, W: 87, D: 68, S: 83 };
    this.quat = new THREE.Quaternion();
    this.vec3 = new THREE.Vector3();
    this.moveSpeed = 1;
    this.movingFwd = 0;
    this.movingSide = 0;

    var scope = this;
    if(this.domElement !== undefined){
        var onMouseDown = this.OnMouseDown.bind(this);
        var onMouseUp = this.OnMouseUp.bind(this);
        var onMouseMove = this.OnMouseMove.bind(this);
        this.domElement.addEventListener('mousedown', onMouseDown);
        document.addEventListener('mouseup', onMouseUp);
        this.domElement.addEventListener('mousemove', onMouseMove);

        this.dispose = function(){
            this.domElement.removeEventListener('mousedown', onMouseDown);
            document.removeEventListener('mouseup', onMouseUp);
            this.domElement.removeEventListener('mousemove', onMouseMove);
            this.keyControls = false;
        };
    }

    //
    window.SetTheta = this.SetTheta.bind(this);
    window.SetPhi = this.SetPhi.bind(this);
};

Object.assign(V3d.Navigation.FirstPerson.prototype, {
    constructor: V3d.Navigation.FirstPerson,

    OnKeyDown: function(e){
        switch(e.keyCode){
            case this.keys.UP:
            case this.keys.W:
            this.movingFwd = 1;
            break;

            case this.keys.DOWN:
            case this.keys.S:
            this.movingFwd = -1;
            break;

            case this.keys.RIGHT:
            case this.keys.D:
            this.movingSide = 1;
            break;

            case this.keys.Left:
            case this.keys.A:
            this.movingSide = -1;
            break;
        }
    },

    OnKeyUp: function(e){
        switch(e.keyCode){
            case this.keys.UP:
            case this.keys.DOWN:
            case this.keys.W:
            case this.keys.S:
            this.movingFwd = 0;
            break;

            case this.keys.RIGHT:
            case this.keys.D:
            case this.keys.Left:
            case this.keys.A:
            this.movingSide = 0;
            break;
        }
    },

    MoveForward: function(front){
        this.vec3.set(0, 0, -1);
        this.vec3.applyQuaternion(this.camera.getWorldQuaternion(this.quat)).normalize().multiplyScalar(this.moveSpeed * front);
        this.vec3.y = 0;
        this.camera.position.add(this.vec3);
    },

    MoveSideways: function(side){
        this.vec3.set(0, 0, -1);
        this.vec3.applyQuaternion(this.camera.getWorldQuaternion(this.quat)).normalize().multiplyScalar(this.moveSpeed * side);
        this.vec3.set(-this.vec3.z, 0, this.vec3.x);
        this.camera.position.add(this.vec3);
    },

    UpdateMovement: function(){
        if(Math.abs(this.movingFwd) > .1){
            this.MoveForward(this.movingFwd);
        }
        if(Math.abs(this.movingSide) > .1){
            this.MoveSideways(this.movingSide);
        }
    },

    OnMouseDown: function(e){
        this.StartMove(e.clientX, e.clientY);
    },

    OnMouseUp: function(e){
        this.EndMove(e.clientX, e.clientY);
    },

    OnMouseMove: function(e){
        this.drag.mx = e.clientX;
        this.drag.my = e.clientY;
    },

    StartMove: function(x, y){
        this.drag.state = true;
        this.drag.x = x;
        this.drag.y = y;
    },

    EndMove: function(x, y){
        this.Update();
        this.drag.state = false;
    },

    SetTheta: function(theta){
        var pi = Math.PI;
        var d = this.rotation.targetTheta % (pi * 2);
        if(d > pi) d = pi * 2 - d;
        this.rotation.targetTheta = this.rotation.targetTheta - d + theta;
    },

    SetPhi: function(phi){
        var pi = Math.PI;
        var d = this.rotation.targetPhi % (pi * 2);
        if(d > pi) d = pi * 2 - d;
        this.rotation.targetPhi = this.Limit(this.rotation.targetPhi - d + phi, this.limitPhi);
    },

    LerpRotation: function(object, t){
        this.drag.state = false;
        //this.drag.deltaX = this.drag.deltaY = 0;

        var halfPI = Math.PI * .5;
        var two_pi = Math.PI * 2;
        var oldTheta = this.rotation.targetTheta;
        var oldPhi = this.rotation.targetPhi;

        this.vec3.set(0, 0, -1);
        this.vec3.applyQuaternion(object.getWorldQuaternion(this.quat)).normalize();
        var forward = this.vec3;
        var wRight = new THREE.Vector3(1, 0, 0);

        var theta = Math.atan2(-forward.z, forward.x) - halfPI;
        var d = Math.abs(this.rotation.targetTheta - theta);
        this.rotation.targetTheta = theta;
        //console.log(this.FP(this.rotation.targetTheta), this.FP(theta));

        var vx = forward.x * forward.x;
        var vz = forward.z * forward.z;
        var ds = vx * vx + vz * vz;
        var phi = Math.atan2(forward.y, Math.sqrt(ds));
        phi = this.Limit(phi, this.limitPhi);
        this.rotation.targetPhi = phi;
        //console.log(this.FP(this.rotation.targetPhi), this.FP(phi));
    },

    FP: function(a){
        return Math.floor(a * 1800 / Math.PI) / 10;
    },

    Limit: function(a, limit){
        if(a > Math.PI) return Math.max(Math.PI * 2 -limit, a);
        return Math.min(limit, a);
    },

    AngularDisplacement: function(angle1, angle2){
        var diff = ( (angle2 - angle1) * 180 / Math.PI + 180 ) % 360 - 180;
        return (diff < -180 ? diff + 360 : diff) * Math.PI / 180;
    },

    Update: function(){
        if(!this.enabled) return;

        if(this.drag.state){
            var dx = this.drag.mx - this.drag.x;
            var dy = this.drag.my - this.drag.y;

            this.drag.x = this.drag.mx;
            this.drag.y = this.drag.my;

            dx *= this.speed.x;
            dy *= this.speed.y;

            this.drag.deltaX = this.drag.deltaX + (dx - this.drag.deltaX) * this.damping;
            this.drag.deltaY = this.drag.deltaY + (dy - this.drag.deltaY) * this.damping;
        }

        var theta = this.rotation.targetTheta,
            phi = this.rotation.targetPhi;

        theta += this.drag.deltaX;
        phi = this.Limit(this.rotation.targetPhi + this.drag.deltaY, this.limitPhi);

        var two_pi = Math.PI * 2;

        theta = theta % two_pi;
        if(theta < 0) theta += two_pi;
        phi = phi % two_pi;
        if(phi < 0) phi += two_pi;
        
        var EPS = 0.000001;
        theta = Math.max(EPS, Math.min(two_pi - EPS, theta));
        phi = Math.max(EPS, Math.min(two_pi - EPS, phi));
        
        this.rotation.targetTheta = theta;
        this.rotation.targetPhi = phi;

        this.drag.deltaX *= this.momentum;
        this.drag.deltaY *= this.momentum;

        theta = this.rotation.theta;
        theta = theta + this.AngularDisplacement(theta, this.rotation.targetTheta) * this.damping;
        phi = this.rotation.phi;
        phi = phi + this.AngularDisplacement(phi, this.rotation.targetPhi) * this.damping;

        theta = theta % two_pi;
        if(theta < 0) theta += two_pi;
        phi = phi % two_pi;
        if(phi < 0) phi += two_pi;

        this.rotation.theta = theta;
        this.rotation.phi = phi;

        this.rotation.matrixY.makeRotationY(theta);
        this.rotation.matrixX.makeRotationX(phi).premultiply(this.rotation.matrixY);
        this.camera.rotation.setFromRotationMatrix(this.rotation.matrixX);

        if(this.override.value > 0) this.camera.quaternion.slerp(this.override.quaternion, this.override.value);

        this.UpdateMovement();
    }
});

Object.defineProperties(V3d.Navigation.FirstPerson.prototype, {
    keyControls: {
        get: function(){
            return this.keyControlsEnabled;
        },

        set: function(value){
            if(value){
                if(this.onKeyDown === undefined){
                    this.onKeyDown = this.OnKeyDown.bind(this);
                    this.onKeyUp = this.OnKeyUp.bind(this);
                }
                window.addEventListener('keydown', this.onKeyDown, false);
                window.addEventListener('keyup', this.onKeyUp, false);
            }
            else if(this.onKeyDown !== undefined){
                window.removeEventListener('keydown', this.onKeyDown, false);
                window.removeEventListener('keyup', this.onKeyUp, false);
            }
            this.keyControlsEnabled = value;
        }
    }
});