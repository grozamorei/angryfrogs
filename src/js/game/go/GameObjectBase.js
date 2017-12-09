import {HackMesh} from "../../pixi/HackMesh";
import {GBody} from "../physics/GBody";
import {GPoint} from "../physics/GUtils";

export const ObjectType = { FROG: 'frog', IMAGE: 'image', LAVA: 'lava', RESPAWN: 'respawn', PLATFORM: 'platform' }

export const ITypedObject = (v) => {
    return {
        get type() { return v }
    }
}

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
        get hasVisual() { return true },
        get visual() { return sprite }
    }
}

export const IColliderBody = (state, mask, collider) => { return IBody(state, mask, true, false, collider) }
export const IStaticBody = (state, mask) => { return IBody(state, mask, false, false, undefined) }
export const ITriggerBody = (state, mask) => { return IBody(state, mask, false, true, undefined) }
const IBody = (state, mask, isInteractive, isTrigger, collider) => {
    const sprite = state.hasVisual ? state.visual : state
    let body
    if (collider) {
        body = GBody(
            GPoint(sprite.x, sprite.y),
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
        .setOption('isTrigger', isTrigger)
        .setOption('collisionFilter', mask)
    // if (isTrigger) {console.log(body)}

    return {
        get hasBody() { return true },
        get body() { return body }
    }
}

export const IDebugVisual = (self) => {
    const staff = {}

    if (self.hasVisual) {
        const s = new PIXI.Sprite(window.resources.getTexture('pixel'))
        s.width = self.visual.width; s.height = self.visual.height
        s.tint = 0x00CC00
        s.alpha = 0.2
        if (self.visual.anchor !== undefined) {
            s.anchor.x = self.visual.anchor.x
            s.anchor.y = self.visual.anchor.y
        } else {
            s.anchor.x = s.anchor.y = 0.5
        }

        staff.visual = s
    }

    if (self.hasBody) {
        const s = new PIXI.Sprite(window.resources.getTexture('pixel'))
        s.width = self.body.radius.x * 2; s.height = self.body.radius.y * 2
        s.tint = 0x0000CC
        s.alpha = 0.2
        s.anchor.x = s.anchor.y = 0.5

        staff.body = s
    }

    // if (!self.hasVisual && (!self.hasBody || self.hasBody && self.body.isTrigger) && (self.x && self.y)) {
    //     const s = new PIXI.Sprite(window.resources.getTexture('pixel'))
    //     s.width = 81
    //     s.height = 81
    //     s.tint = 0xCCCCCC
    //     s.alpha = 0.4
    //     s.anchor.x = s.anchor.y = 0.5
    //     s.x = self.x; s.y = self.y
    //     staff.simple = s
    // }

    for(const k in staff) {
        staff[k].visible = window.debugMenu.params.showInvisibleStuff
    }
    window.debugMenu.on('paramChange', (k, v) => {
        if (k !== 'showInvisibleStuff') return
        for(const k in staff) {
            staff[k].visible = v
        }
    })


    return {
        get hasDebugVisual() { return true },
        get debugVisual() { return staff },
        debugAddAll(container) {
            for(const k in staff) {
                container.addChild(staff[k])
            }
        },
        debugRemoveFrom(container) {
            for(const k in staff) {
                container.removeChild(staff[k])
            }
        }
    }
}