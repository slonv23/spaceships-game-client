import DiContainer from "di-container-js";

import Keyboard from "./input/Keyboard";
import Mouse from "./input/Mouse";
import AssetManager from "./support/AssetManager";
import GltfLoader from "./support/GltfLoader";
import {controls} from "./control";
import SpaceShipControls from "./control/space-ship/SpaceShipControls";
import Engine from "./Engine";
import CameraManager from "./control/space-ship/CameraManager";

const diContainer = new DiContainer();
diContainer.registerClass("keyboardInterface", Keyboard);
diContainer.registerClass("mouseInterface", Mouse);
diContainer.registerClass("gltfLoader", GltfLoader);
diContainer.registerClass("assetManager", AssetManager);

// register controls
diContainer.registerClass(controls.SPACE_SHIP_CONTROLS, SpaceShipControls, {enableAxesHelper: false});
diContainer.registerClass("spaceShipCameraManager", CameraManager);

diContainer.registerClass("engine", Engine);

export default diContainer;
