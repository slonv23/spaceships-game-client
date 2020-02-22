/**
 * @typedef {import('three')} THREE
 * @typedef {import('../input/Mouse').default} Mouse
 * @typedef {import('../input/Keyboard').default} Keyboard
 */

import * as THREE from "three";

import AbstractControls from "./AbstractControls";
import browserKeycodes from "../util/browser-keycodes";
import FlyingObject from "../physics/object/FlyingObject";

export default class SpaceShipControls extends AbstractControls {

    // TODO move these constants from FlyingObject
    static wYawMax = 0.0006;
    static wPitchMax = 0.0006;

    /** determines how fast wYaw and wPitch are converge to their target values
     * target values are calculated based on current mouse position */
    static angularVelocityConvergeSpeed = 0.000001;

    /** @type {Mouse} */
    mouse;

    /** @type {Keyboard} */
    keyboard;

    circleRadius;

    /** @type {THREE.Vector3} */
    cameraX = new THREE.Vector3();

    /** @type {THREE.Vector3} */
    cameraY = new THREE.Vector3();

    /** @type {THREE.Vector3} */
    cameraZ = new THREE.Vector3();

     /**
      * @param {Mouse} mouseInterface 
      * @param {Keyboard} keyboardInterface 
      */
    constructor(mouseInterface, keyboardInterface) {
        super();

        this.mouse = mouseInterface;
        this.keyboard = keyboardInterface;
        this.circleRadius = Math.min(window.innerWidth, window.innerHeight) * 0.2;
        this.circleRadiusSq = this.circleRadius ** 2;
    }

    /**
     * @param {THREE.PerspectiveCamera} camera 
     * @param {THREE.Object3D} object3d 
     */
    init(camera, object3d) {
        super.init(camera, object3d);
        this.camera.matrixWorld.extractBasis(this.cameraX, this.cameraY, this.cameraZ);
    }

    /**
     * @param {number} delta
     */
    updateCamera(delta) {
        this._updateRotationSpeed();
        this._updateAngularVelocity(delta);
        this._updateMatrixWorld(this.camera.matrixWorld);
        this.camera.updateMatrixWorld();
    }

    _updateRotationSpeed() {
        const pressedKey = this.keyboard.getFirstPressedKey();
        if (pressedKey === browserKeycodes.ARROW_LEFT) {
            this.gameObject.rotationAcceleration = FlyingObject.rotationAccelerationAbs;
        } else if (pressedKey === browserKeycodes.ARROW_RIGHT) {
            this.gameObject.rotationAcceleration = -FlyingObject.rotationAccelerationAbs;
        } else {
            this.gameObject.rotationAcceleration = 0;
        }
    }

    _updateAngularVelocity(delta) {
        const mousePos = this._calcMousePosInDimlessUnits();
        
        let wPitchTarget = -mousePos[1] * _self.wPitchMax,
            wYawTarget = mousePos[0] * _self.wYawMax;

        let wPitchIncreaseDirection = Math.sign(wPitchTarget - this.gameObject.wPitch),
            wYawIncreaseDirection = Math.sign(wYawTarget - this.gameObject.wYaw);

        let wPitchNew = this.gameObject.wPitch + wPitchIncreaseDirection * _self.angularVelocityConvergeSpeed * delta,
            wYawNew = this.gameObject.wYaw + wYawIncreaseDirection * _self.angularVelocityConvergeSpeed * delta;

        this.gameObject.wPitch = (wPitchIncreaseDirection < 0) != (wPitchNew > wPitchTarget)  ? wPitchTarget : wPitchNew;
        this.gameObject.wYaw = (wYawIncreaseDirection < 0) != (wYawNew > wYawTarget)  ? wYawTarget : wYawNew;
    }

