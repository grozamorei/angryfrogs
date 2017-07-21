import * as go from "./GameObjectBehaviours"
export const Frog = (animations, x, y, w, h, physicsMask) => {
    const state = {
        /** @type PIXI.Sprite */
        sprite: null,
        /** @type Matter.Bodies.rectangle */
        body: null
    }

    let dj = -1
    const self = {
        setDirection: (dir) => {
            console.log(dir, state.sprite.scale)
            if (dir > 0 && state.sprite.scale.x < 0 ||
                dir < 0 && state.sprite.scale.x > 0) {
                state.sprite.scale.x *= -1
            }
        },
        setJumpMode: (jump) => {
            state.sprite.texture = jump ? window.resources.getTexture(animations.jump) : window.resources.getTexture(animations.idle)
        },
        setDoubleJumpMode: () => {
            dj = 12
            state.sprite.texture = window.resources.getTexture(animations.midair)
        },
        setWallAttach: () => {
            state.sprite.texture = window.resources.getTexture(animations.walljump)
        },
        update: () => {
            state.sprite.x = state.body.position.x
            state.sprite.y = state.body.position.y
            if (dj >= 0) {
                console.log('dj: ', dj)
                dj -= 1
                if (dj < 0) {
                    self.setJumpMode(true)
                }
            }
        }
    }

    Object.assign(self, go.createTemplate(state, 'frog', animations.idle, x, y, w, h, 0xFFFFFF, physicsMask, false))
    return self
}