import {Util} from "./utils/Util";
import {Frog} from "./go/Frog";
import {PMASK, GEngineE} from "./physics/GEngine";

export const Controller = (renderer, physics, input, gos) => {
    let frog = null
    let lastFacing = 1

    let canJump = false
    let canWallJump = false

    physics.on(GEngineE.GROUNDED, () => {
        frog.updateAnimation('idle', lastFacing)
        canJump = true
        canWallJump = false
    })

    physics.on(GEngineE.AIRBORNE, () => {
        if (frog.lastAnimation === 'midair') return

        lastFacing = frog.body.velocity.x >= 0 ? 1 : -1
        frog.updateAnimation('jump', lastFacing)

        canWallJump = canJump = false
    })

    physics.on(GEngineE.WALLED, () => {
        frog.updateAnimation('walljump', lastFacing)
        canJump = false
        canWallJump = true
    })

    physics.on(GEngineE.HEADHIT, () => {
        frog.updateAnimation('midair', lastFacing)
    })

    input.on('touchEnded', (vector) => {
        if (Number.isNaN(vector.x) || Number.isNaN(vector.y)) {
            console.log('CLICK')
        } else {
            if (vector.y > 0) return
            if (canJump) {
                vector.y /= 15; vector.y = Math.max(-6, vector.y)
                vector.x *= 100; vector.x = vector.x > 0 ? Math.min(300, vector.x) : Math.max(-300, vector.x)
                physics.applyForce(frog.body.id, vector)
            }
            if (canWallJump) {
                if (lastFacing > 0 && vector.x > 0) return
                if (lastFacing < 0 && vector.x < 0) return
                vector.y /= 15; vector.y = Math.max(-5, vector.y)
                vector.x *= 100; vector.x = vector.x > 0 ? Math.min(500, vector.x) : Math.max(-500, vector.x)
                physics.applyForce(frog.body.id, vector)
            }
        }
    })

    return {
        respawn: (respawnLocations) => {
            if (frog) {
                renderer.removeObject(frog)
                physics.removeBody(frog.body.id)
                gos.splice(gos.indexOf(frog), 1)
                frog.destroy()
            }

            const randomRespawn = respawnLocations[Util.getRandomInt(0, respawnLocations.length-1)]

            frog = Frog(
                {idle: 'frog.idle', jump: 'frog.jump', walljump: 'frog.walljump', midair: 'frog.midair'},
                randomRespawn.x, randomRespawn.y,
                160, 160, PMASK.FROG)
            console.log(frog)
            renderer.addObject(frog)
            physics.addBody(frog.body)
            gos.push(frog)
        }
    }
}