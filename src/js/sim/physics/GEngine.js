import {emitterTemplate} from "../../utils/EmitterBehaviour";
export const GEngine = () => {

    const bodies = new Map()

    const self = {
        addBody: (value) => bodies.set(value.id, value),
        removeBody: (bodyId) => bodies.delete(bodyId),
        update: (dt) => {

        }
    }

    const emitterDict = {}
    Object.assign(self, emitterTemplate(emitterDict))

    return self
}