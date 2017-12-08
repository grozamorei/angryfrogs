import {Util} from "./utils/Util";
import {Frog} from "./go/Frog";
import {PMASK, GEngineE} from "./physics/GEngine";
import {Lava} from "./go/Lava";
import {LevelGenerator} from "./controller/LevelGenerator";
import {ObjectType} from "./go/GameObjectBase";
import {FrogController} from "./controller/FrogController";

export const Game = (renderer, physics, input) => {

    let scoreTxt = new PIXI.Text('', {fontFamily : 'NotoMono', fontSize: 50, fill : 0x000000, align : 'center'})
    scoreTxt.anchor.x = 0
    scoreTxt.anchor.y = 1
    scoreTxt.x = 20
    scoreTxt.y = renderer.size.y - 20
    renderer.stage.addChild(scoreTxt)

    const objects = []

    let frog = null
    let lava = Lava(renderer, physics)
    let score = {anchor : 0, actual: 0}

    const generator = LevelGenerator(renderer.scroll.y, renderer.size)
    const self = {
        get generator() { return generator },
        addObject: (go) => {
            renderer.addObject(go)
            go.hasBody && physics.addBody(go.body)
            objects.push(go)
        },
        removeObject: (go, index = -1) => {
            if (!go) return

            renderer.removeObject(go)
            go.hasBody && physics.removeBody(go.body.id)

            if (index > -1) {
                objects.splice(index, 1)
            } else {
                const idx = objects.indexOf(go)
                if (idx > -1) {
                    objects.splice(idx, 1)
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

            //
            // die if frog went below screen
            if (Math.abs(frog.body.center.y) < renderer.scroll.y-renderer.size.y || frog.body.center.y > 0) {
                physics.emit(GEngineE.DEATH)
                return
            }

            //
            // update camera position
            const diff = renderer.scroll.y - Math.abs(frog.visual.y)
            if (diff < 500) { // camera position will be changed
                renderer.scroll.y = Math.floor(Util.lerp(renderer.scroll.y, renderer.scroll.y + 500 - diff, 0.11))

                generator.update(renderer.scroll.y, self.addObject)

                //
                // sweep objects that went below screen
                const yBound = renderer.scroll.y-renderer.size.y
                for (let i = objects.length-1; i >= 0; i--) {
                    const go = objects[i]
                    const goYLocation = Math.abs(go.hasBody ? go.body.bottom : go.y)
                    if (goYLocation < yBound) { // bodies y-coordinate is negative up, so..
                        self.removeObject(go, i)
                    }
                }
            }
        },
        respawn: () => {
            let respawnPoint = undefined

            for (let i = 0; i < objects.length; i++) {
                const o = objects[i]
                if (o.type !== ObjectType.RESPAWN) continue
                respawnPoint = {x: o.x, y: o.y}
                break
            }
            if (respawnPoint === undefined) {
                respawnPoint = {x: Util.getRandomInt(100, renderer.size.x-100), y: -(renderer.scroll.y-renderer.size.y) - renderer.size.y*0.9}
            }

            if (frog === null) {
                frog = Frog(
                    {
                        idle: 'frog.idle',
                        'jump_00': 'frog.jump_00', 'jump_01': 'frog.jump_01', 'jump_02': 'frog.jump_02',
                        'prepare.jump.00': 'frog.prepare.jump.00', 'prepare.jump.01': 'frog.prepare.jump.01',
                        walled: 'frog.walled', 'walled.prepare.jump': 'frog.walled.prepare.jump',
                        'midair.head.hit': 'frog.midair.head.hit', 'midair.prepare.jump': 'frog.midair.prepare.jump'
                    },
                    respawnPoint.x, respawnPoint.y - 35,
                    256, 256, PMASK.FROG, {x: 87, y: 121, w: 80, h: 148})
                FrogController(frog, physics, input)
                self.addObject(frog)
            } else {
                frog.reset(respawnPoint.x, respawnPoint.y - 35)
            }

            score = {actual: 0, anchor: respawnPoint.y}
            lava.reset()
        }
    }

    return self
}