import diContainer from "./di-container"

export default function getOrCreateEngine() {
    return diContainer.get("engine");
}

export {Controls} from './control';
export {diContainer};
