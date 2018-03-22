import {emitterTemplate} from "./utils/EmitterBehaviour";
import {Util as Utils} from "./utils/Util";
export const Input = (canvas, rend) => {
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

    const getGestureVelocity = (e) => {
        lastSeenAt.x = getX(e)
        lastSeenAt.y = getY(e)

        const normTemplate = rend.stage.width * 0.25
        const vX = lastSeenAt.x - startedAt.x
        const vY = lastSeenAt.y - startedAt.y

        const gvx = Math.min(Math.abs(vX)/normTemplate, 1)
        const gvy = Math.min(Math.abs(vY)/normTemplate, 1)
        return {x: Utils.normalizeValue(vX) * gvx, y: Utils.normalizeValue(vY) * gvy}
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
        const gest = getGestureVelocity(e)
        const magnitude = Math.sqrt(gest.x*gest.x + gest.y*gest.y)
        if (magnitude === 0) return
        self.emit('touchMove', magnitude, Utils.normalizeValue(gest.x))
    }

    const onTouchEnd = (e) => {
        // if (Date.now() - fsDoubleClick < 200) {
        //     if (fs) {
        //         document.exitFullscreen()
        //         fs = false
        //     } else {
        //         window.document.documentElement.requestFullscreen()
        //         fs = true
        //     }
        // }
        fsDoubleClick = Date.now()
        e.preventDefault()

        self.emit('touchEnded', getGestureVelocity(e))
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
        if (e.keyCode === 49) {
            window.debugMenu.toggle()
        }
    }

    return self
}