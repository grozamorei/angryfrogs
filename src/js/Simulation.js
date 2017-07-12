import {Renderer} from "./Renderer";
export const SimulationConstructor = () => {

    const rend = Renderer()

    const gameLoop = () => {
        requestAnimationFrame(gameLoop)

        // do routines
        rend.update()
    }

    requestAnimationFrame(gameLoop)
}