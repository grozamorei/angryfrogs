import {DOMUtils} from "./game/utils/DOMUtils";
import {Input} from "./game/Input";
import {Resources} from "./game/utils/Resources";
import {Util} from "./game/utils/Util";
import {CreateDetectedPlatform} from "./platform/Platform";
import {StaticPlatform} from "./game/go/StaticPlatform";
import {Renderer} from "./game/Renderer";
import {GEngine, GEngineE, PMASK} from "./game/physics/GEngine";
import {Controller} from "./game/controller/Controller";
import {DebugMenu} from "./game/DebugMenu"

window.onload = () => {
    const platform = CreateDetectedPlatform()

    const canvas = DOMUtils.createElement('canvas', 'gameCanvas')
    document.body.appendChild(canvas)

    const debug = window.debugMenu = DebugMenu()
    const resources = window.resources = Resources()
    PIXI.settings.MIPMAP_TEXTURES = false;

    const startGame = () => {
        console.log(resources.raw)
        const rend = Renderer(canvas)
        const phys = GEngine()
        const input = Input(canvas, rend.debugDrawLayer)
        const controller = Controller(rend, phys, input)

        let frameCounter = 0
        let time = Date.now()
        const gameLoop = () => {
            const dt = Date.now() - time
            time = Date.now()

            requestAnimationFrame(gameLoop)

            input.update()
            phys.update(dt, frameCounter++)
            controller.update(dt)
            rend.update()
        }

        const respawnLocations = []
        phys.on(GEngineE.DEATH, () => {
            platform.sendScore(controller.score)
            controller.respawn(respawnLocations)
        })

        const params = resources.getJSON('params')

        const possibleMaps = resources.getJSON('digest.patterns')
        const randomMap = possibleMaps[Util.getRandomInt(0, possibleMaps.length-1)].alias
        const startMap = params.levels.start || randomMap
        const map = resources.getJSON(startMap)
        console.log('starting with map ' + startMap)
        map.layers.forEach(l => {
            if (l.name === 'RESPAWN') {
                l.objects.forEach(resp => {
                    controller.addRespawn({x:resp.x + resp.width/2, y: resp.y + resp.height/2 - rend.size.y})
                })
                return
            }

            for (let i = 0; i < l.objects.length; i++) {
                const obj = l.objects[i]
                let go
                if (l.name === 'IMAGE') {
                    // go = StaticPlatform(
                    //     obj.name, 'image.' + obj.name,
                    //     obj.x, obj.y-rend.size.y, obj.width, obj.height,
                    //     0xFFFFFF, PMASK.NONE)
                } else {
                    go = StaticPlatform(
                        l.name.toLowerCase() + '_' + i.toString(),
                        'level.' + PMASK[l.name],
                        obj.x, obj.y-rend.size.y, obj.width, obj.height,
                        Util.hexColorToRgbInt(l.color), PMASK[l.name]
                    )
                }
                controller.addObject(go)
            }
        })

        controller.respawn(respawnLocations)

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