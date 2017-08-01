import {Util} from "./utils/Util";
import {Frog} from "./go/Frog";
import {PMASK, GEngineE} from "./physics/GEngine";
import {StaticObject} from "./go/StaticObject";
import {INTERSECTION} from "./physics/GUtils";
import {Lava} from "./go/Lava";

export const Controller = (renderer, physics, input) => {
    const environment = []
    let frog = null
    let lava = null
    let lastFacing = 1

    let canJump = false
    let canWallJump = false
    let canDoubleJump = false

    let scoreTxt = new PIXI.Text('', {fontFamily : 'NotoMono', fontSize: 50, fill : 0x000000, align : 'center'})
    scoreTxt.anchor.x = 0
    scoreTxt.anchor.y = 1
    scoreTxt.x = 20
    scoreTxt.y = renderer.size.y - 20
    renderer.stage.addChild(scoreTxt)

    physics.on(GEngineE.GROUNDED, () => {
        frog.updateAnimation('idle', lastFacing)
        canJump = true
        canDoubleJump = true
        canWallJump = false
    })

    physics.on(GEngineE.AIRBORNE, () => {
        if (frog.lastAnimation === 'midair') return

        lastFacing = frog.body.velocity.x >= 0 ? 1 : -1
        frog.updateAnimation('jump', lastFacing)

        canWallJump = canJump = false
    })

    physics.on(GEngineE.WALLED, () => {
        // console.log('walled')
        frog.updateAnimation('walljump', lastFacing)
        canJump = false
        canWallJump = true
    })

    physics.on(GEngineE.HEADHIT, () => {
        frog.updateAnimation('midair', lastFacing)
        canJump = false
        canDoubleJump = false
        canWallJump = false
    })

    const jump = (vector, maxXImpulse, maxYImpulse, maxMagnitude) => {
        vector.x = maxXImpulse * vector.x/maxMagnitude
        vector.y = maxYImpulse * vector.y/maxMagnitude
        physics.applyForce(frog.body.id, vector)
        lastFacing = frog.body.velocity.x >= 0 ? 1 : -1
        frog.updateAnimation('jump', lastFacing)
    }

    input.on('touchStarted', () => {
        if (canJump === false && canWallJump === false && canDoubleJump === true) {
            frog.updateAnimation('midair', lastFacing)
        }
    })

    input.on('touchEnded', (vector) => {
        const maxMagnitude = 150
        const maxYImpulse = 7.5
        let maxXImpulse = 500
        if (vector.y > 0) {
            vector.y = 0

            //
            // pointing down jump while standing still is not allowed
            let anyFloorCollisions = false
            if (frog.body.collisions.size > 0) {
                frog.body.collisions.forEach(c => {
                    if (c.intersection === INTERSECTION.DOWN) {
                        anyFloorCollisions = true
                    }
                })
            }
            if (anyFloorCollisions) return
            maxXImpulse = 700
        }

        const magnitude = Util.clampMagnitude(vector, 70, maxMagnitude)
        if (Number.isNaN(vector.x) || Number.isNaN(vector.y)) {
            // console.log('CLICK')
        } else {
            if (canJump) {
                jump(vector, maxXImpulse, maxYImpulse, maxMagnitude)
                return
            }
            if (canWallJump) {
                if (vector.x === 0) return
                if (lastFacing > 0 && vector.x > 0) return
                if (lastFacing < 0 && vector.x < 0) return
                jump(vector, maxXImpulse*1.5, maxYImpulse*0.95, maxMagnitude)
                return
            }
            if (canDoubleJump) {
                jump(vector, maxXImpulse*1.1, maxYImpulse*0.9, maxMagnitude)
                canDoubleJump = false
            }
        }
    })

    let checkpoint = renderer.scroll.y
    let nextCheckpointHeight = 200
    let lastWallCheckPoint = 0
    let score = {anchor : 0, actual: 0}
    const self = {
        addObject: (go, isEnvironment = true) => {
            renderer.addObject(go)
            physics.addBody(go.body)
            isEnvironment && environment.push(go)
            if (frog && isEnvironment) {
                renderer.addObject(frog)
            }
        },
        removeObject: (go, index = -1) => {
            if (!go) return
            // console.log('removing ', go.name, index)
            renderer.removeObject(go)
            physics.removeBody(go.body.id)
            go.destroy()

            index > -1 && environment.splice(index, 1)
        },

        get score() { return Math.floor(score.actual) * 10 },
        update: (dt) => {

            //
            // update score
            score.actual = Math.max(score.anchor - frog.visual.y, score.actual)
            scoreTxt.text = self.score

            //
            // update lava rise
            lava.updateRise(dt, score.actual)

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

            frog.update()

            //
            // update camera position
            const diff = renderer.scroll.y - Math.abs(frog.visual.y)
            if (diff < 500) { // camera position will be changed
                lava.updatePosition(renderer.scroll, renderer.size)

                renderer.scroll.y = Util.lerp(renderer.scroll.y, renderer.scroll.y + 500 - diff, 0.11)

                //
                // spawn screen platforms somehow
                if (renderer.scroll.y - checkpoint > nextCheckpointHeight) {
                    checkpoint = renderer.scroll.y

                    let go
                    if (Math.random() < 0.9 || nextCheckpointHeight === 200) {
                        go = StaticObject(
                            'regular_' + environment.length,
                            'pixel',
                            Util.getRandomInt(100, renderer.size.x-100), -renderer.scroll.y, Util.getRandomInt(120, 180), 40,
                            Util.hexColorToRgbInt('#55557f'), PMASK.REGULAR
                        )
                        nextCheckpointHeight = 100
                    } else {
                        go = StaticObject(
                            'regular_' + environment.length,
                            'pixel',
                            Util.getRandomInt(150, renderer.size.x-150), -renderer.scroll.y-150, Util.getRandomInt(30, 50), Util.getRandomInt(300, 350),
                            Util.hexColorToRgbInt('#55557f'), PMASK.REGULAR
                        )
                        nextCheckpointHeight = 200
                    }
                    self.addObject(go)
                }

                //
                // spawn walls
                if (Math.floor(renderer.scroll.y / renderer.size.y) > lastWallCheckPoint) {
                    let go1, go2
                    if (Math.random() < 0.1) { // dont create walls

                    } else if (Math.random() < 0.4) { // create walls
                        go1 = StaticObject(
                            'wall_' + environment.length, 'pixel',
                            0, -1 * (renderer.size.y*2 + lastWallCheckPoint*renderer.size.y), 20, renderer.size.y,
                            Util.hexColorToRgbInt('#55557f'), PMASK.REGULAR)

                        go2 = StaticObject(
                            'wall_' + environment.length, 'pixel',
                            780, -1 * (renderer.size.y*2 + lastWallCheckPoint*renderer.size.y), 20, renderer.size.y,
                            Util.hexColorToRgbInt('#55557f'), PMASK.REGULAR)
                    } else {
                        const mask1 = Math.random() > 0.5 ? PMASK.DEATH : PMASK.REGULAR
                        go1 = StaticObject(
                            'wall_' + environment.length, 'pixel',
                            0, -1 * (renderer.size.y*2 + lastWallCheckPoint*renderer.size.y), 20, renderer.size.y,
                            Util.hexColorToRgbInt(mask1 === PMASK.DEATH ? "#000000" : '#55557f'), mask1)

                        const mask2 = mask1 === PMASK.REGULAR ? PMASK.DEATH : Math.random() > 0.5 ? PMASK.DEATH : PMASK.REGULAR
                        go2 = StaticObject(
                            'wall_' + environment.length, 'pixel',
                            780, -1 * (renderer.size.y*2 + lastWallCheckPoint*renderer.size.y), 20, renderer.size.y,
                            Util.hexColorToRgbInt(mask2 === PMASK.DEATH ? "#000000": '#55557f'), mask2)
                    }
                    if (go1 || go2) {
                        self.addObject(go1)
                        self.addObject(go2)
                    }
                    lastWallCheckPoint+=1
                }

                //
                // sweep objects that went below screen
                const yBound = renderer.scroll.y-renderer.size.y
                for (let i = environment.length-1; i >= 0; i--) {
                    const go = environment[i]
                    if (Math.abs(go.body.bottom) < yBound) { // bodies y-coordinate is negative up, so..
                        self.removeObject(go, i)
                    }
                }
            }
        },
        respawn: (respawnLocations = undefined) => {
            self.removeObject(frog)
            self.removeObject(lava)

            lava = Lava('pixel', 0xCC0000)
            self.addObject(lava, false)

            let respawnPoint
            if (respawnLocations) {
                respawnPoint = respawnLocations[Util.getRandomInt(0, respawnLocations.length-1)]
                respawnPoint.y -= renderer.size.y
            } else {
                respawnPoint = {x: Util.getRandomInt(100, renderer.size.x-100), y: -(renderer.scroll.y-renderer.size.y) - renderer.size.y*0.9}
            }

            frog = Frog({idle: 'frog.idle',jump: 'frog.jump', walljump: 'frog.walljump', midair: 'frog.midair'},
                respawnPoint.x, respawnPoint.y,
                192, 192, PMASK.FROG, {x: 50, y: 56, w: 90, h: 136})
            score = {actual: 0, anchor: respawnPoint.y}
            self.addObject(frog, false)
        }
    }
    return self
}