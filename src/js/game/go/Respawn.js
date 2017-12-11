import {IDebugVisual, ITypedObject, ObjectType, ITriggerBody, INamedObject} from "./GameObjectBase";
import {PMASK} from "../physics/GEngine";

export const Respawn = (x, y) => {

    let active = false
    const self = {
        x: x, y: y, width: 80, height: 80,
        get active() { return active },
        setActive: (value) => {
            active = value
        	if (value) {
        		self.debugVisual.simple.tint = 0xCCCC00
        	} else {
        		self.debugVisual.simple.tint = 0xCCCCCC
        	}
        }
    }

    Object.assign(self, INamedObject('respawn'))
    Object.assign(self, ITypedObject(ObjectType.RESPAWN))
    Object.assign(self, ITriggerBody(self, PMASK.TRIGGER_BODY))
    Object.assign(self, IDebugVisual(self))

    return self
}