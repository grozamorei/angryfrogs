import {Util} from "../utils/Util";
import {
    ObjectType,
    IColliderBody, IDebugVisual, INamedObject,
    ISprite, ITypedObject
} from "./GameObjectBase";
import {PMASK} from "../physics/GEngine";

/**
 * State object of a frog and inner logic
 * @constructor
 */
export const Frog = (x, y) => {

    //
    // frog setup parameters
    const animations = 
    {
        idle: 'frog.idle',
        'jump_00': 'frog.jump_00', 'jump_01': 'frog.jump_01', 'jump_02': 'frog.jump_02',
        'prepare.jump.00': 'frog.prepare.jump.00', 'prepare.jump.01': 'frog.prepare.jump.01',
        walled: 'frog.walled', 'walled.prepare.jump': 'frog.walled.prepare.jump',
        'midair.head.hit': 'frog.midair.head.hit', 'midair.prepare.jump': 'frog.midair.prepare.jump'
    }
    const w = 256, h = 256
    const physicsMask = PMASK.FROG
    const collider = {x: 87, y: 121, w: 80, h: 148}

    let lastAnimationKey = 'idle'
    let nextAnimationFrameIn = NaN
    let maxFrame = {'jump': 2, 'slide': 1}
    let animationType = {'jump': 'linear', 'slide': 'cycle'}

    const self = {
        update: () => {
            const x = Math.round(self.body.center.x); const y = Math.round(self.body.center.y)
            self.visual.x = self.debugVisual.visual.x = self.debugVisual.body.x = x
            self.visual.y = self.debugVisual.visual.y = self.debugVisual.body.y = y
            if (!isNaN(nextAnimationFrameIn)) {
                nextAnimationFrameIn -= 1
                if (nextAnimationFrameIn === 0) {
                    const scaleX = self.visual.scale.x
                    const aData = lastAnimationKey.split('_')
                    const anim = aData[0]
                    const frame = parseInt(aData[1])
                    if (animationType[anim] === 'linear') { // progress frames
                        if (frame < maxFrame[aData[0]]) {
                            self.updateAnimation(aData[0] + '_0' + (frame+1), Util.normalizeValue(scaleX), true)
                        } else {
                            nextAnimationFrameIn = NaN
                        }
                    } else if (animationType[anim] === 'cycle') { // cycle frames
                        if (frame < maxFrame[anim]) {
                            self.updateAnimation(aData[0] + '_0' + (frame+1), Util.normalizeValue(scaleX), true)
                        } else {
                            self.updateAnimation(aData[0] + '_00', Util.normalizeValue(scaleX), true)
                        }
                    }
                }
            }
        },
        get lastAnimation() { return lastAnimationKey },
        updateAnimation(name, faceDir, keyFrameSwitch = false) {
            const scaleX = self.visual.scale.x
            if (name === lastAnimationKey && Util.normalizeValue(scaleX) === faceDir) return
            nextAnimationFrameIn = keyFrameSwitch ? 1 : NaN
            lastAnimationKey = name
            self.visual.texture = window.resources.getTexture(animations[name])
            self.visual.scale.x = faceDir * Math.abs(scaleX)
        },
        getCollisions(intersection, doWhat) {
            if (self.body.collisions.size > 0) {
                self.body.collisions.forEach(c => {
                    if (intersection & c.intersection) {
                        doWhat(c)
                    }
                })
            }
        },
        reset(atX, atY) {
            self.body.reset()
            self.body.center.x = self.visual.x = self.debugVisual.visual.x = self.debugVisual.body.x = atX
            self.body.center.y = self.visual.y = self.debugVisual.visual.y = self.debugVisual.body.y = atY
            self.updateAnimation('idle', -1)
        }
    }

    Object.assign(self, ITypedObject(ObjectType.FROG))
    Object.assign(self, INamedObject('frog'))
    Object.assign(self, ISprite(animations.idle, x, y, w, h, 0xFFFFFF))
    Object.assign(self, IColliderBody(self, physicsMask, collider))
    Object.assign(self, IDebugVisual(self))

    return self
}