import {DOMUtils} from "./utils/DOMUtils";
import {Input} from "./input/Input";
import {CONST} from "./utils/CONST";
import {Resources} from "./utils/Resources";
import {Util} from "./utils/Util";
import {Platform} from "./platform/Platform";
import {StaticObject} from "./game/StaticObject";
import {Frog} from "./game/Frog";
import {Renderer} from "./Renderer";
import {GEngine} from "./sim/GEngine";

window.onload = () => {
    // console.log(window.location)
    const platform = Platform()

    const canvas = DOMUtils.createElement('canvas', 'gameCanvas')
    document.body.appendChild(canvas)

    const resources = window.resources = Resources()
    const rend = Renderer(canvas)
    const phys = GEngine()
    const input = Input(canvas, rend.debugDrawLayer)
    const gos = []

    const respawnLocations = []
    let frog = null

    let frameCounter = 0
    const gameLoop = () => {
        requestAnimationFrame(gameLoop)

        // do routines
        gos.forEach(go => go.update())

        input.update()

        phys.update(16, frameCounter++)

        rend.update()
    }

    input.on('touchEnded', (vector) => {
        if (Number.isNaN(vector.x) || Number.isNaN(vector.y)) {
            console.log('CLICK')
        } else {
            if (vector.y > 0) return
            vector.y /= 15; vector.y = Math.max(-6, vector.y)
            vector.x *= 100; vector.x = vector.x > 0 ? Math.min(300, vector.x) : Math.max(-300, vector.x)
            // console.log(vector)
            phys.applyForce(frog.body.id, vector)
        }
    })

    const respawn = () => {
        if (frog) {
            rend.removeObject(frog)
            phys.removeBody(frog.body.id)
            gos.splice(gos.indexOf(frog), 1)
            frog.destroy()
        }

        const respawns = respawnLocations[Util.getRandomInt(0, respawnLocations.length-1)]

        frog = Frog(
            {idle: 'frog.idle', jump: 'frog.jump', walljump: 'frog.walljump', midair: 'frog.midair'},
            respawns.x, respawns.y,
            160, 160, CONST.PMASK.FROG)
        console.log(frog)
        rend.addObject(frog)
        phys.addBody(frog.body)
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
                const go = StaticObject(
                    l.name.toLowerCase() + '_' + i.toString(),
                    'pixel',
                    obj.x, obj.y, obj.width, obj.height,
                    Util.hexColorToRgbInt(l.color), CONST.PMASK[l.name]
                )
                rend.addObject(go)
                phys.addBody(go.body)
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
        .add('frog.idle', 'assets/frog/idle.png')
        .add('frog.jump', 'assets/frog/jump.png')
        .add('frog.walljump', 'assets/frog/walljump.png')
        .add('frog.midair', 'assets/frog/midair.png')
        .add('map', 'assets/maptest2.json')
        .load(startGame)
}