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
    const gos = []
    const controller = Controller(rend, phys, input, gos)

    let frameCounter = 0
    const gameLoop = () => {
        requestAnimationFrame(gameLoop)

        input.update()
        phys.update(16, frameCounter++)
        controller.update()
        rend.update()
    }

    const respawnLocations = []
    phys.on(GEngineE.DEATH, () => {
        let data = Object.assign({score: controller.score}, platform.userData)
        console.log(data.score)
        Util.postRequest(window.location.protocol + '//' + window.location.hostname + ':8443/setScore', JSON.stringify(data)).then(
            () => { console.log ('URL REQUEST: SUCCESS') },
            () => {console.log('URL REQUEST: FAILED')}
        )
        controller.respawn(respawnLocations)
    })

    const startGame = () => {
        //
        // build map
        const map = resources.getJSON('map')
        map.layers.forEach(l => {
            if (l.name === 'RESPAWN') {
                l.objects.forEach(resp => {
                    respawnLocations.push({x:resp.x, y: resp.y})
                })
                return
            }

            for (let i = 0; i < l.objects.length; i++) {
                const obj = l.objects[i]
                const go = StaticObject(
                    l.name.toLowerCase() + '_' + i.toString(),
                    'pixel',
                    obj.x, obj.y-rend.size.y, obj.width, obj.height,
                    Util.hexColorToRgbInt(l.color), PMASK[l.name]
                )
                rend.addObject(go)
                phys.addBody(go.body)
                gos.push(go)
            }
        })

        controller.respawn(respawnLocations)

        requestAnimationFrame(gameLoop)
    }

    //
    // preload all assets
    resources
        .add('pixel', 'assets/pixel.png')
        .add('frog.idle', 'assets/frog/idle.png')
        .add('frog.jump', 'assets/frog/jump.png')
        .add('frog.walljump', 'assets/frog/walljump.png')
        .add('frog.midair', 'assets/frog/midair.png')
        .add('map', 'assets/maptest2.json')
        .load(startGame)
}