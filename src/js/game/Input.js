import {emitterTemplate} from "./utils/EmitterBehaviour";
export const Input = (canvas, debug) => {
    const emitter = {}
    const self =  {
        update: () => {}
    }
    Object.assign(self, emitterTemplate(emitter))

    const getX = (e) => {
        if ('touches' in e) return e.touches.item(0).clientX
        return e.clientX
    }
    const getY = (e) => {
        if ('touches' in e) return e.touches.item(0).clientY
        return e.clientY
    }

    const startedAt = {x: Number.NaN, y: Number.NaN}
    const lastSeenAt = {x: Number.NaN, y: Number.NaN}
    const onTouchStart = (e) => {
        e.preventDefault()

        startedAt.x = getX(e)
        startedAt.y = getY(e)
        self.emit('touchStarted')
    }

    const onTouchMove = (e) => {
        e.preventDefault()
        if (Number.isNaN(startedAt.x)) return
        lastSeenAt.x = getX(e)
        lastSeenAt.y = getY(e)

        debug.clear()
        debug.lineStyle(2, 0xFF00FF)
        debug.drawCircle(700, 100, 60)
        debug.moveTo(700, 100)
        debug.lineTo(700 + 0.5 * (lastSeenAt.x - startedAt.x), 100 + 0.5 * (lastSeenAt.y - startedAt.y))
    }

    const onTouchEnd = (e) => {
        e.preventDefault()

        self.emit('touchEnded', {x: (lastSeenAt.x - startedAt.x), y: (lastSeenAt.y - startedAt.y)})
        startedAt.x = startedAt.y = lastSeenAt.x = lastSeenAt.y = Number.NaN
    }

    canvas.ontouchstart = onTouchStart
    canvas.ontouchmove = onTouchMove
    canvas.ontouchend = onTouchEnd

    canvas.onmousedown = onTouchStart
    canvas.onmousemove = onTouchMove
    canvas.onmouseup = onTouchEnd

    window.onkeypress = (e) => {
        e.preventDefault()
        // console.log(e.keyCode)
        if (e.keyCode === 119) {
            self.emit('touchEnded', {x: 0, y: -1000})
        }
        if (e.keyCode === 97) {
            self.emit('touchEnded', {x: -1000, y: -1000})
        }
        if (e.keyCode === 100) {
            self.emit('touchEnded', {x: 1000, y: -1000})
        }
    }

    return self
}