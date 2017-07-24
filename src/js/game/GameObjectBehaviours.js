import {GBody} from "../sim/physics/GBody";
import {GPoint} from "../sim/physics/GUtils";

export const createTemplate = (state, name, texture, x, y, w, h, tint, physicsMask, isStatic) => {
    let s = new PIXI.Sprite(window.resources.getTexture(texture))
    s.width = w; s.height = h
    s.x = x + w/2; s.y = y + h/2
    s.tint = tint
    s.anchor.x = s.anchor.y = 0.5
    state.sprite = s

    state.body = GBody(GPoint(x + w/2, y + h/2), GPoint(w/2, h/2))
        .setOption('label', name)
        .setOption('isStatic', isStatic)
        .setOption('collisionFilter', physicsMask)

    return {
        get visual() { return state.sprite },
        get body() { return state.body },
        destroy: () => {
            state.sprite.destroy();
            state.sprite = null
            state.body = null
        }
    }
}

export const debugVisualTemplate = (state, w, h, tint, alpha) => {
    const s = new PIXI.Sprite(window.resources.getTexture('pixel'))
    s.width = w; s.height = h
    s.tint = 0xCC0000
    s.alpha = 0.3
    s.anchor.x = s.anchor.y = 0.5
    state.debugSprite = s

    return {
        get debugVisual() { return state.debugSprite }
    }
}