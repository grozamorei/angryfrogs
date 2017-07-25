import {GPoint, INTERSECTION, nextUniqueId} from "./GUtils";
export const GBody = (center, halfsizes) => {

    const state = {
        label: '',
        collisionFilter: 0,
        isStatic: false,
        isInteractive: false
    }
    const id = nextUniqueId()

    const velocity = GPoint(0, 0)
    const collisions = {}
    collisions[INTERSECTION.TOP] = {mask: 0, frame: -1}
    collisions[INTERSECTION.DOWN] = {mask: 0, frame: -1}
    collisions[INTERSECTION.LEFT] = {mask: 0, frame: -1}
    collisions[INTERSECTION.RIGHT] = {mask: 0, frame: -1}

    const self = {
        get id() { return id },
        get label() { return state.label },
        get isStatic() { return state.isStatic },
        get isInteractive() { return state.isInteractive },
        get collisionMask() { return state.collisionFilter },
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
        },
        get velocity() { return velocity },
        get collisions() { return collisions },
        clearCollisionMask() {
            collisions[INTERSECTION.TOP].mask = 0
            collisions[INTERSECTION.DOWN].mask = 0
            collisions[INTERSECTION.LEFT].mask = 0
            collisions[INTERSECTION.RIGHT].mask = 0
        },
        clearCollisionFrame() {
            collisions[INTERSECTION.TOP].frame = collisions[INTERSECTION.TOP].mask === 0 ? -1 : collisions[INTERSECTION.TOP].frame
            collisions[INTERSECTION.DOWN].frame = collisions[INTERSECTION.DOWN].mask === 0 ? -1 : collisions[INTERSECTION.DOWN].frame
            collisions[INTERSECTION.LEFT].frame = collisions[INTERSECTION.LEFT].mask === 0 ? -1 : collisions[INTERSECTION.LEFT].frame
            collisions[INTERSECTION.RIGHT].frame = collisions[INTERSECTION.RIGHT].mask === 0 ? -1 : collisions[INTERSECTION.RIGHT].frame
        }
    }
    return self
}