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
                console.log('adding body to moving')
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
                            a.collisions.forEach(c => {
                                if (c.mask === b.collisionMask) {
                                    c.frame = currentFrame
                                    collisionEnter = false
                                }
                            })
                            if (collisionEnter) {
                                console.log('entering collision: ', b.label, currentFrame, result.bodyB, a.velocity.toString())
                                a.collisions.push({id: b.id, mask: b.collisionMask, frame: currentFrame})

                                if (result.bodyB !== INTERSECTION.TOP) {
                                    if (b.radius.y < a.radius.y / 2) { // fly trough the thin platform
                                        a.responseLock(b.id)
                                    }
                                }
                            }

                            if (!a.haveResponseLock(b.id)) {
                                if (result.bodyA === INTERSECTION.DOWN) {
                                    a.center.y -= result.penetration
                                    a.velocity.y = a.velocity.x = 0
                                    collisionEnter && self.emit(GEngineE.GROUNDED)
                                }
                                if (result.bodyA === INTERSECTION.TOP) {
                                    a.center.y += result.penetration
                                    a.velocity.y = -a.velocity.y/2
                                    collisionEnter && self.emit(GEngineE.HEADHIT)
                                }
                                if (result.bodyA === INTERSECTION.RIGHT) {
                                    a.center.x -= result.penetration
                                    a.velocity.x = 0
                                    collisionEnter && self.emit(GEngineE.WALLED)
                                }
                                if (result.bodyA === INTERSECTION.LEFT) {
                                    a.center.x += result.penetration
                                    a.velocity.x = 0
                                    collisionEnter && self.emit(GEngineE.WALLED)
                                }
                            }
                            break
                    }
                })
            })

            // swipe previous collisions
            movingBodies.forEach(a => {
                for (let i = a.collisions.length-1; i >= 0; i--) {
                    if (a.collisions[i].frame < currentFrame) {
                        const old = a.collisions.splice(i, 1)
                        console.log('ending collision: ', staticBodies.get(old[0].id).label, currentFrame, a.velocity.toString())
                        a.responseUnlock(old[0].id)
                        self.emit(GEngineE.AIRBORNE)
                    }
                }
            })
        }
    }

    const emitterDict = {}
    Object.assign(self, emitterTemplate(emitterDict))

    return self
}