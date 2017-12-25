import {StaticPlatform} from "../go/StaticPlatform";
import {Util} from "../utils/Util";
import {PMASK} from "../physics/GEngine";
import {Respawn} from "../go/Respawn";
export const LevelGenerator = (checkpoint, sceneSize) => {

    // let lastWallCheckPoint = 0
    let nextGenerationIn = 200
    let sizes = [64, 96, 128, 160, 192]

    const generateRandomEnvironment = (scrollPosition, objectAdder) => {
        if (Math.random() < 0.9 || nextGenerationIn === 200) {
            objectAdder(StaticPlatform(
                'horizontal_' + Util.getRandomInt(0, 100),
                'level.pl_sticky_thin',
                Util.getRandomInt(100, sceneSize.x-100), -scrollPosition, sizes[Util.getRandomInt(0, sizes.length)], 32,
                Util.hexColorToRgbInt('#55557f'), PMASK.PLATFORM_STICKY_THIN
            ))
            nextGenerationIn = 100
        } else {
            objectAdder(StaticPlatform(
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
        //         go1 = StaticPlatform(
        //             'wall_' + Util.getRandomInt(0, 100), 'pixel',
        //             0, -1 * (sceneSize.y*2 + lastWallCheckPoint*sceneSize.y), 20, sceneSize.y,
        //             Util.hexColorToRgbInt('#55557f'), PMASK.REGULAR)
        //
        //         go2 = StaticPlatform(
        //             'wall_' + Util.getRandomInt(0, 100), 'pixel',
        //             780, -1 * (sceneSize.y*2 + lastWallCheckPoint*sceneSize.y), 20, sceneSize.y,
        //             Util.hexColorToRgbInt('#55557f'), PMASK.REGULAR)
        //     } else {
        //         const mask1 = Math.random() > 0.5 ? PMASK.DEATH : PMASK.REGULAR
        //         go1 = StaticPlatform(
        //             'wall_' + Util.getRandomInt(0, 100), 'pixel',
        //             0, -1 * (sceneSize.y*2 + lastWallCheckPoint*sceneSize.y), 20, sceneSize.y,
        //             Util.hexColorToRgbInt(mask1 === PMASK.DEATH ? "#000000" : '#55557f'), mask1)
        //
        //         const mask2 = mask1 === PMASK.REGULAR ? PMASK.DEATH : Math.random() > 0.5 ? PMASK.DEATH : PMASK.REGULAR
        //         go2 = StaticPlatform(
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

    const randomizeTemplateByKey = (key) => {
        const possibleTemplates = resources.getJSON('digest.patterns').filter(item => item.alias.indexOf(key) > -1)
        const template = possibleTemplates[Util.getRandomInt(0, possibleTemplates.length-1)].alias
        const map = resources.getJSON(template)
        if (map.properties) {
            if (map.properties.PASSTHROUGH === false) {
                return randomizeTemplateByKey(key)
            }
        }
        console.log('generating template ' + template)
        return map
    }

    const generateTemplateEnvironment = (map, scrollPosition, objectAdder) => {

        map.layers.forEach(l => {
            if (l.name === 'RESPAWN') {
                l.objects.forEach(resp => {
                    objectAdder(Respawn(resp.x + resp.width/2, -scrollPosition - sceneSize.y + resp.y + resp.height/2))
                })
            } else {
                l.objects.forEach(o => {
                    objectAdder(StaticPlatform(
                        'regular_' + Util.getRandomInt(0, 1000), 'level.' + PMASK[l.name], o.x, -scrollPosition - (sceneSize.y - o.y),
                        o.width, o.height, Util.hexColorToRgbInt(l.color), PMASK[l.name]
                    ))
                })
            }
        })

        nextGenerationIn = 1400
    }

    let currentPreset = undefined
    let presetStep = 0
    JSON.parse(window.localStorage.debug).levelConstructor.presets.forEach(pres => {
        if (!pres.active) return
        currentPreset = pres.pieces
    })

    return {
        get forceGenerate() { return generateTemplateEnvironment },
        update(scrollPosition, objectAdder) {
            if (scrollPosition - checkpoint < nextGenerationIn) return
            checkpoint = scrollPosition

            // if (Math.random() < 0.1) {
            if (currentPreset) {
                console.log('generating preset template ' + currentPreset[presetStep])
                generateTemplateEnvironment(resources.getJSON(currentPreset[presetStep]), scrollPosition, objectAdder)
                presetStep += 1
                if (presetStep > currentPreset.length-1) {
                    presetStep = 0
                }
            } else {
                generateTemplateEnvironment(randomizeTemplateByKey('first'), scrollPosition, objectAdder)
            }
            // } else{
            //     generateRandomEnvironment(scrollPosition, objectAdder)
            // }
        }
    }
}