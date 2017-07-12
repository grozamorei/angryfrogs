export const Renderer = (canvas) => {

    let canvasW, canvasH = 0

    const stage = new PIXI.Container()
    const renderer = PIXI.autoDetectRenderer({
        autoResize: true,
        view: canvas,
        backgroundColor: 0x110000,
        resolution: window.devicePixelRatio
    })
    const graphics = new PIXI.Graphics()

    // let fr
    const resizeCanvas = () => {
        canvasW = Math.max(window.innerWidth || 0, document.documentElement.clientWidth)
        canvasH = Math.max(window.innerHeight || 0, document.documentElement.clientHeight)
        renderer.resize(canvasW, canvasH)
        // console.log('new size: ', canvasW, canvasH, canvasH / canvasW)
    }
    resizeCanvas()

    return {
        /** @type PIXI.Graphics */
        get debugDrawLayer() { return graphics },
        addObject: (go) => {
            stage.addChild(go.visual)
            stage.addChild(graphics)
        },
        update: () => {
            const newCanvasW = Math.max(window.innerWidth || 0, document.documentElement.clientWidth)
            const newCanvasH = Math.max(window.innerHeight || 0, document.documentElement.clientHeight)
            if (newCanvasW !== canvasW || newCanvasH !== canvasH) {
                resizeCanvas()
            }

            renderer.render(stage)
        }
    }
}