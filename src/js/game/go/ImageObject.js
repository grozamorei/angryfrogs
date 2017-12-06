import {INamedObject, ISprite} from "./GameObjectBase";

export const ImageObject = (name, texture, x, y, w, h, tint) => {
    const self = {}

    Object.assign(self, INamedObject(name))
    Object.assign(self, ISprite(texture, x, y, w, h, tint))

    return self
}