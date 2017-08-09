import {DOMUtils} from "./game/utils/DOMUtils";
import {Input} from "./game/Input";
import {Resources} from "./game/utils/Resources";
import {Util} from "./game/utils/Util";
import {CreateDetectedPlatform} from "./platform/Platform";
import {StaticObject} from "./game/go/StaticObject";
import {Renderer} from "./game/Renderer";
import {GEngine, GEngineE, PMASK} from "./game/physics/GEngine";
import {Controller} from "./game/Controller";

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
        let data = Object.assign({score: controller.score}, platform.userData)
        console.log('sending score: ', data.score)
        Util.postRequest(window.location.protocol + '//' + window.location.hostname + ':8443/setScore', JSON.stringify(data)).then(
            () => { console.log ('URL REQUEST: SUCCESS') },
            () => {console.log('URL REQUEST: FAILED')}
        )
        controller.respawn(respawnLocations)
    })

    const startGame = () => {
        const possibleMaps = resources.getJSON('patterns').start
        const startMap = possibleMaps[Util.getRandomInt(0, possibleMaps.length-1)].alias
        const map = resources.getJSON(startMap)
        console.log('starting with map ' + startMap)
        map.layers.forEach(l => {
            if (l.name === 'RESPAWN') {
                l.objects.forEach(resp => {
                    respawnLocations.push({x:resp.x, y: resp.y})
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
        .add('frog.idle', 'assets/frog/idle.png')
        .add('frog.jump', 'assets/frog/jump.png')
        .add('frog.walljump', 'assets/frog/walljump.png')
        .add('frog.midair', 'assets/frog/midair.png')
        .load(() => {
            resources.getJSON('patterns').start.forEach(t => {
                resources.add(t.alias, t.path)
            })
            resources.load(startGame)
        })
}