import * as GUtils from "./GUtils";
import {emitterTemplate} from "../utils/EmitterBehaviour";
import {INTERSECTION} from "./GUtils";

export const GEngineE = {
    DEATH: 'death',
    GROUNDED: 'grounded',
    WALLED: 'walled',
    HEADHIT: 'headHit',
    AIRBORNE: 'airborne'
}

export const PMASK = {
    FROG: 0x0001,
    DEATH: 0x0002,
    REGULAR: 0x0004
}

export const GEngine = () => {

    const gravity = 13
    const wallGravity = gravity * 0.92

    const staticBodies = new Map()
    const movingBodies = new Map()

    const self = {
        addBody: (value) => {
            if (value.isStatic) {
                staticBodies.set(value.id, value)
            } else {
                movingBodies.set(value.id, value)
            }
        },
        removeBody: (bodyId) => {
            if (staticBodies.has(bodyId)) staticBodies.delete(bodyId)
            if (movingBodies.has(bodyId)) movingBodies.delete(bodyId)
        },
        applyForce: (bodyId, force) => {
            movingBodies.get(bodyId).velocity.x = force.x
            movingBodies.get(bodyId).velocity.y = force.y
        },
        update: (dt, currentFrame) => {
            dt /= 1000 // to seconds

            // apply all forces
            movingBodies.forEach(b => {
                //
                // falling down with acceleration
                let g = 0
                if (b.collisions.length > 0 && b.velocity.x === 0 && b.velocity.y > 0) {
                    g = wallGravity
                } else {
                    g = gravity
                }

                const startVelY = b.velocity.y
                let currentVelY = startVelY + g * dt
                const path = (((currentVelY*currentVelY) - (startVelY*startVelY)) / 2*g)
                b.velocity.y = currentVelY
                b.center.y += path

                //
                // moving sideways linearly
                b.center.x += b.velocity.x * dt
            })

            // apply collision responses
            movingBodies.forEach(a => {
                staticBodies.forEach(b => {

                    const result = GUtils.testBody(a, b)
                    if (!result) return

                    switch (b.collisionMask) {
                        case PMASK.DEATH:
                            self.emit('death');
                            break
                        case PMASK.REGULAR:
                            //
                            // determining entering collisions
                            let collisionEnter = true
                            a.collisions.forEach((c, id)=> {
                                if (id === b.id) {
                                    c.frame = currentFrame
                                    collisionEnter = false
                                }
                            })
                            if (collisionEnter) {
                                // console.log('entering collision: ', b.label, currentFrame, result.bodyB, a.velocity.toString())
                                a.collisions.set(b.id, {
                                    justEntered: true, intersection: result.bodyA, penetration: result.penetration,
                                    mask: b.collisionMask, frame: currentFrame
                                })

                                if (result.bodyB !== INTERSECTION.TOP) {
                                    if (b.radius.y < a.radius.y * 0.8) { // fly trough the thin platform
                                        a.responseLock(b.id)
                                    }
                                }
                            } else {
                                a.collisions.get(b.id).penetration = result.penetration
                                a.collisions.get(b.id).justEntered = false
                            }
                            break
                    }
                })
            })

            // swipe previous collisions
            movingBodies.forEach(a => {
                const remove = []
                a.collisions.forEach((c, key) => {
                    if (c.frame < currentFrame) {
                        remove.push(key)
                    }
                })
                remove.forEach(r => {
                    // console.log('ending collision: ', a.collisions.get(r).intersection, staticBodies.get(r).label, currentFrame, a.velocity.toString())
                    a.responseUnlock(r)
                    a.collisions.delete(r)
                })

                let locked = false
                a.collisions.forEach((c, key) => {
                    if (a.haveResponseLock(key)) {
                        locked = true
                    }
                })
                if (remove.length > 0 && (locked || a.collisions.size === 0)) {
                    self.emit(GEngineE.AIRBORNE)
                }

                if (a.collisions.size === 1 && remove.length > 0) {
                    const id = a.collisions.entries().next().value[0]
                    const c = a.collisions.entries().next().value[1]
                    if (!a.haveResponseLock(id) && (c.intersection === INTERSECTION.LEFT || c.intersection === INTERSECTION.RIGHT)) {
                        self.emit(GEngineE.WALLED)
                    }
                }
            })

            //
            // resolve response priority
            movingBodies.forEach(a => {

                a.collisions.forEach((c, id) => {
                    if (!a.haveResponseLock(id)) {
                        if (c.intersection === INTERSECTION.DOWN) {
                            a.center.y -= c.penetration
                            a.velocity.y = a.velocity.x = 0
                            c.justEntered && self.emit(GEngineE.GROUNDED)
                        }
                        if (c.intersection === INTERSECTION.TOP) {
                            a.center.y += c.penetration
                            a.velocity.y = -a.velocity.y/3
                            c.justEntered && self.emit(GEngineE.HEADHIT)
                        }
                        if (c.intersection === INTERSECTION.RIGHT) {
                            a.center.x -= c.penetration
                            a.velocity.x = 0
                            c.justEntered && self.emit(GEngineE.WALLED)
                        }
                        if (c.intersection === INTERSECTION.LEFT) {
                            a.center.x += c.penetration
                            a.velocity.x = 0
                            c.justEntered && self.emit(GEngineE.WALLED)
                        }
                    }
                })

            })
        }
    }

    const emitterDict = {}
    Object.assign(self, emitterTemplate(emitterDict))

    return self
}