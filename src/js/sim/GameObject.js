
export const GameObject = (name, graphics, x, y, w, h, tint, isStatic = false) => {

    let sprite = new PIXI.Sprite(PIXI.loader.resources[graphics].texture)
    sprite.width = w; sprite.height = h
    sprite.x = x; sprite.y = y
    sprite.tint = tint
    sprite.anchor.x = sprite.anchor.y = 0.5

    let body = Matter.Bodies.rectangle(x, y, w, h, {isStatic: isStatic})
    if (!isStatic) {
        body.inertia = Number.POSITIVE_INFINITY
    }

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