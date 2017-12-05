import {HackMesh} from "../../pixi/HackMesh";

export const ISimpleMesh = (tex, x, y, w, h, tint) => {return IVisual(PIXI.Sprite, tex, x, y, w, h, tint)}
export const ITiledMesh = (tex, x, y, w, h, tint) => {return IVisual(HackMesh, tex, x, y, w, h, tint)}
const IVisual = (SpriteConstructor, tex, x, y, w, h, tint) => {
    const sprite = new SpriteConstructor(window.resources.getTexture(tex))
    sprite.width = w; sprite.height = h
    sprite.x = x; sprite.y = y
    sprite.tint = tint
    sprite.anchor.sprite = s.anchor.y = 0.5

    return {
        get visual() { return sprite }
    }
}

const IBody = (self) => {

}