    /**
     * @param {THREE.Matrix4} matrixWorld 
     */
    _updateMatrixWorld(matrixWorld) {
        const lenBetweenSpaceshipAndPosLookAt = 10, lenBetweenCameraAndPosLookAt = 8, // target
            posLookAt = this.gameObject.object3d.position.clone().addScaledVector(this.gameObject.nz, -lenBetweenSpaceshipAndPosLookAt);

        let cameraTargetDirection = posLookAt.clone().sub(this.camera.position).normalize();
        let spaceshipDirection = this.gameObject.object3d.position.clone().sub(this.camera.position);
        let lengthToTargetPos = spaceshipDirection.length();

        this.cameraZ.copy(cameraTargetDirection.clone().negate());

        let lenToPosLookAtTargetDiffActual = lengthToTargetPos - lenBetweenCameraAndPosLookAt;
        let multiplier = 0;
        if (lenToPosLookAtTargetDiffActual > 0) {
            multiplier = Math.min(lenToPosLookAtTargetDiffActual, 0.1 * lengthToTargetPos / lenBetweenCameraAndPosLookAt);
        } else {
            multiplier = Math.max(lenToPosLookAtTargetDiffActual, -0.1 * lenBetweenCameraAndPosLookAt / lengthToTargetPos);
        }

        this.camera.position.copy(this.camera.position.clone()
            .add(cameraTargetDirection.multiplyScalar(multiplier)));

        // vector which lies in rotation plane and perpendicular to velocity
        let normalToVelocity = this.gameObject.nx.clone().multiplyScalar(this.gameObject.wYaw).add(
            this.gameObject.ny.clone().multiplyScalar(this.gameObject.wPitch)
        ).normalize();

        // normal to rotation plane (of the camera, because camera direction is different from velocity direction), will be y-axis of camera
        let normalToRotationPlane = normalToVelocity.clone().cross(this.gameObject.nz).multiplyScalar(-1);
    
        // TODO add .assert that vector is normalized

        // normalToRotationPlane is always parallel to x-axe (the normal to the side) of spaceship, we need to adjust it
        this.cameraY = normalToRotationPlane.multiplyScalar(this.gameObject.wYaw).add(
            normalToVelocity.clone().multiplyScalar(this.gameObject.wPitch)
        ).normalize();

        this.cameraX = this.cameraY.clone().cross(this.gameObject.nz);

        // cameraX and cameraY calculated based on gameObject.nz
        // we are intented to use cameraZ instead of gameObject.nz
        // so we must transform cameraX and cameraY from one coordinate system to another
        this.rotateBasisVectors();

        // adjust camera so spaceship will be a bit below the center of the window
        const L = 2;
        let newCameraY = L;
        let newCameraZ = Math.sqrt(3) * L;
        let cameraPosAdjusted = new THREE.Vector3(0, newCameraY, newCameraZ);
        cameraPosAdjusted.copy(this.cameraY.clone().multiplyScalar(cameraPosAdjusted.y).add(
            this.cameraZ.clone().multiplyScalar(cameraPosAdjusted.z).add(this.camera.position)
        ));

        matrixWorld.makeBasis(this.cameraX, this.cameraY, this.cameraZ);
        matrixWorld.setPosition(cameraPosAdjusted);
    }

    rotateBasisVectors() {
        let normal = this.gameObject.nz.clone().cross(this.cameraZ);
        let cosphi = this.gameObject.nz.dot(this.cameraZ),
            sinphi = normal.length();

        normal.normalize();

        let cosphidiv2 = Math.sqrt((cosphi + 1) / 2),
            sinphidiv2 = sinphi/ (2 * cosphidiv2);
        let quaternion = new THREE.Quaternion(sinphidiv2 * normal.x, sinphidiv2 * normal.y, sinphidiv2 * normal.z, cosphidiv2);

        this.cameraX.applyQuaternion(quaternion);
        this.cameraY.applyQuaternion(quaternion);
    }

    /**
     * @returns {number[]} mouse position where x and y є [-1 1]
     */
    _calcMousePosInDimlessUnits() {
        const mousePos = this.mouse.position.slice();

        // sphere bounded
        var distFromCenterSq = mousePos[0]*mousePos[0] + mousePos[1]*mousePos[1];
        if (distFromCenterSq > this.circleRadiusSq) {
            var dimlessDist = this.circleRadius / Math.sqrt(distFromCenterSq);
            mousePos[0] = dimlessDist * mousePos[0];
            mousePos[1] = dimlessDist * mousePos[1];
        }
        mousePos[0] /= this.circleRadius;
        mousePos[1] /= this.circleRadius;

        return mousePos;
    }

}

const _self = SpaceShipControls;