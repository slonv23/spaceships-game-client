import diContainer from "./di-container"

export default function createEngine() {
    return diContainer.get("engine");
}

export {Controls} from './control';
export {diContainer};
