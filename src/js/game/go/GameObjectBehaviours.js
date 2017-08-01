import {GBody} from "../physics/GBody";
import {GPoint} from "../physics/GUtils";

export const createTemplate = (state, name, texture, x, y, w, h, tint, physicsMask, isStatic, isInteractive = false, collider = undefined) => {
    let s = new PIXI.Sprite(window.resources.getTexture(texture))
    s.width = w; s.height = h
    s.x = x + w/2; s.y = y + h/2
    s.tint = tint
    state.sprite = s

    if (collider) {
        state.body = GBody(
            GPoint(x + collider.x + collider.w/2, y + collider.y + collider.h/2),
            GPoint(collider.w/2, collider.h/2)
        )
        s.anchor.x = (collider.x + collider.w/2) / w
        s.anchor.y = (collider.y + collider.h/2) / h
    } else {
        state.body = GBody(GPoint(x + w/2, y + h/2), GPoint(w/2, h/2))
        s.anchor.x = s.anchor.y = 0.5
    }

    state.body.setOption('label', name)
        .setOption('isStatic', isStatic)
        .setOption('isInteractive', isInteractive)
        .setOption('collisionFilter', physicsMask)

    return {
        get name() { return name },
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
    s.tint = tint
    s.alpha = alpha
    s.anchor.x = s.anchor.y = 0.5
    state.debugSprite = s

    return {
        get debugVisual() { return state.debugSprite }
    }
}