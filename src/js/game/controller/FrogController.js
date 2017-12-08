import {GEngineE} from "../physics/GEngine";
import {Util} from "../utils/Util";
import {INTERSECTION} from "../physics/GUtils";

/**
 * Reactive controller that actually performs actions on playable frog
 * @constructor
 */
export const FrogController = (frog, physics, input) => {
    const debug = window.debugMenu.params

    let lastFacing = 1
    let canJump = false
    let canWallJump = false
    let canDoubleJump = false

    const grounded = () => canJump
    const airbourne = () => !canJump && !canWallJump && canDoubleJump
    const walled = () => canWallJump
    const ground = () => {
        frog.updateAnimation('idle', lastFacing)
        canJump = true
        canDoubleJump = true
        canWallJump = false
    }
    const isWallJumpDirectionRight = (dir) => {
        let isDirectionRight = false
        frog.getCollisions(INTERSECTION.LEFT | INTERSECTION.RIGHT, c => {
            if (c.intersection&INTERSECTION.LEFT) isDirectionRight = dir > 0
            if (c.intersection&INTERSECTION.RIGHT) isDirectionRight = dir < 0
        })
        return isDirectionRight
    }

    physics.on(GEngineE.GROUNDED, ground)

    physics.on(GEngineE.AIRBORNE, () => {
        if (frog.lastAnimation === 'midair.head.hit') return

        lastFacing = frog.body.velocity.x >= 0 ? 1 : -1
        if (frog.lastAnimation.indexOf('jump') === -1) {
            console.log('what is this?')
            frog.updateAnimation('jump_01', lastFacing, true)
        }

        canWallJump = canJump = false
    })

    physics.on(GEngineE.WALLED, (intersection) => {
        lastFacing = intersection === INTERSECTION.RIGHT ? 1 : -1
        frog.updateAnimation('walled', lastFacing)
        canJump = false
        canWallJump = true
    })

    physics.on(GEngineE.HEADHIT, (intersection) => {
        if (frog.lastAnimation === 'walled') return
        if (canJump) return
        if (intersection === INTERSECTION.RIGHT) lastFacing = 1
        if (intersection === INTERSECTION.LEFT) lastFacing = -1

        frog.updateAnimation('midair.head.hit', lastFacing)
        if (debug.neoMode) return
        canJump = false
        canDoubleJump = false
        canWallJump = false
    })

    const applyForce = (vector, maxXImpulse, maxYImpulse, maxMagnitude, slipping = false) => {
        vector.x = maxXImpulse * vector.x/maxMagnitude
        vector.y = maxYImpulse * vector.y/maxMagnitude

        if (slipping) {
            // frog.updateAnimation('slide_00', lastFacing, true)
        } else {
            if (walled()) {
                frog.updateAnimation('jump_01', lastFacing, true)
            } else {
                frog.updateAnimation('jump_00', lastFacing, true)
            }
        }
        physics.applyForce(frog.body.id, vector)
        lastFacing = frog.body.velocity.x >= 0 ? 1 : -1
    }

    let inputDisabled = false

    input.on('touchStarted', () => {
        if (inputDisabled) return

        if (airbourne()) {
            frog.updateAnimation('midair.prepare.jump', lastFacing)
        } else if (grounded()) {
            frog.updateAnimation('prepare.jump.00', lastFacing)
        }
    })

    input.on('touchMove', (magnitude, direction) => {
        if (inputDisabled) return

        if (!Util.approximately(direction, 0)) {
            lastFacing = direction
        }

        if (grounded()) {
            if (magnitude > 30) {
                frog.updateAnimation('prepare.jump.01', lastFacing)
            } else {
                frog.updateAnimation('prepare.jump.00', lastFacing)
            }
        } else if (walled()) {
            if (isWallJumpDirectionRight(direction)) {
                if (magnitude > 15) {
                    frog.updateAnimation('walled.prepare.jump', lastFacing*-1)
                } else {
                    frog.updateAnimation('walled', lastFacing*-1)
                }
            } else {
                frog.updateAnimation('walled', lastFacing)
            }
        } else if (airbourne()) {
            frog.updateAnimation(frog.lastAnimation, lastFacing)
        }
    })

    input.on('touchEnded', (vector) => {
        if (inputDisabled) return

        const maxMagnitude = 120
        const maxYImpulse = 7.5
        let maxXImpulse = 500
        let slipFloorJump = false
        if (vector.y >= 0) {
            vector.y = 0

            //
            // pointing down jump while standing still is not allowed
            let hardFloorCollisions = false
            frog.getCollisions(INTERSECTION.DOWN, c => {
                if (c.mask.indexOf('slippery') === -1) {
                    hardFloorCollisions = true
                } else {
                    slipFloorJump = true
                }
            })
            if (hardFloorCollisions) {
                ground()
                return
            }
            maxXImpulse = 800
        }

        /*const magnitude = */Util.clampMagnitude(vector, 70, maxMagnitude)
        if (isNaN(vector.x) || isNaN(vector.y)) {
            ground()
        } else {
            if (grounded()) {
                applyForce(vector, maxXImpulse, maxYImpulse, maxMagnitude, slipFloorJump)
                return
            }
            if (walled()) {
                if (vector.x === 0) return
                isWallJumpDirectionRight(vector.x)&&applyForce(vector, maxXImpulse*1.5, maxYImpulse*0.95, maxMagnitude)
                return
            }
            if (airbourne()) {
                applyForce(vector, maxXImpulse*1.1, maxYImpulse*0.9, maxMagnitude)
                canDoubleJump = debug.neoMode
            }
        }
    })

    return {
        disableInput: () => { inputDisabled = true },
        enableInput: () => { inputDisabled = false }
    }
}