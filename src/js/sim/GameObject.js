import {CONST} from "../utils/CONST";
export const GameObject = (name, graphics, x, y, w, h, tint, mask, isStatic = false) => {

    let sprite = new PIXI.Sprite(PIXI.loader.resources[graphics].texture)
    sprite.width = w; sprite.height = h
    sprite.x = x; sprite.y = y
    sprite.tint = tint
    sprite.anchor.x = sprite.anchor.y = 0.5

    let body = Matter.Bodies.rectangle(x, y, w, h, {
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
    // body.frictionStatic = mask === CONST.PMASK.WALL ? 0 : 1

    return {
        get visual() { return sprite },
        get body() { return body },
        update: () => {
            if (isStatic) return
            sprite.x = body.position.x
            sprite.y = body.position.y
            // console.log(sprite.x, sprite.y, body.position.x, body.position.y)
        }
    }
}