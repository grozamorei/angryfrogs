export const Renderer = (canvas) => {

    let vSize = {x: 800, y: 1280}
    let canvasW = 0, canvasH = 0

    const stage = new PIXI.Container()
    const scrollContainer = new PIXI.Container()
    stage.addChild(scrollContainer)
    scrollContainer.y = 1280
    const renderer = PIXI.autoDetectRenderer({
        roundPixels: true,
        width: vSize.x,
        height: vSize.y,
        view: canvas,
        backgroundColor: 0x817066
    })
    const graphics = new PIXI.Graphics()
    stage.addChild(graphics)

    const resizeCanvas = () => {
        canvasW = Math.max(window.innerWidth || 0, document.documentElement.clientWidth)
        canvasH = Math.max(window.innerHeight || 0, document.documentElement.clientHeight)

        renderer.resize(vSize.x * (canvasH / vSize.y), canvasH)
        const hMargin = (canvasW - renderer.width) / 2
        canvas.style.marginLeft = hMargin.toString() + 'px'

        stage.scale.x = renderer.width / vSize.x
        stage.scale.y = renderer.height / vSize.y
    }
    resizeCanvas()

    return {
        get size() { return vSize },
        get stage() { return stage },
        get scroll() { return scrollContainer },
        /** @type PIXI.Graphics */
        get debugDrawLayer() { return graphics },
        addObject: (go) => {
            scrollContainer.addChild(go.visual)
            if ('debugVisual' in go) {
                scrollContainer.addChild(go.debugVisual)
            }
        },
        removeObject: (go) => {
            scrollContainer.removeChild(go.visual)
            if ('debugVisual' in go) {
                scrollContainer.removeChild(go.debugVisual)
            }
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