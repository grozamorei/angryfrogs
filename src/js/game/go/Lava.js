import * as go from "./GameObjectBehaviours";
import {PMASK} from "../physics/GEngine";
export const Lava = (texture, tint) => {
    const state = {
        /** @type PIXI.Sprite */
        sprite: null,
        body: null
    }

    const self = {
        updateRise(dt, jumpHeight) {
            dt = dt / 1000

            let speed = 0
            if (jumpHeight < 500) {
                speed = 0
            } else if (jumpHeight < 1000) {
                speed = 40
            } else if (jumpHeight < 3000) {
                speed = 60
            } else if (jumpHeight < 5000) {
                speed = 90
            } else if (jumpHeight < 7000) {
                speed = 120
            } else {
                speed = 170
            }

            const rise = speed * dt
            state.sprite.height += rise*2
            state.body.radius.y += rise
        },
        updatePosition(cameraPos, rendererSize) {
            state.sprite.x = state.body.center.x = rendererSize.x/2
            const newPos = -cameraPos.y + rendererSize.y
            const diff = Math.abs(newPos - state.sprite.y)

            state.sprite.height = Math.max(10, state.sprite.height - diff*2)
            state.body.radius.y = Math.max(10, state.body.radius.y - diff)
            state.sprite.y = state.body.center.y = newPos
        }
    }

    Object.assign(self, go.createTemplate(state, 'lava', texture, 0, 0, 800, 50, tint, PMASK.DEATH, true, true))

    return self
}