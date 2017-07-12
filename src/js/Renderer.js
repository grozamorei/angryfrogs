import {DOMUtils} from "./utils/DOMUtils";
export const Renderer = () => {

    let canvasW, canvasH = 0
    const canvas = DOMUtils.createElement('canvas', 'gameCanvas')

    const stage = new PIXI.Stage()
    const renderer = PIXI.autoDetectRenderer({
        autoResize: true,
        view: canvas,
        backgroundColor: 0x110000,
        resolution: window.devicePixelRatio
    })
    document.body.appendChild(renderer.view)

    let fr
    const resizeCanvas = () => {
        canvasW = Math.max(window.innerWidth || 0, document.documentElement.clientWidth)
        canvasH = Math.max(window.innerHeight || 0, document.documentElement.clientHeight)
        renderer.resize(canvasW, canvasH)

        if (fr) {
            fr.x = canvasW / 2
            fr.y = canvasH / 2
        }

        // console.log('new size: ', canvasW, canvasH, canvasH / canvasW)
    }
    resizeCanvas()

    PIXI.loader.add('frog', 'assets/frog.png').load((loader, resources) => {
        fr = new PIXI.Sprite(resources.frog.texture)
        fr.anchor.x = fr.anchor.y = 0.5
        fr.width = fr.height = 64
        stage.addChild(fr)
        resizeCanvas()
    })

    return {
        update: () => {
            const newCanvasW = Math.max(window.innerWidth || 0, document.documentElement.clientWidth)
            const newCanvasH = Math.max(window.innerHeight || 0, document.documentElement.clientHeight)
            if (newCanvasW !== canvasW || newCanvasH !== canvasH) {
                resizeCanvas()
            }
            if (fr) {
                fr.rotation += 0.01
            }
            renderer.render(stage)
        }
    }
}