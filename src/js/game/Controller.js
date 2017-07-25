import {Util} from "./utils/Util";
import {Frog} from "./go/Frog";
import {PMASK} from "./physics/GEngine";

export const Controller = (renderer, physics, input, gos) => {

    input.on('touchEnded', (vector) => {
        if (Number.isNaN(vector.x) || Number.isNaN(vector.y)) {
            console.log('CLICK')
        } else {
            if (vector.y > 0) return
            vector.y /= 15; vector.y = Math.max(-6, vector.y)
            vector.x *= 100; vector.x = vector.x > 0 ? Math.min(300, vector.x) : Math.max(-300, vector.x)
            // console.log(vector)
            physics.applyForce(frog.body.id, vector)
        }
    })

    let frog = null
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