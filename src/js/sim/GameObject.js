import {CONST} from "../utils/CONST";
export const GameObject = (name, graphics, x, y, w, h, tint, mask, isStatic = false) => {

    let sprite = new PIXI.Sprite(window.resources.getTexture(graphics))
    sprite.width = w; sprite.height = h
    sprite.x = x + w/2; sprite.y = y + h/2
    sprite.tint = tint
    sprite.alpha = 0.90
    sprite.anchor.x = sprite.anchor.y = 0.5

    let body = Matter.Bodies.rectangle(x + w/2, y + h/2, w, h, {
        label: name,
        inertia: Number.POSITIVE_INFINITY,
        inverseInertia: 1 / Number.POSITIVE_INFINITY,
        frictionAir: 0.01,
        isStatic: isStatic,
        collisionFilter: {
            category: mask
        }
    })
    body.friction = mask === CONST.PMASK.WALL ? 0.002 : 1

    return {
        get visual() { return sprite },
        get body() { return body },
        update: () => {
            if (isStatic) return
            sprite.x = body.position.x
            sprite.y = body.position.y
            // console.log(sprite.x, sprite.y, body.position.x, body.position.y)
        },
        destroy: () => {
            sprite.destroy()
            body = null
        }
    }
}