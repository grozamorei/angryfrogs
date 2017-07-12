
export const SimulationConstructor = () => {

    const gameLoop = () => {
        requestAnimationFrame(gameLoop)

        // do routines
        // console.log('update')
    }
    gameLoop()
}