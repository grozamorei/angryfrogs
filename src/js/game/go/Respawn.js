import {IDebugVisual, ITypedObject, ObjectType, ITriggerBody, INamedObject} from "./GameObjectBase";
import {PMASK} from "../physics/GEngine";

export const Respawn = (x, y) => {
    const self = {
        x: x, y: y, width: 80, height: 80,
        active: false
    }

    Object.assign(self, INamedObject('respawn'))
    Object.assign(self, ITypedObject(ObjectType.RESPAWN))
    Object.assign(self, ITriggerBody(self, PMASK.TRIGGER_BODY))
    Object.assign(self, IDebugVisual(self))

    return self
}