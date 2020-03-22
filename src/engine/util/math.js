/**
 * @typedef {import('three')} THREE
 */

/**
 * Returns a vector that is deviated from vd1 by a given angle 'fi'(in radian)
 * and lies in the plane formed by the vectors vd0, vd1.
 * 
 * @param {THREE.Vector3} vd0 - normalized
 * @param {THREE.Vector3} vd1 - normalized
 * @param {number} fi - angle in radians
 * @returns {THREE.Vector3} - normalized
 */
export function rotateWithinPlane(vd0, vd1, fi) {
    let k1, A, a, b;
    k1 = vd0.dot(vd1);
    A = Math.cos(fi);
    // counterclockwise:
    // b = -(k1*Math.sqrt(-(- A*A + 1)*(k1*k1 - 1)) - A*k1*k1 + A)/(k1*k1 - 1);
    // clockwise:
    b = (k1*Math.sqrt(-(- A*A + 1)*(k1*k1 - 1)) + A*k1*k1 - A)/(k1*k1 - 1);
    a = (A - b) / k1;

    let result = vd0.clone().multiplyScalar(a)
        .add(vd1.clone().multiplyScalar(b));
    return result;
}

export function radiansToDegrees(radians) {
    return 180 * radians / Math.PI;
}
