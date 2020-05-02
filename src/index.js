// initialize required modules
import './engine/frontend';

import {createFrontendFacade} from './engine';
import {controls} from "./engine/frontend/control";
import FlyingObject from "./engine/physics/object/FlyingObject";

const filepaths = {
    "models": {
      "smallSpaceFighter": "SmallSpaceFighter.glb"
    },
    "sprites": {
        "aim": "aim-red.png"
    }
};

export class Game {

    async start() {
        this.frontendFacade = await createFrontendFacade(filepaths);

        const sprite = await this.frontendFacade.createSprite('aim');
        sprite.center.set(0.5, 0.5);
        sprite.scale.set(64, 64, 1);
        // sprite.scale.set(sprite.material.map.image.width, sprite.material.map.image.height, 1);

        await this.addSpaceships();

        const gameObject = await this.frontendFacade.createObject(FlyingObject, "smallSpaceFighter");
        this.frontendFacade.switchControls(controls.FLYING_OBJECT_CONTROLS, gameObject);
        this.frontendFacade.startGameLoop();
    }

    async addSpaceships() {
        const spaceShip1 = await this.frontendFacade.createObject(FlyingObject, "smallSpaceFighter");
        spaceShip1.object3d.position.z = -4;
        spaceShip1.object3d.position.x = 5;
        spaceShip1.object3d.position.y = 5;
        spaceShip1.speedAbs = 0;

        const spaceShip2 = await this.frontendFacade.createObject(FlyingObject, "smallSpaceFighter");
        spaceShip2.object3d.position.z = -10;
        spaceShip2.object3d.position.x = -3.5;
        spaceShip2.object3d.position.y = 4.5;
        spaceShip2.speedAbs = 0;

        const spaceShip3 = await this.frontendFacade.createObject(FlyingObject, "smallSpaceFighter");
        spaceShip3.object3d.position.z = -100;
        spaceShip3.object3d.position.x = -3.5;
        spaceShip3.object3d.position.y = 4.5;
        spaceShip3.speedAbs = 0;
    }

}
