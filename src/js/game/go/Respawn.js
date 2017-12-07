import {IDebugVisual, ITypedObject, ObjectType} from "./GameObjectBase";

export const Respawn = (x, y) => {
    const self = {
        x: x, y: y,
    }

    Object.assign(self, ITypedObject(ObjectType.RESPAWN))
    Object.assign(self, IDebugVisual(self))

    return self
}