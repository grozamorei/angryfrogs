import * as GUtils from "./GUtils";
import {emitterTemplate} from "../utils/EmitterBehaviour";
import {INTERSECTION} from "./GUtils";
import {Util} from "../utils/Util";
import {GMap} from "../utils/GMap";

export const GEngineE = {
    DEATH: 'death',
    GROUNDED: 'grounded',
    WALLED: 'walled',
    HEADHIT: 'headHit',
    AIRBORNE: 'airborne',
    TRIGGER_ENTER: 'triggerEnter',
    TRIGGER_EXIT: 'triggerExit'
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
    TRIGGER_BODY: 'trigger_body'
}

export const GEngine = (gyro) => {

    const gravity = 13
    const slipperyWallGravity = gravity * 0.92
    const stickyWallGravity = gravity * 0.4

    const bodies = new GMap()
    const interactiveBodies = new GMap()

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

    const hitTrigger = (body, collision) => {
        collision.justEntered && self.emit(GEngineE.TRIGGER_ENTER, collision.secondBodyId)
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

    responses[PMASK.TRIGGER_BODY] = {}
    responses[PMASK.TRIGGER_BODY][INTERSECTION.DOWN] = hitTrigger
    responses[PMASK.TRIGGER_BODY][INTERSECTION.TOP] = hitTrigger
    responses[PMASK.TRIGGER_BODY][INTERSECTION.LEFT] = hitTrigger
    responses[PMASK.TRIGGER_BODY][INTERSECTION.RIGHT] = hitTrigger

    const self = {
        addBody: (value) => {
            interactiveBodies.forEach(b => {
                if (b.id === value.id) console.error('da fuq')
            })
            if (value.isInteractive) {
                interactiveBodies.set(value.id, value)
            }
            bodies.set(value.id, value)
        },
        removeBody: (bodyId) => {
            if (bodies.has(bodyId)) bodies.remove(bodyId)
            if (interactiveBodies.has(bodyId)) interactiveBodies.remove(bodyId)
        },
        applyForce: (bodyId, force) => {
            interactiveBodies.get(bodyId).velocity.x = force.x
            interactiveBodies.get(bodyId).velocity.y = force.y
        },
        offsetBody: (bodyId, x, y) => {
            const b = bodies.get(bodyId)
            b.center.x += x; b.center.y += y
        },
        update: (dt, currentFrame) => {
            dt /= 1000 // to seconds

            // apply all forces
            interactiveBodies.forEach(b => {
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
                b.center.x += b.velocity.x * dt //+ gyro.pullValue * 50 * dt

                const floors = b.getCollisionsByIntersection(INTERSECTION.DOWN)
                const slipperyFloor = floors.reduce((acc, current) => {
                    if (acc === true) return acc
                    return current.mask.indexOf('slippery') > -1
                }, false)
                if (slipperyFloor) {
                    b.center.x += gyro.pullValue * 70 * dt
                }
            })

            //
            // determine collision entering
            interactiveBodies.forEach(a => {
                bodies.forEach(b => {
                    if (a.id === b.id) return // dont collide with self

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
                            secondBodyId: b.id,
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
            interactiveBodies.forEach(a => {
                const remove = []
                a.collisions.forEach((c, key) => {
                    if (c.frame < currentFrame) {
                        remove.push(key)
                    }
                })
                remove.forEach(r => {
                    // console.log('ending collision: ', a.collisions.get(r).intersection, bodies.get(r).label, bodies.get(r).collisionMask, currentFrame, a.velocity.toString())
                    a.responseUnlock(r)
                    a.collisions.remove(r)
                    if (bodies.get(r).collisionMask === PMASK.TRIGGER_BODY) {
                        self.emit(GEngineE.TRIGGER_EXIT, r)
                    }
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
                    const set = a.collisions.getSetAt(0)
                    if (set.v.mask !== PMASK.TRIGGER_BODY) {
                        if (!a.haveResponseLock(set.k) && ((INTERSECTION.LEFT|INTERSECTION.RIGHT)&set.v.intersection)) {
                            self.emit(GEngineE.WALLED, set.v.intersection)
                        }
                    }
                }
            })

            //
            // responses and continues
            interactiveBodies.forEach(a => {
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