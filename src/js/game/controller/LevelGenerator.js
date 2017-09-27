import {StaticObject} from "../go/StaticObject";
import {Util} from "../utils/Util";
import {PMASK} from "../physics/GEngine";
export const LevelGenerator = (checkpoint, sceneSize) => {

    let lastWallCheckPoint = 0
    let nextGenerationIn = 200

    const generateRandomEnvironment = (scrollPosition, objectAdder) => {
        if (Math.random() < 0.9 || nextGenerationIn === 200) {
            objectAdder(StaticObject(
                'horizontal_' + Util.getRandomInt(0, 100),
                'pixel',
                Util.getRandomInt(100, sceneSize.x-100), -scrollPosition, Util.getRandomInt(120, 180), 40,
                Util.hexColorToRgbInt('#55557f'), PMASK.PLATFORM_STICKY_THIN
            ))
            nextGenerationIn = 100
        } else {
            objectAdder(StaticObject(
                'vertical_' + Util.getRandomInt(0, 100),
                'pixel',
                Util.getRandomInt(150, sceneSize.x-150), -scrollPosition-200, Util.getRandomInt(30, 50), Util.getRandomInt(300, 350),
                Util.hexColorToRgbInt('#55557f'), PMASK.WALL_STICKY
            ))
            nextGenerationIn = 200
        }

        // if (Math.floor(scrollPosition / sceneSize.y) > lastWallCheckPoint) {
        //     let go1, go2
        //     if (Math.random() < 0.1) { // dont create walls
        //
        //     } else if (Math.random() < 0.4) { // create walls
        //         go1 = StaticObject(
        //             'wall_' + Util.getRandomInt(0, 100), 'pixel',
        //             0, -1 * (sceneSize.y*2 + lastWallCheckPoint*sceneSize.y), 20, sceneSize.y,
        //             Util.hexColorToRgbInt('#55557f'), PMASK.REGULAR)
        //
        //         go2 = StaticObject(
        //             'wall_' + Util.getRandomInt(0, 100), 'pixel',
        //             780, -1 * (sceneSize.y*2 + lastWallCheckPoint*sceneSize.y), 20, sceneSize.y,
        //             Util.hexColorToRgbInt('#55557f'), PMASK.REGULAR)
        //     } else {
        //         const mask1 = Math.random() > 0.5 ? PMASK.DEATH : PMASK.REGULAR
        //         go1 = StaticObject(
        //             'wall_' + Util.getRandomInt(0, 100), 'pixel',
        //             0, -1 * (sceneSize.y*2 + lastWallCheckPoint*sceneSize.y), 20, sceneSize.y,
        //             Util.hexColorToRgbInt(mask1 === PMASK.DEATH ? "#000000" : '#55557f'), mask1)
        //
        //         const mask2 = mask1 === PMASK.REGULAR ? PMASK.DEATH : Math.random() > 0.5 ? PMASK.DEATH : PMASK.REGULAR
        //         go2 = StaticObject(
        //             'wall_' + Util.getRandomInt(0, 100), 'pixel',
        //             780, -1 * (sceneSize.y*2 + lastWallCheckPoint*sceneSize.y), 20, sceneSize.y,
        //             Util.hexColorToRgbInt(mask2 === PMASK.DEATH ? "#000000": '#55557f'), mask2)
        //     }
        //     if (go1 || go2) {
        //         objectAdder(go1)
        //         objectAdder(go2)
        //     }
        //     lastWallCheckPoint+=1
        // }
    }

    const generateTemplateEnvironment = (key, scrollPosition, objectAdder, envAdder, respAdder) => {
        const possibleTemplates = resources.getJSON('patterns')[key]
        const template = possibleTemplates[Util.getRandomInt(0, possibleTemplates.length-1)].alias
        const map = resources.getJSON(template)
        console.log('generating template ' + template)

        map.layers.forEach(l => {
            if (l.name === 'RESPAWN') {
                l.objects.forEach(resp => {
                    respAdder({x:resp.x + resp.width/2, y: -scrollPosition - sceneSize.y + (resp.y + resp.height/2)})
                })
            } else {
                l.objects.forEach(o => {
                    objectAdder(StaticObject(
                        'regular_' + Util.getRandomInt(0, 1000), 'pixel', o.x, -scrollPosition - (sceneSize.y - o.y),
                        o.width, o.height, Util.hexColorToRgbInt(l.color), PMASK[l.name]
                    ))
                })
            }
        })

        nextGenerationIn = 1400
    }

    return {
        update(scrollPosition, objectAdder, envAdder, respAdder) {
            if (scrollPosition - checkpoint < nextGenerationIn) return
            checkpoint = scrollPosition

            if (Math.random() < 0.1) {
                generateTemplateEnvironment('first', scrollPosition, objectAdder, envAdder, respAdder)
            } else{
                generateRandomEnvironment(scrollPosition, objectAdder)
            }
        }
    }
}