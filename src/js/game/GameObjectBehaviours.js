import {CONST} from "../utils/CONST";
export const createTemplate = (state, name, texture, x, y, w, h, tint, physicsMask, isStatic) => {
    let s = new PIXI.Sprite(window.resources.getTexture(texture))
    s.width = w; s.height = h
    s.x = x + w/2; s.y = y + h/2
    s.tint = tint
    s.alpha = 0.90
    s.anchor.x = s.anchor.y = 0.5
    state.sprite = s

    let body = Matter.Bodies.rectangle(x + w/2, y + h/2, w, h, {
        label: name,
        inertia: Number.POSITIVE_INFINITY,
        inverseInertia: 1 / Number.POSITIVE_INFINITY,
        frictionAir: 0.01,
        isStatic: isStatic,
        collisionFilter: {
            category: physicsMask
        }
    })
    body.friction = physicsMask === CONST.PMASK.WALL ? 0.002 : 1
    state.body = body

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