/**
 * @typedef {import('three')} THREE
 * @typedef {import('../input/Mouse').default} Mouse
 * @typedef {import('../input/Keyboard').default} Keyboard
 */

import * as THREE from "three";
import FlyingObject from "../physics/object/FlyingObject";
import browserKeycodes from "../util/browser-keycodes";
import AbstractControls from "./AbstractControls";
// import {radiansToDegrees} from "../util/math";

export default class SpaceShipControls extends AbstractControls {

    static lenBtwSpaceshipAndPosLookAt = 5;

    static lenBtwCameraAndPosLookAt = 8;

    /** determines how fast yaw and pitch speeds are converge to their target values
     * target values are calculated based on current mouse position */
    static angularVelocityConvergeSpeed = 0.000001;

    /** @type {Mouse} */
    mouse;

    /** @type {Keyboard} */
    keyboard;

    /** @type {FlyingObject} */
    gameObject

    /** user can change yaw and pitch by moving cursor to desired direction,
     * but only in specified limits */
    controlCircleRadius;
    controlCircleRadiusSq;

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
        this.controlCircleRadius = Math.min(window.innerWidth, window.innerHeight) * 0.2;
        this.controlCircleRadiusSq = this.controlCircleRadius ** 2;
    }

    /**
     * @param {THREE.PerspectiveCamera} camera 
     * @param {FlyingObject} gameObject 
     */
    init(camera, gameObject) {
        super.init(camera, gameObject);
        this.camera.matrixWorld.extractBasis(this.cameraX, this.cameraY, this.cameraZ);
    }

    /**
     * @param {number} delta
     */
    updateCamera(delta) {
        this._updateRotationAcceleration();
        this._updateYawAndPitchVelocities(delta);
        this._updateCamera(this.camera.matrixWorld, delta);

        this.camera.matrixWorldInverse.getInverse(this.camera.matrixWorld);
    }

    _updateRotationAcceleration() {
        const pressedKey = this.keyboard.getFirstPressedKey();
        if (pressedKey === browserKeycodes.ARROW_LEFT) {
            this.gameObject.angularAcceleration.z = FlyingObject.angularAccelerationAbs.z;
        } else if (pressedKey === browserKeycodes.ARROW_RIGHT) {
            this.gameObject.angularAcceleration.z = -FlyingObject.angularAccelerationAbs.z;
        } else {
            this.gameObject.angularAcceleration.z = 0;
        }
    }

    _updateYawAndPitchVelocities(delta) {
        const mousePos = this._calcMousePosInDimlessUnits();

        let wPitchTarget = -mousePos[1] * FlyingObject.angularVelocityMax.y,
            wYawTarget = mousePos[0] * FlyingObject.angularVelocityMax.x;

        let wPitchIncreaseDirection = Math.sign(wPitchTarget - this.gameObject.angularVelocity.y),
            wYawIncreaseDirection = Math.sign(wYawTarget - this.gameObject.angularVelocity.x);

        let wPitchNew = this.gameObject.angularVelocity.y + wPitchIncreaseDirection * self.angularVelocityConvergeSpeed * delta,
            wYawNew = this.gameObject.angularVelocity.x + wYawIncreaseDirection * self.angularVelocityConvergeSpeed * delta;

        this.gameObject.angularVelocity.y = (wPitchIncreaseDirection < 0) != (wPitchNew > wPitchTarget)  ? wPitchTarget : wPitchNew;
        this.gameObject.angularVelocity.x = (wYawIncreaseDirection < 0) != (wYawNew > wYawTarget)  ? wYawTarget : wYawNew;
    }

    _updateCamera(matrixWorld, delta) {
        const posLookAt = this._calcPosLookAt();

        let cameraTargetDirection = posLookAt.clone().sub(this.camera.position).normalize().negate();

        // difference between target and current camera directions
        let diff = cameraTargetDirection.clone().sub(this.cameraZ);

        // constant that controls the max difference of camera direction from spaceship direction
        const convergeCoef = 140;

        // move camera direction closer to camera target direction
        this.cameraZ.add(diff.multiplyScalar(diff.length() * convergeCoef)).normalize();

        this.camera.position.copy(posLookAt.clone().add(this.cameraZ.clone().multiplyScalar(self.lenBtwCameraAndPosLookAt)));

        // vector which lies in rotation plane and perpendicular to velocity
        let normalToVelocity = this.gameObject.nx.clone().multiplyScalar(this.gameObject.angularVelocity.x).add(
            this.gameObject.ny.clone().multiplyScalar(this.gameObject.angularVelocity.y)
        ).normalize();

        // normal to rotation plane (of the camera, because camera direction is different from velocity direction), will be y-axis of camera
        let normalToRotationPlane = normalToVelocity.clone().cross(this.gameObject.nz).multiplyScalar(-1);
    
        // TODO add .assert that vector is normalized

        // normalToRotationPlane is always parallel to x-axe (the normal to the side) of spaceship, we need to adjust it
        this.cameraY = normalToRotationPlane.multiplyScalar(this.gameObject.angularVelocity.x).add(
            normalToVelocity.clone().multiplyScalar(this.gameObject.angularVelocity.y)
        ).normalize();

        this.cameraX = this.cameraY.clone().cross(this.gameObject.nz);

        // cameraX and cameraY calculated based on gameObject.nz
        // we are intented to use cameraZ instead of gameObject.nz
        // so we must transform cameraX and cameraY from one coordinate system to another
        this._rotateBasisVectors();

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

    _calcPosLookAt() {
        return this.gameObject.object3d.position.clone().addScaledVector(this.gameObject.nz, -self.lenBtwSpaceshipAndPosLookAt)
    }

    _rotateBasisVectors() {
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

        // circle bounded
        var distFromCenterSq = mousePos[0]*mousePos[0] + mousePos[1]*mousePos[1];
        if (distFromCenterSq > this.controlCircleRadiusSq) {
            var dimlessDist = this.controlCircleRadius / Math.sqrt(distFromCenterSq);
            mousePos[0] = dimlessDist * mousePos[0];
            mousePos[1] = dimlessDist * mousePos[1];
        }
        mousePos[0] /= this.controlCircleRadius;
        mousePos[1] /= this.controlCircleRadius;

        return mousePos;
    }

}

const self = SpaceShipControls;
