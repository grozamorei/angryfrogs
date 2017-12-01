import {GPoint, nextUniqueId} from "./GUtils";
import {GMap} from "../utils/GMap";
export const GBody = (center, halfsizes) => {

    const state = {
        id: nextUniqueId(),
        label: '',
        collisionFilter: 0,
        isStatic: false,
        isInteractive: false
    }

    const velocity = GPoint(0, 0)
    const collisions = new GMap()
    const lock = []
    const collCache = []

    const self = {
        get state() { return state },
        get id() { return state.id },
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
        /**
         * @return {GMap}
         */
        get collisions() { return collisions },
        getCollisionsByMask(mask) {
            collCache.splice(0, collCache.length)
            collisions.forEach(c => {
                if (c.mask === mask) collCache.push(c)
            })
            return collCache
        },
        getCollisionsByIntersection(inter) {
            collCache.splice(0, collCache.length)
            collisions.forEach(c => {
                if (c.intersection === inter) collCache.push(c)
            })
            return collCache
        },
        haveResponseLock(bodyId) { return lock.indexOf(bodyId) !== -1 },
        responseLock(bodyId) {
            lock.push(bodyId)
        },
        responseUnlock(bodyId) {
            if (!self.haveResponseLock(bodyId)) return
            lock.splice(lock.indexOf(bodyId), 1)
        }
    }
    return self
}