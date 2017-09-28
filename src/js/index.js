import {DOMUtils} from "./game/utils/DOMUtils";
import {Input} from "./game/Input";
import {Resources} from "./game/utils/Resources";
import {Util} from "./game/utils/Util";
import {CreateDetectedPlatform} from "./platform/Platform";
import {StaticObject} from "./game/go/StaticObject";
import {Renderer} from "./game/Renderer";
import {GEngine, GEngineE, PMASK} from "./game/physics/GEngine";
import {Controller} from "./game/controller/Controller";

window.onload = () => {
    // console.log(window.location)
    const platform = CreateDetectedPlatform()

    const canvas = DOMUtils.createElement('canvas', 'gameCanvas')
    document.body.appendChild(canvas)

    const resources = window.resources = Resources()
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

    const startGame = () => {
        const possibleMaps = resources.getJSON('patterns').start
        const startMap = possibleMaps[Util.getRandomInt(0, possibleMaps.length-1)].alias
        const map = resources.getJSON(/*startMap*/'test')
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
                    go = StaticObject(
                        obj.name, 'assets/' + obj.name,
                        obj.x, obj.y-rend.size.y, obj.width, obj.height,
                        0xFFFFFF, PMASK.NONE)
                } else {
                    go = StaticObject(
                        l.name.toLowerCase() + '_' + i.toString(),
                        'pixel',
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
    resources
        .add('patterns', 'assets/patterns/digest.json')
        .add('pixel', 'assets/pixel.png')
        .add('frog.idle', 'assets/frog.draft/idle.png')
        .add('frog.jump_00', 'assets/frog.draft/jump_00.png')
        .add('frog.jump_01', 'assets/frog.draft/jump_01.png')
        .add('frog.jump_02', 'assets/frog.draft/jump_02.png')
        .add('frog.walled', 'assets/frog.draft/walled.png')
        .add('frog.walled.prepare.jump', 'assets/frog.draft/walled.prepare.jump.png')
        .add('frog.prepare.jump.00', 'assets/frog.draft/prepare.jump.00.png')
        .add('frog.prepare.jump.01', 'assets/frog.draft/prepare.jump.01.png')
        .add('frog.midair.prepare.jump', 'assets/frog.draft/midair.prepare.jump.png')
        .add('frog.midair.head.hit', 'assets/frog.draft/midair.head.hit.png')
        .add('frog.slide_00', 'assets/frog.draft/slide_00.png')
        .add('frog.slide_01', 'assets/frog.draft/slide_01.png')
        .load(() => {
            resources.getJSON('patterns').first.forEach(t=>resources.add(t.alias, t.path))
            resources.getJSON('patterns').start.forEach(t =>resources.add(t.alias, t.path))
            resources.load(startGame)
        })
}