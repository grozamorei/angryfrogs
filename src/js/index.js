import {Renderer} from "./sim/Renderer";
import {Physics} from "./sim/Physics";
import {GameObject} from "./sim/GameObject";

window.onload = () => {
    console.log('game loaded')

    const rend = Renderer()
    const phys = Physics()
    const gos = []

    const gameLoop = () => {
        requestAnimationFrame(gameLoop)

        // do routines
        gos.forEach(go => go.update())

        phys.update()
        rend.update()
    }

    const startGame = () => {
        let go
        go = GameObject('platform', 'pixel', -20, 300, 200, 30, 0xCC0000, true)
        rend.addObject(go)
        phys.addObject(go)
        gos.push(go)
        // go = GameObject('platform', 'pixel', 150, 150, 180, 30, 0x00CC00, true)
        // rend.addObject(go)
        // phys.addObject(go)
        // gos.push(go)

        go = GameObject('frog', 'pixel', 70, 10, 32, 32, 0x00CC00, false)
        rend.addObject(go)
        phys.addObject(go)
        gos.push(go)

        requestAnimationFrame(gameLoop)
    }

    //
    // preload all textures
    PIXI.loader
        .add('frog', 'assets/frog.png')
        .add('pixel', 'assets/pixel.png')
    PIXI.loader.load(() => {
        console.log('textures loaded')
        startGame()
    })
}