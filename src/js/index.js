import {Renderer} from "./sim/Renderer";
import {Physics} from "./sim/Physics";
import {GameObject} from "./sim/GameObject";
import {DOMUtils} from "./utils/DOMUtils";
import {Input} from "./input/Input";
import {CONST} from "./utils/CONST";

window.onload = () => {
    console.log('game starting')

    const canvas = DOMUtils.createElement('canvas', 'gameCanvas')
    document.body.appendChild(canvas)

    const rend = Renderer(canvas)
    const phys = Physics()
    const input = Input(canvas, phys.jump, () => PIXI.utils.isMobile.any, rend.debugDrawLayer)
    const gos = []

    const gameLoop = () => {
        requestAnimationFrame(gameLoop)

        // do routines
        gos.forEach(go => go.update())

        input.update()
        phys.update()
        rend.update()
    }

    const startGame = () => {
        let go
        go = GameObject('leftwall', 'pixel', 0, 300, 30, 600, 0xCCCC00, CONST.PMASK.WALL, true)
        rend.addObject(go)
        phys.addObject(go)
        gos.push(go)

        go = GameObject('rightwall', 'pixel', 400, 300, 30, 600, 0xCCCC00, CONST.PMASK.WALL, true)
        rend.addObject(go)
        phys.addObject(go)
        gos.push(go)

        go = GameObject('floor', 'pixel', 200, 600, 400, 30, 0xCCCC00, CONST.PMASK.FLOOR, true)
        rend.addObject(go)
        phys.addObject(go)
        gos.push(go)

        go = GameObject('ceiling', 'pixel', 200, 0, 400, 30, 0xCC0000, CONST.PMASK.TRAP, true)
        rend.addObject(go)
        phys.addObject(go)
        gos.push(go)

        go = GameObject('platform', 'pixel', 100, 500, 20, 200, 0xCCCC00, CONST.PMASK.WALL, true)
        rend.addObject(go)
        phys.addObject(go)
        gos.push(go)

        go = GameObject('platform2', 'pixel', 140, 220, 100, 20, 0xCCCC00, CONST.PMASK.FLOOR, true)
        rend.addObject(go)
        phys.addObject(go)
        gos.push(go)
        go = GameObject('platform2-2', 'pixel', 180, 190, 20, 50, 0xCC0000, CONST.PMASK.TRAP, true)
        rend.addObject(go)
        phys.addObject(go)
        gos.push(go)

        go = GameObject('frog', 'pixel', 70, 40, 32, 32, 0x00CC00, CONST.PMASK.FROG, false)
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