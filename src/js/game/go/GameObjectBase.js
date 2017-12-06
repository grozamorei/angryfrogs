import {HackMesh} from "../../pixi/HackMesh";
import {GBody} from "../physics/GBody";
import {GPoint} from "../physics/GUtils";

export const INamedObject = (name) => {
    return {
        get name() { return name }
    }
}

export const ISprite = (tex, x, y, w, h, tint) => {return IVisual(PIXI.Sprite, tex, x, y, w, h, tint)}
export const ITiledMesh = (tex, x, y, w, h, tint) => {return IVisual(HackMesh, tex, x, y, w, h, tint)}
const IVisual = (SpriteConstructor, tex, x, y, w, h, tint) => {
    const sprite = new SpriteConstructor(window.resources.getTexture(tex))
    sprite.width = w; sprite.height = h
    sprite.x = x; sprite.y = y
    sprite.tint = tint
    if (sprite.anchor)  { sprite.anchor.x = sprite.anchor.y = 0.5 }

    return {
        get visual() { return sprite }
    }
}

export const IColliderBody = (state, mask, collider) => { return IBody(state, mask, true, collider) }
export const IStaticBody = (state, mask) => { return IBody(state, mask, false, undefined) }
const IBody = (state, mask, isInteractive, collider) => {
    const sprite = state.visual
    let body
    if (collider) {
        body = GBody(
            GPoint(sprite.x + collider.x + collider.w/2, sprite.y + collider.y + collider.h/2),
            GPoint(collider.w/2, collider.h/2)
        )
        if (sprite.anchor) {
            sprite.anchor.x = (collider.x + collider.w/2) / sprite.width
            sprite.anchor.y = (collider.y + collider.y/2) / sprite.height
        }
    } else {
        body = GBody(
            GPoint(sprite.x + sprite.width/2, sprite.y + sprite.height/2),
            GPoint(sprite.width/2, sprite.height/2)
        )
        if (sprite.anchor) {
            sprite.anchor.x = sprite.anchor.y = 0.5
        }
    }

    body.setOption('label', state.name + '_body')
        .setOption('isInteractive', isInteractive)
        .setOption('collisionFilter', mask)

    return {
        get body() { return body }
    }
}

export const IDebugVisual = (self) => {
    const root = new PIXI.Container()
    if (self.visual) {
        const s = new PIXI.Sprite(window.resources.getTexture('pixel'))
        s.width = self.visual.width; s.height = self.visual.height
        s.tint = 0x00CC00
        s.alpha = 0.2
        if (self.anchor) {
            s.anchor.x = self.anchor.x
            s.anchor.y = self.anchor.y
        } else {
            s.anchor.x = s.anchor.y = 0.5
        }

        root.addChild(s)
    }

    if (self.body) {
        const s = new PIXI.Sprite(window.resources.getTexture('pixel'))
        s.width = self.body.radius.x * 2; s.height = self.body.radius.y * 2
        s.tint = 0x0000CC
        s.alpha = 0.2
        s.anchor.x = s.anchor.y = 0.5

        root.addChild(s)
    }


    return {
        get debugVisual() { return root }
    }
}