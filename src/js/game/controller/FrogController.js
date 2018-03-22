import {GEngineE, PMASK} from "../physics/GEngine";
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

    physics.on(GEngineE.GROUNDED, ground)

    physics.on(GEngineE.AIRBORNE, () => {
        if (frog.lastAnimation === 'midair.head.hit') return

        lastFacing = frog.body.velocity.x >= 0 ? 1 : -1
        if (frog.lastAnimation.indexOf('jump') === -1) {
            // console.log('what is this?')
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

    const applyForce2 = vector => {
        if (walled()) {
            frog.updateAnimation('jump_01', lastFacing, true)
        } else {
            frog.updateAnimation('jump_00', lastFacing, true)
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
            if (magnitude > 0.5) {
                frog.updateAnimation('prepare.jump.01', lastFacing)
            } else {
                frog.updateAnimation('prepare.jump.00', lastFacing)
            }
        } else if (walled()) {
            frog.getCollisions(INTERSECTION.LEFT, _ => lastFacing = -1)
            frog.getCollisions(INTERSECTION.RIGHT, _ => lastFacing = 1)
            if (magnitude > 0.5) {
                frog.updateAnimation('walled.prepare.jump', lastFacing)
            } else {
                frog.updateAnimation('walled', lastFacing)
            }
        } else if (airbourne()) {
            frog.updateAnimation(frog.lastAnimation, lastFacing)
        }
    })

    input.on('touchEnded', vector => {
        if (inputDisabled) return

        const maxXVelocity = 250
        const maxYVelocity = -6
        const thresholdYVelocity = Math.max(Math.max(0.5, Math.abs(vector.x)), Math.abs(vector.y))
        console.log(vector)
        if (isNaN(vector.x) || isNaN(vector.y)) {
            ground()
        } else {
            if (grounded()) {
                vector.y = maxYVelocity * thresholdYVelocity
                vector.x *= maxXVelocity
                applyForce2(vector)
                return
            }
            if (walled()) {
                frog.getCollisions(INTERSECTION.LEFT, _ => vector.x = maxXVelocity * 1.35)
                frog.getCollisions(INTERSECTION.RIGHT, _ => vector.x = -maxXVelocity * 1.35)
                vector.y = maxYVelocity * .9
                applyForce2(vector)
                return
            }
            if (airbourne()) {
                vector.y = maxYVelocity * thresholdYVelocity
                vector.x *= maxXVelocity
                applyForce2(vector)
                canDoubleJump = debug.neoMode
            }
        }
    })

    return {
        disableInput: () => { inputDisabled = true },
        enableInput: () => { inputDisabled = false }
    }
}