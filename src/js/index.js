import {DOMUtils} from "./game/utils/DOMUtils";
import {Input} from "./game/Input";
import {Resources} from "./game/utils/Resources";
import {Util} from "./game/utils/Util";
import {CreateDetectedPlatform} from "./platform/Platform";
import {Renderer} from "./game/Renderer";
import {GEngine, GEngineE} from "./game/physics/GEngine";
import {Game} from "./game/Game";
import {DebugMenu} from "./game/DebugMenu"

window.onload = () => {
    const platform = CreateDetectedPlatform()

    const canvas = DOMUtils.createElement('canvas', 'gameCanvas')
    document.body.appendChild(canvas)

    window.debugMenu = DebugMenu()
    const resources = window.resources = Resources()
    PIXI.settings.MIPMAP_TEXTURES = false;

    const fpsCounter = new Stats()
    fpsCounter.showPanel(0)
    if (window.debugMenu.params.fpsCounter) {
        document.body.appendChild(fpsCounter.dom)
    }
    window.debugMenu.on('paramChange', (k, v) => {
        if (k === 'fpsCounter') {
            if (v) document.body.appendChild(fpsCounter.dom)
            else document.body.removeChild(fpsCounter.dom)
        }
    })

    const startGame = () => {
        console.log(resources.raw)
        const rend = Renderer(canvas)
        const phys = GEngine()
        const input = Input(canvas, rend.debugDrawLayer)
        const gameController = Game(rend, phys, input)

        let frameCounter = 0
        let time = Date.now()
        const gameLoop = () => {
            fpsCounter.begin()

            let dt = Date.now() - time
            time = Date.now()
            if (dt > 50) {dt = 17}

            requestAnimationFrame(gameLoop)

            input.update()
            phys.update(dt, frameCounter++)
            gameController.update(dt)
            rend.update()
            PIXI.tweenManager.update()

            fpsCounter.end()
        }

        const respawnLocations = []
        phys.on(GEngineE.DEATH, () => {
            if (gameController.dead) return

            platform.sendScore(gameController.score)
            gameController.respawn(respawnLocations)
        })

        const params = resources.getJSON('params')

        const possibleMaps = resources.getJSON('digest.patterns')
        const randomMap = possibleMaps[Util.getRandomInt(0, possibleMaps.length-1)].alias
        const startMap = params.levels.start || randomMap
        const map = resources.getJSON(startMap)
        gameController.generator.forceGenerate(map, rend.scroll.y, gameController.addObject, gameController.addRespawn)
        gameController.respawn(respawnLocations)

        requestAnimationFrame(gameLoop)
    }

    //
    // preload all assets
    const assetCategories = ['art', 'patterns', 'shaders']
    resources
        .add('params', 'assets/params.json')
        .add('pixel', 'assets/pixel.png')
        .load(() => {
            assetCategories.forEach(cat => {
                resources.add('digest.' + cat, 'assets/' + cat + '/digest.json')
            })
            resources.load(() => {
                assetCategories.forEach(cat => {
                    resources.getJSON('digest.' + cat).forEach(digestItem => {
                        resources.add(digestItem.alias, digestItem.path)
                    })
                })
                resources.load(startGame)
            })
        })
}