import * as go from "./GameObjectBehaviours"
export const Frog = (animations, x, y, w, h, physicsMask, collider) => {
    const state = {
        /** @type PIXI.Sprite */
        sprite: null,
        debugSprite: null,
        body: null
    }

    let lastAnimationKey = 'idle'
    const self = {
        update: () => {
            state.sprite.x = state.debugSprite.x = state.body.center.x
            state.sprite.y = state.debugSprite.y = state.body.center.y
        },
        get lastAnimation() { return lastAnimationKey },
        updateAnimation(name, faceDir) {
            lastAnimationKey = name
            state.sprite.texture = window.resources.getTexture(animations[name])
            state.sprite.scale.x = faceDir * Math.abs(state.sprite.scale.x)
        }
    }

    Object.assign(self, go.createTemplate(state, 'frog', animations.idle, x, y, w, h, 0xFFFFFF, physicsMask, false, true, collider))
    Object.assign(self, go.debugVisualTemplate(state, collider.w, collider.h, 0xCC0000, 0.0))

    return self
}