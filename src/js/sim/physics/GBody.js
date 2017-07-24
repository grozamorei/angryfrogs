import {nextUniqueId} from "./GUtils";
export const GBody = (center, halfsizes) => {

    const state = {
        label: '',
        collisionFilter: 0,
        isStatic: true
    }
    const id = nextUniqueId()

    const self = {
        get id() { return id },
        get center() { return center },
        get radius() { return halfsizes },
        get left() { return center.x - halfsizes.x },
        get right() { return center.x + halfsizes.x },
        get top() { return center.y + halfsizes.y },
        get bottom() { return center.y - halfsizes.y },
        setOption: (key, value) => {
            if (key in state) {
                state[key] = value
                return self
            } else {
                throw 'Cannot set option ' + key
            }
        }
    }
    return self
}