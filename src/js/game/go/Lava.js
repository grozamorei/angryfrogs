import {
    INamedObject, ISprite, IStaticBody, ITypedObject,
    ObjectType
} from "./GameObjectBase";
import {PMASK} from "../physics/GEngine";

export const Lava = (rend, phys) => {

    const self = {
        reset: () => {
            self.visual.height = 0
            self.body.radius.y = 0
            self.visual.y = 0
        },
        update: (dt, jumpHeight, cameraPos, rendererSize) => {
            dt = dt / 1000

            let speed = 0
            if (jumpHeight < 1500) {
                speed = 0
            } else if (jumpHeight < 1000) {
                speed = 40
            } else if (jumpHeight < 3000) {
                speed = 45
            } else if (jumpHeight < 5000) {
                speed = 50
            } else if (jumpHeight < 7000) {
                speed = 55
            } else {
                speed = 60
            }

            const rise = speed * dt
            self.visual.height += rise*2
            self.body.radius.y += rise

            self.visual.x = self.body.center.x = rendererSize.x/2
            const newPos = -cameraPos.y + rendererSize.y
            const diff = Math.abs(newPos - self.visual.y)

            self.visual.height = Math.max(2, self.visual.height - diff*2)
            self.body.radius.y = Math.max(2, self.body.radius.y - diff)
            self.visual.y = self.body.center.y = newPos
        },
    }

    Object.assign(self, ITypedObject(ObjectType.LAVA))
    Object.assign(self, INamedObject('lava'))
    Object.assign(self, ISprite('pixel', 0, 0, 800, 0, 0xCC0000))
    Object.assign(self, IStaticBody(self, PMASK.DEATH))

    rend.addObject(self)
    phys.addBody(self.body)
    self.reset()

    return self
}