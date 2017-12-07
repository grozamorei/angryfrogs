import {Util} from "../utils/Util";
import {Frog} from "../go/Frog";
import {PMASK, GEngineE} from "../physics/GEngine";
import {INTERSECTION} from "../physics/GUtils";
import {Lava} from "../go/Lava";
import {LevelGenerator} from "./LevelGenerator";
import {ObjectType} from "../go/GameObjectBase";

export const Controller = (renderer, physics, input) => {
    const debug = window.debugMenu.params

    let scoreTxt = new PIXI.Text('', {fontFamily : 'NotoMono', fontSize: 50, fill : 0x000000, align : 'center'})
    scoreTxt.anchor.x = 0
    scoreTxt.anchor.y = 1
    scoreTxt.x = 20
    scoreTxt.y = renderer.size.y - 20
    renderer.stage.addChild(scoreTxt)

    const objects = []

    let frog = null
    let lava = null

    let lastFacing = 1
    let canJump = false
    let canWallJump = false
    let canDoubleJump = false

    const grounded = () => canJump
    const airbourne = () => !canJump && !canWallJump && canDoubleJump
    const walled = () => canWallJump
    const ground = () => {
        frog.updateAnimation('idle', lastFacing)
        canJump = true
        canDoubleJump = true
        canWallJump = false
    }
    const isWallJumpDirectionRight = (dir) => {
        let isDirectionRight = false
        frog.getCollisions(INTERSECTION.LEFT | INTERSECTION.RIGHT, c => {
            if (c.intersection&INTERSECTION.LEFT) isDirectionRight = dir > 0
            if (c.intersection&INTERSECTION.RIGHT) isDirectionRight = dir < 0
        })
        return isDirectionRight
    }

    physics.on(GEngineE.GROUNDED, ground)

    physics.on(GEngineE.AIRBORNE, () => {
        if (frog.lastAnimation === 'midair.head.hit') return

        lastFacing = frog.body.velocity.x >= 0 ? 1 : -1
        if (frog.lastAnimation.indexOf('jump') === -1) {
            console.log('what is this?')
            frog.updateAnimation('jump_01', lastFacing, true)
        }

        canWallJump = canJump = false
    })

    physics.on(GEngineE.WALLED, (intersection) => {
        lastFacing = intersection === INTERSECTION.RIGHT ? 1 : -1
        frog.updateAnimation('walled', lastFacing)
        canJump = false
        canWallJump = true
    })

    physics.on(GEngineE.HEADHIT, (intersection) => {
        if (frog.lastAnimation === 'walled') return
        if (canJump) return
        if (intersection === INTERSECTION.RIGHT) lastFacing = 1
        if (intersection === INTERSECTION.LEFT) lastFacing = -1

        frog.updateAnimation('midair.head.hit', lastFacing)
        if (debug.neoMode) return
        canJump = false
        canDoubleJump = false
        canWallJump = false
    })

    const applyForce = (vector, maxXImpulse, maxYImpulse, maxMagnitude, slipping = false) => {
        vector.x = maxXImpulse * vector.x/maxMagnitude
        vector.y = maxYImpulse * vector.y/maxMagnitude

        if (slipping) {
            // frog.updateAnimation('slide_00', lastFacing, true)
        } else {
            if (walled()) {
                frog.updateAnimation('jump_01', lastFacing, true)
            } else {
                frog.updateAnimation('jump_00', lastFacing, true)
            }
        }
        physics.applyForce(frog.body.id, vector)
        lastFacing = frog.body.velocity.x >= 0 ? 1 : -1
    }

    input.on('touchStarted', () => {
        if (airbourne()) {
            frog.updateAnimation('midair.prepare.jump', lastFacing)
        } else if (grounded()) {
            frog.updateAnimation('prepare.jump.00', lastFacing)
        }
    })

    input.on('touchMove', (magnitude, direction) => {
        if (!Util.approximately(direction, 0)) {
            lastFacing = direction
        }

        if (grounded()) {
            if (magnitude > 30) {
                frog.updateAnimation('prepare.jump.01', lastFacing)
            } else {
                frog.updateAnimation('prepare.jump.00', lastFacing)
            }
        } else if (walled()) {
            if (isWallJumpDirectionRight(direction)) {
                if (magnitude > 15) {
                    frog.updateAnimation('walled.prepare.jump', lastFacing*-1)
                } else {
                    frog.updateAnimation('walled', lastFacing*-1)
                }
            } else {
                frog.updateAnimation('walled', lastFacing)
            }
        } else if (airbourne()) {
            frog.updateAnimation(frog.lastAnimation, lastFacing)
        }
    })

    input.on('touchEnded', (vector) => {
        const maxMagnitude = 120
        const maxYImpulse = 7.5
        let maxXImpulse = 500
        let slipFloorJump = false
        if (vector.y >= 0) {
            vector.y = 0

            //
            // pointing down jump while standing still is not allowed
            let hardFloorCollisions = false
            frog.getCollisions(INTERSECTION.DOWN, c => {
                if (c.mask.indexOf('slippery') === -1) {
                    hardFloorCollisions = true
                } else {
                    slipFloorJump = true
                }
            })
            if (hardFloorCollisions) {
                ground()
                return
            }
            maxXImpulse = 800
        }

        /*const magnitude = */Util.clampMagnitude(vector, 70, maxMagnitude)
        if (isNaN(vector.x) || isNaN(vector.y)) {
            ground()
        } else {
            if (grounded()) {
                applyForce(vector, maxXImpulse, maxYImpulse, maxMagnitude, slipFloorJump)
                return
            }
            if (walled()) {
                if (vector.x === 0) return
                isWallJumpDirectionRight(vector.x)&&applyForce(vector, maxXImpulse*1.5, maxYImpulse*0.95, maxMagnitude)
                return
            }
            if (airbourne()) {
                applyForce(vector, maxXImpulse*1.1, maxYImpulse*0.9, maxMagnitude)
                canDoubleJump = debug.neoMode
            }
        }
    })

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
            self.removeObject(lava)
            lava = Lava()
            self.addObject(lava)

            let respawnPoint = undefined

            for (let i = 0; i < objects.length; i++) {
                const o = objects[i]
                if (o.type !== ObjectType.RESPAWN) continue
                console.log('found respawn point at ', o)
                respawnPoint = {x: o.x, y: o.y}
                break
            }
            if (respawnPoint === undefined) {
                respawnPoint = {x: Util.getRandomInt(100, renderer.size.x-100), y: -(renderer.scroll.y-renderer.size.y) - renderer.size.y*0.9}
            }

            self.removeObject(frog)
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
            score = {actual: 0, anchor: respawnPoint.y}
            self.addObject(frog)
        }
    }

    return self
}