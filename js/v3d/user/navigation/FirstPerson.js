
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
        };
    }

    //
    window.SetTheta = this.SetTheta.bind(this);
    window.SetPhi = this.SetPhi.bind(this);
};

Object.assign(V3d.Navigation.FirstPerson.prototype, {
    constructor: V3d.Navigation.FirstPerson,

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

        object.updateMatrixWorld();
        var forward = new THREE.Vector3();
        object.forward.getWorldPosition(forward);
        forward.sub(object.position);
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
    }
});