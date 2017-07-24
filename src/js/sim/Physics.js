import {CONST} from "../utils/CONST";
import {GEngine} from "./physics/GEngine";
import {emitterTemplate} from "../utils/EmitterBehaviour";
export const Physics = () => {
    const engine = GEngine()

    let mainBody = null

    let grounded = false
    let canSecondJump = false
    let walled = false

    const self = {
        addObject: (go) => {
            if (!go.body.isStatic) {
                mainBody = go.body
            }
            engine.addBody(go.body)
        },
        removeObject: (go) => {
            if (mainBody === go.body) {
                mainBody = null
            }
            engine.removeBody(go.body.id)
        },
        jump: vector => {
            // if (mainBody === null) return
            // vector.x = vector.x < 0 ? Math.max(vector.x, -0.4) : Math.min(vector.x, 0.4)
            // vector.y = vector.y < 0 ? Math.max(vector.y, -0.3) : Math.min(vector.y, 0.3)
            //
            // vector.x < 0 ? mainBodyGo.setDirection(-1) : mainBodyGo.setDirection(1)
            //
            // if (grounded) {
            //     Matter.Body.applyForce(mainBody, mainBody.position, vector)
            //     grounded = false
            //     canSecondJump = true
            // } else {
            //     if (walled) {
            //         Matter.Body.setVelocity(mainBody, new Matter.Vector.create(mainBody.velocity.x, 0))
            //         Matter.Body.applyForce(mainBody, mainBody.position, vector)
            //         walled = false
            //     } else {
            //         if (canSecondJump) {
            //             Matter.Body.setVelocity(mainBody, new Matter.Vector.create(0, mainBody.velocity.y))
            //             Matter.Body.applyForce(mainBody, mainBody.position, vector)
            //             canSecondJump = false
            //         }
            //     }
            // }
        },
        update: () => {
            engine.update(16)
        }
    }

    // Matter.Events.on(engine, 'collisionStart', (e) => {
    //     e.pairs.forEach(pair => {
    //         if (pair.bodyA.collisionFilter.category !== CONST.PMASK.FROG &&
    //             pair.bodyB.collisionFilter.category !== CONST.PMASK.FROG) return
    //
    //         const frogBody = pair.bodyA.collisionFilter.category === CONST.PMASK.FROG ? pair.bodyA : pair.bodyB
    //         const otherBody = pair.bodyA === frogBody ? pair.bodyB : pair.bodyA
    //
    //         switch (otherBody.collisionFilter.category) {
    //             case CONST.PMASK.FLOOR:
    //                 console.log('frog grounded')
    //                 grounded = true
    //                 canSecondJump = false
    //                 walled = false
    //
    //                 mainBodyGo.setJumpMode(false)
    //                 break
    //             case CONST.PMASK.WALL:
    //                 console.log('frog walled')
    //                 grounded = false
    //                 walled = true
    //
    //                 mainBodyGo.setWallAttach()
    //                 break
    //             case CONST.PMASK.DEATH:
    //                 console.log('frog dead')
    //                 self.emit('death')
    //                 break
    //         }
    //     })
    // })

    // Matter.Events.on(engine, 'collisionEnd', (e) => {
    //     e.pairs.forEach(pair => {
    //         if (pair.bodyA.collisionFilter.category !== CONST.PMASK.FROG &&
    //             pair.bodyB.collisionFilter.category !== CONST.PMASK.FROG) return
    //
    //         const frogBody = pair.bodyA.collisionFilter.category === CONST.PMASK.FROG ? pair.bodyA : pair.bodyB
    //         const otherBody = pair.bodyA === frogBody ? pair.bodyB : pair.bodyA
    //
    //         switch (otherBody.collisionFilter.category) {
    //             case CONST.PMASK.FLOOR:
    //                 mainBodyGo.setJumpMode(true)
    //                 break
    //             case CONST.PMASK.WALL:
    //                 mainBodyGo.setJumpMode(true)
    //                 break
    //         }
    //     })
    // })

    const emitterDict = {}
    Object.assign(self, emitterTemplate(emitterDict))

    return self
}