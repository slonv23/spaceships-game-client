import * as THREE from 'three';

import AbstractObject from "./AbstractObject";

export default class FlyingObject extends AbstractObject {

    static wYawMax = 0.0006;

    static wPitchMax = 0.0006;

    static rotationSpeedMax = 0.01;

    static rotationAccelerationAbs = 0.00001;

    wYaw = 0; // Yaw angular velocity, relative to x-axe
    wPitch = 0; // Pitch angular velocity, relative to y-axe
    wRoll = 0;

    quaternion = new THREE.Quaternion();

    /** @type {THREE.Vector3} z axis */
    nz = (new THREE.Vector3(0, 0, 1));

    /** @type {THREE.Vector3} normal to the side of the ship, local x-axis (right side) */
    nx = new THREE.Vector3(1, 0, 0);

    /** @type {THREE.Vector3} normal to the top of the ship, local y-axis */
    ny = new THREE.Vector3(0, 1, 0);

    nxFake = new THREE.Vector3(1, 0, 0);

    nyFake = new THREE.Vector3(0, 1, 0);

    speedAbs = -0.005;

    rotationSpeed =  0;

    rotationAcceleration = 0;

    /**
     * @param {THREE.Object3D} object3d 
     */
    constructor(object3d) {
        super(object3d);
        this.quaternion.setFromAxisAngle(new THREE.Vector3(1, 1, 1), 0);
    }

    update(delta) {
        if (this.rotationAcceleration === 0) {
            this.rotationSpeed -= (this.rotationSpeed != 0 ? (Math.sign(this.rotationSpeed) * _self.rotationAccelerationAbs * delta) : 0);
        } else {
            this.rotationSpeed += this.rotationAcceleration * delta;
            if (Math.abs(this.rotationSpeed) > _self.rotationSpeedMax) {
                this.rotationSpeed = Math.sign(this.rotationSpeed) * _self.rotationSpeedMax;
            }
        }

        /** Update quaternion */
        let multiplier = 0.5 * delta;
        // use multiplier for rotation speed!! :
        // this.quaternion.multiply(new THREE.Quaternion(this.wPitch * multiplier, -this.wYaw * multiplier, this.rotationSpeed * multiplier, 1));
        this.quaternion.multiply(new THREE.Quaternion(this.wPitch * multiplier, -this.wYaw * multiplier, this.rotationSpeed * multiplier, 1));
        this.quaternion.normalize();

        /** Update axes */
        this.nx = (new THREE.Vector3(1, 0, 0)).applyQuaternion(this.quaternion);
        this.ny = (new THREE.Vector3(0, 1, 0)).applyQuaternion(this.quaternion);
        this.nz = (new THREE.Vector3(0, 0, 1)).applyQuaternion(this.quaternion);

        this.updateFakeAxes();
        this.object3d.matrix.makeBasis(this.nxFake, this.nyFake, this.nz);
        // this.object3d.matrix.makeBasis(this.nx, this.ny, this.nz);
        // this.object3d.matrix.makeRotationFromQuaternion(this.quaternion);

        /** Update position */
        this.object3d.position.addScaledVector(this.nz, this.speedAbs * delta);
        this.object3d.matrix.setPosition(this.object3d.position);
    }

    updateFakeAxes() {
        let tx = this.wYaw / _self.wYawMax / 2,
            ty = Math.sqrt(1 - tx * tx);

        this.nyFake.copy(this.nx.clone().multiplyScalar(tx).addScaledVector(
                this.ny,
                ty
            ));

        this.nxFake.copy(this.nx.clone().multiplyScalar(ty).addScaledVector(
            this.ny,
            -tx
        ));
    }

}

const _self = FlyingObject;
