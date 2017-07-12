
export const Physics = () => {
    const engine = Matter.Engine.create()
    engine.world = Matter.World.create({gravity: {x:0, y:1}})

    return {
        addObject: (go) => {
            Matter.World.add(engine.world, go.body)
        },
        update: () => {
            Matter.Engine.update(engine)
        }
    }
}