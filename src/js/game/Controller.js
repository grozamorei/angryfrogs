import {Util} from "./utils/Util";
import {Frog} from "./go/Frog";
import {PMASK, GEngineE} from "./physics/GEngine";
import {StaticObject} from "./go/StaticObject";

export const Controller = (renderer, physics, input, gos) => {
    let frog = null
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
        const maxXImpulse = 500
        const magnitude = Util.clampMagnitude(vector, 70, maxMagnitude)
        // console.log(Math.floor(Math.atan2(vector.y, vector.x) * 180/Math.PI), magnitude)
        if (Number.isNaN(vector.x) || Number.isNaN(vector.y)) {
            // console.log('CLICK')
        } else {
            if (vector.y > 0) vector.y = 0
            if (canJump) {
                jump(vector, maxXImpulse, maxYImpulse, maxMagnitude)
                return
            }
            // console.log(canWallJump, lastFacing, vector)
            if (canWallJump) {
                if (vector.x === 0) return
                if (lastFacing > 0 && vector.x > 0) return
                if (lastFacing < 0 && vector.x < 0) return
                jump(vector, maxXImpulse*1.4, maxYImpulse*0.7, maxMagnitude)
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
        get score() { return Math.floor(score.actual) * 10 },
        update: () => {
            score.actual = Math.max(score.anchor - frog.visual.y, score.actual)
            scoreTxt.text = self.score
            if (frog.body.center.x <= 0) {
                frog.body.center.x = renderer.size.x-1
            } else if (frog.body.center.x >= renderer.size.x) {
                frog.body.center.x = 1
            }

            // console.log(frog.body.center.y, renderer.scroll.y-renderer.size.y)
            if (Math.abs(frog.body.center.y) < renderer.scroll.y-renderer.size.y || frog.body.center.y > 0) {
                physics.emit('death')
                self.respawn()
                return
            }

            frog.update()

            const diff = renderer.scroll.y - Math.abs(frog.visual.y)
            if (diff < 500) {
                renderer.scroll.y = Util.lerp(renderer.scroll.y, renderer.scroll.y + 500 - diff, 0.11)
                // console.log(checkpoint, renderer.scroll.y)
                if (renderer.scroll.y - checkpoint > nextCheckpointHeight) {
                    checkpoint = renderer.scroll.y

                    let go
                    if (Math.random() < 0.9 || nextCheckpointHeight === 200) {
                        go = StaticObject(
                            'regular_' + gos.length,
                            'pixel',
                            Util.getRandomInt(100, renderer.size.x-100), -renderer.scroll.y, Util.getRandomInt(120, 180), 40,
                            Util.hexColorToRgbInt('#55557f'), PMASK.REGULAR
                        )
                        nextCheckpointHeight = 100
                    } else {
                        go = StaticObject(
                            'regular_' + gos.length,
                            'pixel',
                            Util.getRandomInt(150, renderer.size.x-150), -renderer.scroll.y-150, Util.getRandomInt(30, 50), Util.getRandomInt(300, 350),
                            Util.hexColorToRgbInt('#55557f'), PMASK.REGULAR
                        )
                        nextCheckpointHeight = 200
                    }

                    renderer.addObject(go)
                    physics.addBody(go.body)
                    gos.push(go)
                    renderer.addObject(frog)
                }
                if (Math.floor(renderer.scroll.y / renderer.size.y) > lastWallCheckPoint) {
                    let go1, go2
                    if (Math.random() < 0.1) { // dont create walls

                    } else if (Math.random() < 0.4) { // create walls
                        go1 = StaticObject(
                            'wall_' + gos.length, 'pixel',
                            0, -1 * (renderer.size.y*2 + lastWallCheckPoint*renderer.size.y), 20, renderer.size.y,
                            Util.hexColorToRgbInt('#55557f'), PMASK.REGULAR)

                        go2 = StaticObject(
                            'wall_' + gos.length, 'pixel',
                            780, -1 * (renderer.size.y*2 + lastWallCheckPoint*renderer.size.y), 20, renderer.size.y,
                            Util.hexColorToRgbInt('#55557f'), PMASK.REGULAR)
                    } else {
                        const mask1 = Math.random() > 0.5 ? PMASK.DEATH : PMASK.REGULAR
                        go1 = StaticObject(
                            'wall_' + gos.length, 'pixel',
                            0, -1 * (renderer.size.y*2 + lastWallCheckPoint*renderer.size.y), 20, renderer.size.y,
                            Util.hexColorToRgbInt(mask1 === PMASK.DEATH ? "#000000" : '#55557f'), mask1)

                        const mask2 = mask1 === PMASK.REGULAR ? PMASK.DEATH : Math.random() > 0.5 ? PMASK.DEATH : PMASK.REGULAR
                        go2 = StaticObject(
                            'wall_' + gos.length, 'pixel',
                            780, -1 * (renderer.size.y*2 + lastWallCheckPoint*renderer.size.y), 20, renderer.size.y,
                            Util.hexColorToRgbInt(mask2 === PMASK.DEATH ? "#000000": '#55557f'), mask2)
                    }
                    if (go1 || go2) {
                        renderer.addObject(go1); renderer.addObject(go2)
                        physics.addBody(go1.body); physics.addBody(go2.body);
                        gos.push(go1); gos.push(go2)
                        renderer.addObject(frog)
                    }
                    lastWallCheckPoint+=1
                }
                for (let i = gos.length-1; i >= 0; i--) {
                    const go = gos[i]
                    if (go.isOutOfBounds(renderer.scroll.y-renderer.size.y)) {
                        gos.splice(i, 1)
                        renderer.removeObject(go)
                        physics.removeBody(go.body.id)
                        go.destroy()
                    }
                }
            }
        },
        respawn: (respawnLocations = undefined) => {
            if (frog) {
                renderer.removeObject(frog)
                physics.removeBody(frog.body.id)
                frog.destroy()
            }

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
            renderer.addObject(frog)
            physics.addBody(frog.body)
        }
    }
    return self
}