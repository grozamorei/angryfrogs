import {Renderer} from "./sim/Renderer";
import {Physics} from "./sim/Physics";
import {GameObject} from "./sim/GameObject";
import {DOMUtils} from "./utils/DOMUtils";
import {Input} from "./input/Input";
import {CONST} from "./utils/CONST";
import {Resources} from "./utils/Resources";
import {Util} from "./utils/Util";
import {Platform} from "./platform/Platform";

window.onload = () => {
    console.log(window.location)
    const platform = Platform()

    const canvas = DOMUtils.createElement('canvas', 'gameCanvas')
    document.body.appendChild(canvas)

    const resources = window.resources = Resources()

    const rend = Renderer(canvas)
    const phys = Physics()
    const input = Input(canvas, phys.jump, () => PIXI.utils.isMobile.any, rend.debugDrawLayer)
    const gos = []

    const respawnLocations = []
    let frog = null

    const gameLoop = () => {
        requestAnimationFrame(gameLoop)

        // do routines
        gos.forEach(go => go.update())

        input.update()
        phys.update()
        rend.update()
    }

    const respawn = () => {
        if (frog) {
            rend.removeObject(frog)
            phys.removeObject(frog)
            gos.splice(gos.indexOf(frog), 1)
            frog.destroy()
        }

        const respawns = respawnLocations[Util.getRandomInt(0, respawnLocations.length-1)]

        frog = GameObject('frog', 'pixel', respawns.x, respawns.y, 32, 32, 0x00CC00, CONST.PMASK.FROG, false)
        rend.addObject(frog)
        phys.addObject(frog)
        gos.push(frog)
    }
    phys.on('death', () => {
        let data = Object.assign({score: Util.getRandomInt(1, 10000)}, platform.userData)
        console.log(data.score)
        Util.postRequest(window.location.protocol + '//' + window.location.hostname + ':8443/setScore', JSON.stringify(data)).then(
            () => { console.log ('URL REQUEST: SUCCESS') },
            () => {console.log('URL REQUEST: FAILED')}
        )
        respawn()
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
                const go = GameObject(
                    l.name.toLowerCase() + '_' + i.toString(),
                    'pixel',
                    obj.x, obj.y, obj.width, obj.height,
                    Util.hexColorToRgbInt(l.color), CONST.PMASK[l.name], true
                )
                rend.addObject(go)
                phys.addObject(go)
                gos.push(go)
            }
        })

        respawn()

        requestAnimationFrame(gameLoop)
    }

    //
    // preload all assets
    resources
        .add('pixel', 'assets/pixel.png')
        .add('map', 'assets/maptest.json')
        .load(startGame)
}