export const Renderer = (canvas) => {
    const debug = window.debugMenu

    let vSize = {x: 800, y: 1280}
    let canvasW = 0, canvasH = 0

    const stage = new PIXI.Container()
    const scrollContainer = new PIXI.Container()
    stage.addChild(scrollContainer)
    scrollContainer.y = 1280

    const renderer = PIXI.autoDetectRenderer({
        roundPixels: false,
        width: vSize.x,
        height: vSize.y,
        view: canvas,
        backgroundColor: 0x817066,
        antialias: false,
        resolution: 1,
        forceFXAA: false,
        // autoResize: false
    })
    const graphics = new PIXI.Graphics()
    stage.addChild(graphics)

    const resizeCanvas = () => {
        canvasW = Math.max(window.innerWidth || 0, document.documentElement.clientWidth)
        canvasH = Math.max(window.innerHeight || 0, document.documentElement.clientHeight)

        renderer.resize(Math.round(vSize.x * (canvasH / vSize.y)), canvasH)
        const hMargin = debug.visible ? 0 : (canvasW - renderer.width) / 2
        canvas.style.marginLeft = hMargin.toString() + 'px'

        stage.scale.x = renderer.width / vSize.x
        stage.scale.y = renderer.height / vSize.y
    }
    resizeCanvas()

    debug.on('visibility', _ => resizeCanvas())

    return {
        get size() { return vSize },
        get stage() { return stage },
        get scroll() { return scrollContainer },
        /** @type PIXI.Graphics */
        get debugDrawLayer() { return graphics },
        addObject: (go) => {
            go.hasVisual && scrollContainer.addChild(go.visual)
            go.hasDebugVisual && go.debugAddAll(scrollContainer)
        },
        removeObject: (go) => {
            go.hasVisual && scrollContainer.removeChild(go.visual)
            go.hasDebugVisual && go.debugRemoveFrom(scrollContainer)
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