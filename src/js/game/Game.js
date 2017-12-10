import {Util} from "./utils/Util";
import {Frog} from "./go/Frog";
import {PMASK, GEngineE} from "./physics/GEngine";
import {Lava} from "./go/Lava";
import {LevelGenerator} from "./controller/LevelGenerator";
import {ObjectType} from "./go/GameObjectBase";
import {FrogController} from "./controller/FrogController";
import {Camera} from "./controller/Camera";
import {RespawnController} from "./controller/RespawnController";

export const Game = (renderer, physics, input) => {

    physics.on(GEngineE.TRIGGER_ENTER, respawnBodyId => {
        respawns.updateCurrent(respawnBodyId)
    })
    physics.on(GEngineE.TRIGGER_EXIT, respawnBodyId => {
    })

    let scoreTxt = new PIXI.Text('', {fontFamily : 'NotoMono', fontSize: 50, fill : 0x000000, align : 'center'})
    scoreTxt.anchor.x = 0
    scoreTxt.anchor.y = 1
    scoreTxt.x = 20
    scoreTxt.y = renderer.size.y - 20
    renderer.stage.addChild(scoreTxt)

    const objects = []

    let frog = null
    let frogController = null
    let camera = null
    const respawns = RespawnController()
    let lava = Lava(renderer, physics)
    let score = {anchor : 0, actual: 0}

    const generator = LevelGenerator(renderer.scroll.y, renderer.size)
    const self = {
        get generator() { return generator },
        addObject: (go, shallow = false) => {
            renderer.addObject(go)
            go.hasBody && physics.addBody(go.body)
            if (go.type === ObjectType.RESPAWN) { respawns.add(go) }
            else { !shallow && objects.push(go) }
        },
        removeObject: (go, index = -1) => {
            if (!go) return

            renderer.removeObject(go)
            go.hasBody && physics.removeBody(go.body.id)

            if (go.type === ObjectType.RESPAWN) { respawns.remove(go) }
            else {
                if (index > -1) {
                    objects.splice(index, 1)
                } else {
                    const idx = objects.indexOf(go)
                    if (idx > -1) {
                        objects.splice(idx, 1)
                    }
                }
            }
        },

        get score() { return Math.floor(score.actual) * 10 },
        update: (dt) => {
            //
            // update score
            score.actual = Math.max(score.anchor - frog.visual.y, score.actual)
            scoreTxt.text = self.score

            //
            // update lava rise
            lava.update(dt, score.actual, renderer.scroll, renderer.size)

            //
            // update frog
            frog.update()

            //
            // move frog to the other side of the screen where there are no walls
            if (frog.body.center.x <= 0) {
                frog.body.center.x = renderer.size.x-1
            } else if (frog.body.center.x >= renderer.size.x) {
                frog.body.center.x = 1
            }

            const cameraMoved = camera.update(dt * 1000)
            if (cameraMoved) {
                generator.update(renderer.scroll.y, self.addObject)

                //
                // sweep objects that went below screen
                const yBound = renderer.scroll.y-renderer.size.y*1.5
                for (let i = objects.length-1; i >= 0; i--) {
                    const go = objects[i]
                    const goYLocation = Math.abs(go.body.bottom)
                    if (goYLocation < yBound) { // bodies y-coordinate is negative up, so..
                        self.removeObject(go, i)
                    }
                }
            }
        },
        respawn: () => {
            let respawnPoint = respawns.current
            if (!respawnPoint) {
                respawnPoint = {x: Util.getRandomInt(100, renderer.size.x-100), y: -(renderer.scroll.y-renderer.size.y) - renderer.size.y*0.9}
            }

            if (frog === null) {
                frog = Frog(respawnPoint.x, respawnPoint.y - 35)
                frogController = FrogController(frog, physics, input)
                camera = Camera(frog, renderer)
                camera.snapTo(-respawnPoint.y + 1200)
                self.addObject(frog, true)
            } else {
                self.removeObject(frog)
                frogController.disableInput()
                camera.scrollTo(-respawnPoint.y + 1150, () => {
                    frog.reset(respawnPoint.x, respawnPoint.y - 35)
                    self.addObject(frog, true)
                    frogController.enableInput()
                })
            }

            score = {actual: 0, anchor: respawnPoint.y}
            lava.reset()
        }
    }

    return self
}