import * as go from "./GameObjectBehaviours"
export const Frog = (animations, x, y, w, h, physicsMask) => {
    const state = {
        /** @type PIXI.Sprite */
        sprite: null,
        debugSprite: null,
        body: null
    }

    const self = {
        update: () => {
            state.sprite.x = state.debugSprite.x = state.body.center.x
            state.sprite.y = state.debugSprite.y = state.body.center.y
        }
    }

    Object.assign(self, go.createTemplate(state, 'frog', animations.idle, x, y, w, h, 0xFFFFFF, physicsMask, false, true))
    Object.assign(self, go.debugVisualTemplate(state, w, h, 0xCC0000, 0.3))

    return self
}