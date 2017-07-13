import {CONST} from "../utils/CONST";
export const Physics = () => {
    const engine = Matter.Engine.create()
    engine.world = Matter.World.create({gravity: {x:0, y:1}})

    let mainBody

    let grounded = false
    let canSecondJump = false
    let walled = false

    Matter.Events.on(engine, 'collisionStart', (e) => {
        e.pairs.forEach(pair => {
            if (pair.bodyA.collisionFilter.category !== CONST.PMASK.FROG &&
                pair.bodyB.collisionFilter.category !== CONST.PMASK.FROG) return

            const frogBody = pair.bodyA.collisionFilter.category === CONST.PMASK.FROG ? pair.bodyA : pair.bodyB
            const otherBody = pair.bodyA === frogBody ? pair.bodyB : pair.bodyA

            switch (otherBody.collisionFilter.category) {
                case CONST.PMASK.FLOOR:
                    console.log('frog grounded')
                    grounded = true
                    canSecondJump = false
                    walled = false
                    break
                case CONST.PMASK.WALL:
                    console.log('frog walled')
                    grounded = false
                    walled = true
                    break
                case CONST.PMASK.TRAP:
                    console.log('DESU')
                    break
            }
        })
    })

    Matter.Events.on(engine, 'collisionEnd', (e) => {
        // console.log('ended', e.pairs[0].bodyA.label, e.pairs[0].bodyB.label)
        // console.log(e)
    })

    return {
        addObject: (go) => {
            if (!go.body.isStatic) {
                mainBody = go.body
            }
            Matter.World.add(engine.world, go.body)
        },
        jump: vector => {
            vector.x = vector.x < 0 ? Math.max(vector.x, -0.015) : Math.min(vector.x, 0.015)
            vector.y = vector.y < 0 ? Math.max(vector.y, -0.04) : Math.min(vector.y, 0.04)
            if (grounded) {
                Matter.Body.applyForce(mainBody, mainBody.position, vector)
                grounded = false
                canSecondJump = true
            } else {
                if (walled) {
                    Matter.Body.setVelocity(mainBody, new Matter.Vector.create(mainBody.velocity.x, 0))
                    Matter.Body.applyForce(mainBody, mainBody.position, vector)
                    walled = false
                } else {
                    if (canSecondJump) {
                        Matter.Body.setVelocity(mainBody, new Matter.Vector.create(0, mainBody.velocity.y))
                        Matter.Body.applyForce(mainBody, mainBody.position, vector)
                        canSecondJump = false
                    }
                }
            }
        },
        update: () => {
            Matter.Engine.update(engine)
        }
    }
}