export const Renderer = (canvas) => {

    let virtualSizeX = 800, virtualSizeY = 1280
    console.log(virtualSizeX / virtualSizeY)
    let canvasW = 0, canvasH = 0

    const stage = new PIXI.Container()
    const renderer = PIXI.autoDetectRenderer({
        width: virtualSizeX,
        height: virtualSizeY,
        view: canvas,
        backgroundColor: 0x110000
    })
    const graphics = new PIXI.Graphics()

    const resizeCanvas = () => {
        canvasW = Math.max(window.innerWidth || 0, document.documentElement.clientWidth)
        canvasH = Math.max(window.innerHeight || 0, document.documentElement.clientHeight)

        renderer.resize(virtualSizeX * (canvasH / virtualSizeY), canvasH)
        const hMargin = (canvasW - renderer.width) / 2
        // console.log('hmargin:', hMargin, '%:', (hMargin / canvasW) * 100)
        canvas.style.marginLeft = hMargin.toString() + 'px'

        stage.scale.x = renderer.width / virtualSizeX
        stage.scale.y = renderer.height / virtualSizeY
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