import DiContainer from "di-container-js";

import Keyboard from "./input/Keyboard";
import Mouse from "./input/Mouse";
import AssetManager from "./support/AssetManager";
import GltfLoader from "./support/GltfLoader";
import {controls} from "./control";
import SpaceShipControls from "./control/SpaceShipControls";
import Engine from "./Engine";

const diContainer = new DiContainer();
diContainer.registerClass("keyboardInterface", Keyboard);
diContainer.registerClass("mouseInterface", Mouse);
diContainer.registerClass("gltfLoader", GltfLoader);
diContainer.registerClass("assetManager", AssetManager);
diContainer.registerClass(controls.SPACE_SHIP_CONTROLS, SpaceShipControls);
diContainer.registerClass("engine", Engine, diContainer); // TODO implement and use registerClassOnce

export default diContainer;
