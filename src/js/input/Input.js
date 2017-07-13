
export const Input = (canvas, onReleaseTouch, isMobile, debug) => {

    const getX = (e) => {
        if (isMobile()) {
            return e.touches.item(0).clientX
        }
        return e.clientX
    }
    const getY = (e) => {
        if (isMobile()) {
            return e.touches.item(0).clientY
        }
        return e.clientY
    }

    const startedAt = {x: Number.NaN, y: Number.NaN}
    const lastSeenAt = {x: Number.NaN, y: Number.NaN}
    const onTouchStart = (e) => {
        e.preventDefault()
        // console.log(getX(e), getY(e))
        startedAt.x = getX(e)
        startedAt.y = getY(e)
    }

    const onTouchMove = (e) => {
        e.preventDefault()
        if (Number.isNaN(startedAt.x)) return
        lastSeenAt.x = getX(e)
        lastSeenAt.y = getY(e)

        debug.clear()
        debug.lineStyle(2, 0xFF00FF)
        debug.moveTo(50, 100)
        debug.lineTo(50 + (lastSeenAt.x - startedAt.x), 100 + (lastSeenAt.y - startedAt.y))
    }

    const onTouchEnd = (e) => {
        e.preventDefault()
        onReleaseTouch({x: (lastSeenAt.x - startedAt.x)/2000, y: (lastSeenAt.y - startedAt.y)/2000})

        startedAt.x = startedAt.y = lastSeenAt.x = lastSeenAt.y = Number.NaN
    }

    canvas.ontouchstart = onTouchStart
    canvas.ontouchmove = onTouchMove
    canvas.ontouchend = onTouchEnd

    canvas.onmousedown = onTouchStart
    canvas.onmousemove = onTouchMove
    canvas.onmouseup = onTouchEnd

    return {
        get emitter() {},
        update: () => {

        }
    }
}