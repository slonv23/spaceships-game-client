import * as THREE from 'three';

import AbstractObject from "./AbstractObject";

export default class FlyingObject extends AbstractObject {

    static angularAccelerationAbs = new THREE.Vector3(-1, -1, 0.000005); // TODO add accelerations for other angular speeds

    static angularVelocityMax = new THREE.Vector3(0.0006, 0.0006, 0.002);

    /** @type {THREE.Vector3} components: (wYaw, wPitch, wRoll) */
    angularVelocity = new THREE.Vector3(0, 0, 0);

    angularAcceleration = new THREE.Vector3(0, 0, 0);

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

    /**
     * @param {THREE.Object3D} object3d 
     */
    constructor(object3d) {
        super(object3d);
        this.quaternion.setFromAxisAngle(new THREE.Vector3(1, 1, 1), 0);
    }

    update(delta) {
        if (this.angularAcceleration.z === 0) {
            // if no accelaration smoothly stop rotating
            this.angularVelocity.z -= (this.angularVelocity.z != 0 ? (Math.sign(this.angularVelocity.z) * self.angularAccelerationAbs.z * delta) : 0);
        } else {
            this.angularVelocity.z += this.angularAcceleration.z * delta;
            if (Math.abs(this.angularVelocity.z) > self.angularVelocityMax.z) {
                this.angularVelocity.z = Math.sign(this.angularVelocity.z) * self.angularVelocityMax.z;
            }
        }

        /** Update quaternion */
        let multiplier = 0.5 * delta;

        let axis = new THREE.Vector3( 0, 0, 1);
        let angle = Math.PI / 4;
        let angularVelocityAdjusted = this.angularVelocity.clone().applyAxisAngle(axis, angle);

        this.quaternion.multiply(new THREE.Quaternion(angularVelocityAdjusted.y * multiplier,
                                                      -angularVelocityAdjusted.x * multiplier,
                                                      angularVelocityAdjusted.z * multiplier,
                                                      1));
        this.quaternion.normalize();

        /** Update axes */
        this.nx = (new THREE.Vector3(1, 0, 0)).applyQuaternion(this.quaternion);
        this.ny = (new THREE.Vector3(0, 1, 0)).applyQuaternion(this.quaternion);
        this.nz = (new THREE.Vector3(0, 0, 1)).applyQuaternion(this.quaternion);

        // this.updateFakeAxes();
        // this.object3d.matrix.makeBasis(this.nxFake, this.nyFake, this.nz);

        this.object3d.matrix.makeBasis(this.nx, this.ny, this.nz);
        // this.object3d.matrix.makeRotationFromQuaternion(this.quaternion);

        /** Update position */
        this.object3d.position.addScaledVector(this.nz, this.speedAbs * delta);
        this.object3d.matrix.setPosition(this.object3d.position);
    }

    updateFakeAxes() {
        // this.nyFake.copy(this.ny.clone());
        // this.nxFake.copy(this.nx.clone());

        let tx = this.wYaw / self.wYawMax / 4,
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

const self = FlyingObject;
