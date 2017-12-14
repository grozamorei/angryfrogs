import {emitterTemplate} from "./utils/EmitterBehaviour";
import {Util as Utils} from "./utils/Util";
export const Input = (canvas, debugGraphics) => {
    const self =  {
        update: () => {/*stub*/}
    }
    Object.assign(self, emitterTemplate({}))

    const getX = (e) => {
        if ('touches' in e) return e.touches.item(0).clientX
        return e.clientX
    }
    const getY = (e) => {
        if ('touches' in e) return e.touches.item(0).clientY
        return e.clientY
    }

    let fs = false
    let fsDoubleClick = 0
    let debugDoubleClick = 0
    const startedAt = {x: NaN, y: NaN}
    const lastSeenAt = {x: NaN, y: NaN}
    const onTouchStart = (e) => {
        e.preventDefault()

        startedAt.x = getX(e)
        startedAt.y = getY(e)
        self.emit('touchStarted')
    }

    const onTouchMove = (e) => {
        e.preventDefault()
        if (isNaN(startedAt.x)) return
        lastSeenAt.x = getX(e)
        lastSeenAt.y = getY(e)

        const vX = lastSeenAt.x - startedAt.x
        const vY = lastSeenAt.y - startedAt.y
        const magnitude = Math.sqrt(vX*vX + vY*vY)
        if (magnitude === 0) return
        self.emit('touchMove', magnitude, Utils.normalizeValue(vX))

        debugGraphics.clear()
        debugGraphics.lineStyle(2, 0xFF00FF)
        debugGraphics.drawCircle(700, 100, 60)
        debugGraphics.moveTo(700, 100)
        debugGraphics.lineTo(700 + 0.5 * vX, 100 + 0.5 * vY)
    }

    const onTouchEnd = (e) => {
        if (Date.now() - fsDoubleClick < 200) {
            if (fs) {
                document.exitFullscreen()
                fs = false
            } else {
                window.document.documentElement.requestFullscreen()
                fs = true
            }
        }
        fsDoubleClick = Date.now()
        e.preventDefault()

        self.emit('touchEnded', {x: (lastSeenAt.x - startedAt.x), y: (lastSeenAt.y - startedAt.y)})
        startedAt.x = startedAt.y = lastSeenAt.x = lastSeenAt.y = NaN
    }

    canvas.ontouchstart = onTouchStart
    canvas.ontouchmove = onTouchMove
    canvas.ontouchend = onTouchEnd

    canvas.onmousedown = onTouchStart
    canvas.onmousemove = onTouchMove
    canvas.onmouseup = onTouchEnd

    window.onkeypress = (e) => {
        // e.preventDefault()
        if (e.keyCode === 119) {
            self.emit('touchEnded', {x: 0, y: -1000})
        }
        if (e.keyCode === 97) {
            self.emit('touchEnded', {x: -1000, y: -1000})
        }
        if (e.keyCode === 100) {
            self.emit('touchEnded', {x: 1000, y: -1000})
            // if (Date.now() - debugDoubleClick < 200) {
                
            // }
            // debugDoubleClick = Date.now()
        }
        if (e.keyCode === 96) {
            window.debugMenu.toggle()
        }
    }

    return self
}