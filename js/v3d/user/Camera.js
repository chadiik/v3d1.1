
V3d.Camera = function(params){
    this.params = params;

    var scope = this;
    Cik.Input.onInit.push(function(){
        Cik.Input.keyboard.on('space', function(){
            scope.ToggleControls();
        });
    });
};

Object.assign(V3d.Camera.prototype, {
    FirstPersonControls: function(container, params){
        if(this.fpsControls === undefined && container !== undefined){
            this.fpsControls = new V3d.Navigation.FirstPerson(this.camera, container);

            this.fpsControls.Hold = function(){
                this.enabled = false;
            };
            this.fpsControls.Release = function(){
                this.enabled = true;
            };
        }
        
        if(this.fpsControls !== undefined){
            if(params !== undefined){
                this.fpsControls.speed.set(params.speedX, params.speedY);
                this.fpsControls.damping = params.damping;
                this.fpsControls.momentum = params.momentum;
                this.fpsControls.limitPhi = params.limitPhi;
                this.fpsControls.moveSpeed = params.moveSpeed;
                this.fpsControls.keyControls = true;
            }

            this.controls = this.fpsControls;
        }
    },

    OrbitControls: function(container, params){
        if(this.orbitControls === undefined && container !== undefined){
            this.orbitControls = new THREE.OrbitControls(this.camera, container);
            this.orbitControls.target = new THREE.Vector3();
            var scope = this;
            this.orbitControls.Update = function(){
                if(this.enabled){
                    if(this.object.position.distanceTo(this.target) < 50){
                        var v = new THREE.Vector3().subVectors(this.target, this.object.position).multiplyScalar(.5);
                        this.target.add(v);
                    }
                    this.update();
                }
            };
            this.orbitControls.Hold = function(){
                this.enabled = false;
            };
            this.orbitControls.Release = function(){
                this.enabled = true;
            };
        }

        if(this.orbitControls !== undefined){
            params = {
                maxDistance: 9000.0 * /*units*/1,
                maxPolarAngle: Math.PI * 0.895
            }
            if(params !== undefined){
                this.orbitControls.maxDistance = params.maxDistance;
                this.orbitControls.maxPolarAngle = params.maxPolarAngle;
                this.orbitControls.autoRotate = false;
            }

            this.controls = this.orbitControls;
        }
    },

    ToggleControls: function(){
        this.Hold();

        if(this.controls === this.orbitControls){
            if(this.fpsControls){
                this.fpsControls.LerpRotation(this.camera, 1);
                this.FirstPersonControls();
            }
        }
        else{
            if(this.orbitControls){
                this.OrbitControls();

                // target
                var maxDistance = 100;
                var raycaster = new THREE.Raycaster();
                raycaster.far = maxDistance;
                raycaster.setFromCamera(new THREE.Vector2(0, 0), this.camera);
                var intersects = raycaster.intersectObjects(V3d.Loop.GetActiveScene().children, true);

                var point;
                if(intersects.length > 0){
                    point = intersects[0].point;
                }
                else{
                    point = new THREE.Vector3(0, 0, -1);
                    var quat = new THREE.Quaternion();
                    point.applyQuaternion(this.camera.getWorldQuaternion(quat)).normalize().multiplyScalar(maxDistance * .5).add(this.camera.position);
                }

                this.SetTarget(point);
            }
        }

        this.Release();
    },

    SetTarget: function(position){
        if(this.controls instanceof THREE.OrbitControls){
            this.controls.target.copy(position);
        }
        else {
            console.warn('SetTarget not implemented for control type:', this.controls);
        }
    },

    Update: function(){
        if(this.controls !== undefined){
            this.controls.Update();
        }
    },

    Hold: function(){
        if(this.controls !== undefined && this.controls.Hold){
            this.controls.Hold();
        }
    },

    Release: function(){
        if(this.controls !== undefined && this.controls.Release){
            this.controls.Release();
        }
    }
});

V3d.User.Camera = function(params){
    V3d.Camera.call(this, params);

    this.camera = new THREE.PerspectiveCamera(this.params.fov, this.params.aspect, this.params.near, this.params.far);
    this.camera.name = 'UserCamera';
};

V3d.User.Camera.prototype = Object.assign(Object.create(V3d.Camera.prototype), {
    constructor: V3d.User.Camera
    
});

Object.defineProperty(V3d.User.Camera.prototype, 'position', {
    get: function(){
        return this.camera.position;
    },

    set: function(value){
        this.camera.position.copy(value);
    }
});