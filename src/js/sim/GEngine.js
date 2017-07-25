import * as GUtils from "./GUtils";
import {emitterTemplate} from "../utils/EmitterBehaviour";
import {CONST} from "../utils/CONST";
import {INTERSECTION} from "./GUtils";
export const GEngine = () => {

    const gravity = 13

    const staticBodies = new Map()
    const movingBodies = new Map()

    const prevCollisionsCache = {}
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
        update: (dt) => {
            dt /= 1000 // to seconds

            // apply all forces
            movingBodies.forEach(b => {
                if (b.collisions[INTERSECTION.DOWN].mask === 0 || b.velocity.y < 0) {
                    const startVelY = b.velocity.y
                    let currentVelY = startVelY + gravity * dt
                    const path = (((currentVelY*currentVelY) - (startVelY*startVelY)) / 2*gravity)
                    b.velocity.y = currentVelY
                    b.center.y += path
                }
                if (b.velocity.x !== 0) {
                    b.center.x += b.velocity.x * dt
                }
            })

            // console.log(movingBodies.forEach(a=>console.log(a.collisions.down)))
            movingBodies.forEach(a => {
                prevCollisionsCache.top = a.collisions.top.mask
                prevCollisionsCache.down = a.collisions.down.mask
                prevCollisionsCache.left = a.collisions.left.mask
                prevCollisionsCache.right = a.collisions.right.mask

                a.clearCollisionMask()
                staticBodies.forEach(b => {
                    const result = GUtils.testBody(a, b)
                    if (!result) return

                    switch (b.collisionMask) {
                        case CONST.PMASK.DEATH:
                            self.emit('death');
                            break
                        case CONST.PMASK.REGULAR:
                            a.collisions[result.bodyA].mask = b.collisionMask
                            if (prevCollisionsCache[result.bodyA] > 0) {
                                a.collisions[result.bodyA].frame += 1
                            } else {
                                a.collisions[result.bodyA].frame = 0
                                if (result.bodyA === INTERSECTION.DOWN) {
                                    a.center.y -= result.penetration
                                    a.velocity.y = a.velocity.x = 0
                                }
                            }
                            break
                    }
                })
                a.clearCollisionFrame()
            })
        }
    }

    const emitterDict = {}
    Object.assign(self, emitterTemplate(emitterDict))

    return self
}