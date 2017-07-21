import * as go from "./GameObjectBehaviours";

export const StaticObject = (name, texture, x, y, w, h, tint, physicsMask) => {

    const state = {
        /** @type PIXI.Sprite */
        sprite: null,
        /** @type Matter.Bodies.rectangle */
        body: null
    }

    const self = {
        update: () => {}
    }

    Object.assign(self, go.createTemplate(state, name, texture, x, y, w, h, tint, physicsMask, true))

    return self
}