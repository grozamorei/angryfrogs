import * as GUtils from "./GUtils";
import {emitterTemplate} from "../utils/EmitterBehaviour";
import {INTERSECTION} from "./GUtils";
import {Util} from "../utils/Util";

export const GEngineE = {
    DEATH: 'death',
    GROUNDED: 'grounded',
    WALLED: 'walled',
    HEADHIT: 'headHit',
    AIRBORNE: 'airborne'
}

export const PMASK = {
    NONE: 'none',
    FROG: 'frog',
    DEATH: 'death',
    PICKUP: 'pickup',
    PLATFORM_STICKY_THIN: 'pl_sticky_thin',
    PLATFORM_STICKY_SOLID: 'pl_sticky_solid',
    PLATFORM_SLIPPERY_THIN: 'pl_slippery_thin',
    PLATFORM_SLIPPERY_SOLID: 'pl_slippery_solid',
    WALL_STICKY: 'wall_sticky',
    WALL_SLIPPERY: 'wall_slippery',
}

export const GEngine = () => {

    const gravity = 13
    const slipperyWallGravity = gravity * 0.92
    const stickyWallGravity = gravity * 0.4

    const staticBodies = new Map()
    const movingBodies = new Map()

    const stickToFloor = (body, collision) => {
        body.center.y -= collision.penetration
        body.velocity.y = body.velocity.x = 0
        collision.justEntered && self.emit(GEngineE.GROUNDED)
    }

    const slipOnFloor = (body, collision) => {
        body.center.y -= collision.penetration
        body.velocity.y = 0
        body.velocity.x = Util.lerp(body.velocity.x, 0, 0.015)
        if (Math.abs(body.velocity.x) < 0.1) {
            body.velocity.x = 0
        }
        collision.justEntered && self.emit(GEngineE.GROUNDED)
    }

    const hitSurface = (body, collision) => {
        if (collision.intersection === INTERSECTION.TOP) {
            body.center.y += collision.penetration
            body.velocity.y = -body.velocity.y/3
        } else {
            body.center.x += collision.penetration * (collision.intersection === INTERSECTION.LEFT ? 1 : -1)
            body.velocity.x *= -1
            body.velocity.x *= 1.1
        }
        collision.justEntered && self.emit(GEngineE.HEADHIT, collision.intersection)
    }

    const behaveOnWall = (body, collision) => {
        body.center.x += collision.penetration * (collision.intersection === INTERSECTION.LEFT ? 1 : -1)
        body.velocity.x = 0
        if (body.getCollisionsByIntersection(INTERSECTION.DOWN).length > 0) return

        if (collision.wallslip.needEmit) {
            if (collision.wallslip.slipping) self.emit(GEngineE.WALLED, collision.intersection)
            else self.emit(GEngineE.AIRBORNE)
            collision.wallslip.needEmit = false
        }
    }

    const responses = {}
    responses[PMASK.PLATFORM_STICKY_SOLID] = {}
    responses[PMASK.PLATFORM_STICKY_SOLID][INTERSECTION.DOWN] = stickToFloor
    responses[PMASK.PLATFORM_STICKY_SOLID][INTERSECTION.TOP] = hitSurface
    responses[PMASK.PLATFORM_STICKY_SOLID][INTERSECTION.LEFT] = hitSurface
    responses[PMASK.PLATFORM_STICKY_SOLID][INTERSECTION.RIGHT] = hitSurface

    responses[PMASK.PLATFORM_STICKY_THIN] = {}
    responses[PMASK.PLATFORM_STICKY_THIN][INTERSECTION.DOWN] = stickToFloor
    responses[PMASK.PLATFORM_STICKY_THIN][INTERSECTION.TOP] = undefined
    responses[PMASK.PLATFORM_STICKY_THIN][INTERSECTION.LEFT] = undefined
    responses[PMASK.PLATFORM_STICKY_THIN][INTERSECTION.RIGHT] = undefined

    responses[PMASK.PLATFORM_SLIPPERY_SOLID] = {}
    responses[PMASK.PLATFORM_SLIPPERY_SOLID][INTERSECTION.DOWN] = slipOnFloor
    responses[PMASK.PLATFORM_SLIPPERY_SOLID][INTERSECTION.TOP] = hitSurface
    responses[PMASK.PLATFORM_SLIPPERY_SOLID][INTERSECTION.LEFT] = hitSurface
    responses[PMASK.PLATFORM_SLIPPERY_SOLID][INTERSECTION.RIGHT] = hitSurface

    responses[PMASK.PLATFORM_SLIPPERY_THIN] = {}
    responses[PMASK.PLATFORM_SLIPPERY_THIN][INTERSECTION.DOWN] = slipOnFloor
    responses[PMASK.PLATFORM_SLIPPERY_THIN][INTERSECTION.TOP] = undefined
    responses[PMASK.PLATFORM_SLIPPERY_THIN][INTERSECTION.LEFT] = undefined
    responses[PMASK.PLATFORM_SLIPPERY_THIN][INTERSECTION.RIGHT] = undefined

    responses[PMASK.WALL_STICKY] = {}
    responses[PMASK.WALL_STICKY][INTERSECTION.DOWN] = stickToFloor
    responses[PMASK.WALL_STICKY][INTERSECTION.TOP] = hitSurface
    responses[PMASK.WALL_STICKY][INTERSECTION.LEFT] = behaveOnWall
    responses[PMASK.WALL_STICKY][INTERSECTION.RIGHT] = behaveOnWall

    responses[PMASK.WALL_SLIPPERY] = {}
    responses[PMASK.WALL_SLIPPERY][INTERSECTION.DOWN] = slipOnFloor
    responses[PMASK.WALL_SLIPPERY][INTERSECTION.TOP] = hitSurface
    responses[PMASK.WALL_SLIPPERY][INTERSECTION.LEFT] = behaveOnWall
    responses[PMASK.WALL_SLIPPERY][INTERSECTION.RIGHT] = behaveOnWall

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

                const sticky = b.getCollisionsByMask(PMASK.WALL_STICKY)
                const slippery = b.getCollisionsByMask(PMASK.WALL_SLIPPERY)
                if (sticky.length > 0 && sticky[0].wallslip.slipping) {
                    if (b.velocity.y < 0) {
                        g = gravity
                    } else {
                        g = stickyWallGravity
                    }
                } else if (slippery.length > 0 && slippery[0].wallslip.slipping) {
                    g = slipperyWallGravity
                } else {
                    g = gravity
                }

                const startVelY = b.velocity.y
                let currentVelY = startVelY + g * dt
                // console.log('vel: ', currentVelY, '; gravity: ', g, b.collisions.size, b.getCollisionsByMask(PMASK.WALL_STICKY).length, b.getCollisionsByMask(PMASK.WALL_SLIPPERY).length)
                const path = (((currentVelY*currentVelY) - (startVelY*startVelY)) / 2*g)
                b.velocity.y = currentVelY
                b.center.y += path

                //
                // moving sideways linearly
                b.center.x += b.velocity.x * dt
            })

            //
            // determine collision entering
            movingBodies.forEach(a => {
                staticBodies.forEach(b => {

                    const result = GUtils.testBody(a, b)
                    if (!result) return

                    if (b.collisionMask === PMASK.DEATH) {self.emit(GEngineE.DEATH); return}

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

                        const collision = {
                            justEntered: true, intersection: result.bodyA,
                            penetration: result.penetration,
                            wallslip: {
                                overlap: result.overlap,
                                overlapFirstBody: result.overlapBodyA,
                                slipping: false,
                                needEmit: false
                            },
                            mask: b.collisionMask, frame: currentFrame
                        }
                        a.collisions.set(b.id, collision)
                        GUtils.detectSlippingState(a, collision)

                        // fly through thin platforms
                        if (b.collisionMask.indexOf('thin') > -1) {
                            if (result.bodyB !== INTERSECTION.TOP) {
                                a.responseLock(b.id)
                            }
                        }
                    } else {
                        a.collisions.get(b.id).penetration = result.penetration
                        a.collisions.get(b.id).justEntered = false

                        a.collisions.get(b.id).wallslip.overlap = result.overlap
                        a.collisions.get(b.id).wallslip.overlapFirstBody = result.overlapBodyA
                        GUtils.detectSlippingState(a, a.collisions.get(b.id))
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
                    if (!a.haveResponseLock(id) && ((INTERSECTION.LEFT|INTERSECTION.RIGHT)&c.intersection)) {
                        self.emit(GEngineE.WALLED, c.intersection)
                    }
                }
            })

            //
            // responses and continues
            movingBodies.forEach(a => {
                a.collisions.forEach((c, id) => {
                    if (a.haveResponseLock(id)) return

                    responses[c.mask][c.intersection](a, c)
                })

            })
        }
    }

    const emitterDict = {}
    Object.assign(self, emitterTemplate(emitterDict))

    return self
}