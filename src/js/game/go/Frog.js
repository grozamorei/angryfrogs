import * as go from "./GameObjectBehaviours"
import {Util} from "../utils/Util";
export const Frog = (animations, x, y, w, h, physicsMask, collider) => {
    const state = {
        /** @type PIXI.Sprite */
        sprite: null,
        debugSprite: null,
        body: null
    }

    let lastAnimationKey = 'idle'
    let nextAnimationFrameIn = NaN
    let maxFrame = {'jump': 2, 'slip': 1}
    const self = {
        update: () => {
            state.sprite.x = state.debugSprite.x = state.body.center.x
            state.sprite.y = state.debugSprite.y = state.body.center.y
            if (!Number.isNaN(nextAnimationFrameIn)) {
                nextAnimationFrameIn -= 1
                if (nextAnimationFrameIn === 0) {
                    const scaleX = state.sprite.scale.x
                    const aData = lastAnimationKey.split('_')
                    const frame = Number.parseInt(aData[1])
                    if (frame < maxFrame[aData[0]]) {
                        self.updateAnimation(aData[0] + '_0' + (frame+1), Util.normalizeValue(scaleX), true)
                    } else {
                        nextAnimationFrameIn = NaN
                    }
                }
            }
        },
        get lastAnimation() { return lastAnimationKey },
        updateAnimation(name, faceDir, keyFrameSwitch = false) {
            const scaleX = state.sprite.scale.x
            if (name === lastAnimationKey && Util.normalizeValue(scaleX) === faceDir) return
            // console.log('update animation to', name, faceDir, keyFrameSwitch)
            nextAnimationFrameIn = keyFrameSwitch ? 4 : NaN
            lastAnimationKey = name
            state.sprite.texture = window.resources.getTexture(animations[name])
            state.sprite.scale.x = faceDir * Math.abs(scaleX)
        },
        getCollisions(intersection, doWhat) {
            if (state.body.collisions.size > 0) {
                state.body.collisions.forEach(c => {
                    if (intersection & c.intersection) {
                        doWhat(c)
                    }
                })
            }
        }
    }

    Object.assign(self, go.createTemplate(state, 'frog', animations.idle, x, y, w, h, 0xFFFFFF, physicsMask, false, true, collider))
    Object.assign(self, go.debugVisualTemplate(state, collider.w, collider.h, 0xCC0000, 0.0))

    return self
}