import * as THREE from 'three';

import AssetManager from "./support/AssetManager";
import AbstractControls from "./control/AbstractControls";
import AbstractObject from "./physics/object/AbstractObject";

export default class Engine {

    scene;

    /** @type {THREE.PerspectiveCamera} */
    camera;

    renderer;

    /** @type {AbstractControls} */
    _controls = {
        updateCamera: () => {}
    };

    /** Timing */
    lastFrameTimeMs;
    maxFPS = 60;
    delta = 0;
    timestep = 1000 / 60;

    /** @type {AbstractObject[]} */
    allObjects = [];

    constructor(assetManager, diContainer) {
        this.assetManager = assetManager;
        this.diContainer = diContainer;
    }

    postConstruct({scene, camera, renderer, options} = {options: {useDefaultLight: true}}) {
        const width = window.innerWidth, height = window.innerHeight;

        if (!scene) {
            scene = new THREE.Scene();
        }
        if (!camera) {
            camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
        }
        if (!renderer) {
            renderer = new THREE.WebGLRenderer();
            renderer.setSize(window.innerWidth, window.innerHeight);
            window.document.body.appendChild(renderer.domElement);
        }

        this.scene = scene;
        this.sceneOrtho = new THREE.Scene();
        this.camera = camera;
        this.cameraOrtho = new THREE.OrthographicCamera(-width / 2, width / 2, height / 2, - height / 2, 1, 10);
        this.cameraOrtho.position.z = 10;
        this.camera.matrixAutoUpdate = false;
        this.renderer = renderer;
        this.renderer.autoClear = false;
        
        if (options.useDefaultLight) {
            const light = new THREE.HemisphereLight(0xbbbbff, 0x444422);
            light.position.set(0, 1, 0);
            this.scene.add(light);
        }

        return Promise.resolve();
    }

    startGameLoop() {
        requestAnimationFrame((timestamp) => {
            this.lastFrameTimeMs = timestamp;

            // initial drawing
            this.renderer.render(this.scene, this.camera);

            requestAnimationFrame(this.gameLoop);
        });
    }

    gameLoop = (timestamp) => {
        if (timestamp < this.lastFrameTimeMs + (1000 / this.maxFPS)) {
            requestAnimationFrame(this.gameLoop);
            return;
        }
        this.delta += timestamp - this.lastFrameTimeMs;
        this.lastFrameTimeMs = timestamp;
    
        while (this.delta >= this.timestep) {
            this.update(this.timestep);
            this.delta -= this.timestep;
        }

        this.renderer.clear();
        this.renderer.render(this.scene, this.camera);
        this.renderer.clearDepth();
        this.renderer.render(this.sceneOrtho, this.cameraOrtho);

        requestAnimationFrame(this.gameLoop);
    };

    
    update(delta) {
        let objectsCount = this.allObjects.length;
        for (let i = 0; i < objectsCount; i++) {
            this.allObjects[i].update(delta);
        }

        this._controls.updateCamera(delta);
    }

    async createObject(classRef, modelName) {
        if (!(classRef.prototype instanceof AbstractObject)) {
            throw new Error('Class must be inherited from AbstractObject');
        }

        /** @type {AssetManager} */
        const assetManager = this.assetManager;

        let gameObject = new classRef(assetManager.getModel(modelName));
        gameObject.object3d.matrixAutoUpdate = false;
        this.scene.add(gameObject.object3d);
        this.allObjects.push(gameObject);

        return gameObject;
    }

    /**
     * @param {string} spriteName 
     * @returns {Promise<THREE.Sprite>}
     */
    async createSprite(spriteName) {
        /** @type {AssetManager} */
        const assetManager = this.assetManager;

        const sprite = assetManager.getSprite(spriteName);
        this.sceneOrtho.add(sprite);

        return sprite;
    }

    /**
     * @param {string|symbol} ref 
     * @param {AbstractObject} gameObject 
     */
    async switchControls(ref, gameObject) {
        let controls = await this.diContainer.get(ref);
        if (!controls) {
            throw new Error('Component not found');
        }

        if(!(controls instanceof AbstractControls)) {
            throw new Error('Class must be inherited from AbstractControls');
        }

        controls.init(this.camera, gameObject, this);
        
        this._controls = controls;
    }

}