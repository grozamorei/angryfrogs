import {
    INamedObject, ISprite, ITypedObject,
    ObjectType
} from "./GameObjectBase";

export const ImageObject = (name, texture, x, y, w, h, tint) => {
    const self = {}

    Object.assign(self, ITypedObject(ObjectType.IMAGE))
    Object.assign(self, INamedObject(name))
    Object.assign(self, ISprite(texture, x, y, w, h, tint))

    return self
}