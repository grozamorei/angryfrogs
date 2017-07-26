import * as go from "./GameObjectBehaviours";

export const StaticObject = (name, texture, x, y, w, h, tint, physicsMask) => {

    const state = {
        /** @type PIXI.Sprite */
        sprite: null,
        body: null
    }

    const self = {
        isOutOfBounds: yBound => Math.abs(y + h/2) < yBound,
    }

    Object.assign(self, go.createTemplate(state, name, texture, x, y, w, h, tint, physicsMask, true))

    return self
}